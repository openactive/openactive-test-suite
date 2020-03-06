var express = require("express");
var logger = require("morgan");
var request = require("request");
var nSQL = require("@nano-sql/core").nSQL;
var moment = require("moment");
const config = require("config");

var PORT = 3000;
var BOOKING_API_BASE = config.get("microservice.pollOrdersBookingFeed") ? config.get("microservice.bookingApiBase") : null;
var FEED_BASE = config.get("microservice.openFeedBase");
var REQUEST_LOGGING_ENABLED = config.get("requestLogging");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.env["PORT"] = 3000;

var app = express();

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger("dev"));
}
app.use(express.json());

// nSQL joins appear to be slow, even with indexes. This is an optimisation pending further investigation
parentOpportunityMap = new Map();
parentOpportunityRpdeMap = new Map();
opportunityMap = new Map();
opportunityRpdeMap = new Map();
rowStoreMap = new Map();
parentIdIndex = new Map();


function getRPDE(url, cb) {
  var headers = {
    Accept:
      "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "X-OpenActive-Test-Client-Id": "test"
  };
  var options = {
    url: url,
    method: "get",
    headers: headers
  };
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var json = JSON.parse(body);

      // Validate RPDE base URL
      if (!json.next) {
        throw "RPDE does not have 'next' property";
      }
      if (getBaseUrl(json.next) != getBaseUrl(url)) {
        throw `Base URL of RPDE 'next' property ("${getBaseUrl(json.next)}") does not match base URL of RPDE page ("${url}")`;
      }

      if (json.next == url && json.items.length == 0) {
        console.log(`Sleep mode poll for RPDE feed "${url}"`);
        setTimeout(x => getRPDE(url, cb), 500);
      } else {
        cb(json);
      }
    } else if (!response) {
      console.log(`Error for RPDE feed "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(x => getRPDE(url, cb), 5000);
    } else if (response.statusCode === 404) {
      console.log(`Not Found error for RPDE feed "${url}", feed will be ignored: ${error}.`);
      // Stop polling feed
    } else {
      console.log(`Error ${response.statusCode} for RPDE page "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(x => getRPDE(url, cb), 5000);
    }
  });
}

function getBaseUrl(url) {
  if (url.indexOf("//") > -1) {
    return url.substring(0, url.indexOf("/", url.indexOf("//") + 2));
  } else {
    throw "RPDE 'next' property MUST be an absolute URL";
  }
}

var bookableOpportunityIds = {};

function getRandomBookableOpportunity(type) {
  var recognisedTypes = Object.keys(bookableOpportunityIds).filter(x => bookableOpportunityIds[x].length > 0);
  if (recognisedTypes.length == 0) return null;

  // If type not provided, select one at random from available types
  if (!type) type = recognisedTypes[Math.floor(Math.random() * recognisedTypes.length)];

  if (!bookableOpportunityIds[type] || bookableOpportunityIds[type].length == 0) return null;

  var id = bookableOpportunityIds[type][Math.floor(Math.random() * bookableOpportunityIds[type].length)];

  return { 
    "@context": "https://openactive.io/",
    "@type": type,
    "@id": id
  }
}

function getOpportunityById(opportunityId) {
  var opportunity = opportunityMap.get(opportunityId);
  if (opportunity && parentOpportunityMap.has(opportunity.superEvent || opportunity.facilityUse)) {
    return Object.assign(
      {},
      opportunity,
      { 
        superEvent: parentOpportunityMap.get(opportunity.superEvent),
        facilityUse: parentOpportunityMap.get(opportunity.facilityUse)
      }
    )
  }
}

var responses = {
  /* Keyed by expression =*/
};

app.get("/health-check", function(req, res) {
  res.send("openactive-broker");
});

function getMatch(req, res, useCache) {
  // respond with json
  if (req.params.id) {
    var id = req.params.id;

    var cachedResponse = getOpportunityById(id);

    if (useCache && cachedResponse) {
      console.log("used cached response for " + id);
      res.json({ data: cachedResponse });
      res.end();
      
    } else {
      console.log("listening for " + id);

      // Stash the response and reply later when an event comes through (kill any existing id still waiting)
      if (responses[id] && responses[id] !== null)
        responses[id].end();
      responses[id] = {
        send: function(json) {
          responses[id] = null;
          res.json(json);
          res.end();
        },
        end: function() {
          res.end();
        },
        res
      };
    }

  } else {
    res.send("id not valid");
  }
}

app.get("/get-cached-opportunity/:id", function(req, res) {
  getMatch(req, res, true);
});

app.get("/get-opportunity/:id", function(req, res) {
  getMatch(req, res, false);
});

app.get("/get-random-opportunity", function(req, res) {
  var typeFilter = null;
  if (req.query && req.query.type) {
    typeFilter = req.query.type;
  }

  var randomOpportunity = getRandomBookableOpportunity(typeFilter);
  if (randomOpportunity) {
    console.log(`Random Bookable Opportunity (${randomOpportunity['@type']}): ${randomOpportunity['@id']}`);
    res.json(randomOpportunity);
    res.end();
  } else {
    if (typeFilter == null) {
      console.error(`Random Bookable Opportunity call failed: No bookable opportunities have been found`);
      res.status(404).send(`No bookable opportunities have been found`);
    } else {
      console.error(`Random Bookable Opportunity call failed: Opportunity Type "${typeFilter}" Not found`);
      res.status(404).send(`Opportunity Type "${typeFilter}" Not found`);
    }
  }
});

var orderResponses = {
  /* Keyed by expression =*/
};

app.get("/get-order/:expression", function(req, res) {
  // respond with json
  if (req.params.expression) {
    var expression = req.params.expression;

    // Stash the response and reply later when an event comes through (kill any existing expression still waiting)
    if (orderResponses[expression] && orderResponses[expression] !== null)
      orderResponses[expression].end();
    orderResponses[expression] = {
      send: function(json) {
        orderResponses[expression] = null;
        res.json(json);
        res.end();
      },
      end: function() {
        res.end();
      },
      res
    };
  } else {
    res.send("Expression not valid");
  }
});

// Start processing first pages of external feeds
getRPDE(FEED_BASE + "session-series", ingestParentOpportunityPage);
getRPDE(FEED_BASE + "scheduled-sessions", ingestOpportunityPage);
getRPDE(FEED_BASE + "facility-uses", ingestParentOpportunityPage);
getRPDE(FEED_BASE + "facility-use-slots", ingestOpportunityPage);
getRPDE(FEED_BASE + "events", ingestOpportunityPage);
getRPDE(FEED_BASE + "headline-events", ingestOpportunityPage);
getRPDE(FEED_BASE + "courses", ingestOpportunityPage);

// Start monitoring first page of internal feed
//getRPDE("http://localhost:" + PORT + "/feeds/opportunities", monitorPage);

// Only poll orders feed if enabled
if (BOOKING_API_BASE != null)
  getRPDE(BOOKING_API_BASE + "orders-rpde", monitorOrdersPage);


function ingestParentOpportunityPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    var kind = rpde.items && rpde.items[0] && rpde.items[0].kind;
    console.log(
      `RPDE kind: ${kind}, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    if (item.state == "deleted") {
      var jsonLdId = parentOpportunityRpdeMap.get(item.id);
      parentOpportunityMap.delete(jsonLdId);
      parentOpportunityRpdeMap.delete(item.id);
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      parentOpportunityRpdeMap.set(item.id, jsonLdId);
      parentOpportunityMap.set(jsonLdId, item.data);
    }
  });

  // As these parent opportunities have been updated, update all child items for these parent IDs
  touchOpportunityItems(rpde.items
    .filter(item => item.state != "deleted")
    .map(item => item.data['@id'] || item.data['id']));

  setTimeout(
    x =>
      getRPDE(rpde.next, x =>
        ingestParentOpportunityPage(x, pageNumber + 1 || 0)
      ),
    200
  );
}

function ingestOpportunityPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    var kind = rpde.items && rpde.items[0] && rpde.items[0].kind;
    console.log(
      `RPDE kind: ${kind}, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    if (item.state == "deleted") {
      var jsonLdId = opportunityRpdeMap.get(item.id);
      opportunityMap.delete(jsonLdId);
      opportunityRpdeMap.delete(item.id);

      deleteOpportunityItem(jsonLdId);
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      opportunityRpdeMap.set(item.id, jsonLdId);
      opportunityMap.set(jsonLdId, item.data);

      storeOpportunityItem(item);
    }
  });

  setTimeout(
    x =>
      getRPDE(rpde.next, x =>
        ingestOpportunityPage(x, pageNumber + 1 || 0)
      ),
    200
  );
}

function touchOpportunityItems(parentIds) {
  var opportunitiesToUpdate = new Set();

  parentIds.forEach(parentId => {
    if (parentIdIndex.has(parentId)) {
      parentIdIndex.get(parentId).forEach(jsonLdId => {
        opportunitiesToUpdate.add(jsonLdId);
      });
    }
  })

  opportunitiesToUpdate.forEach(jsonLdId => {
    if (rowStoreMap.has(jsonLdId)) {
      var row = rowStoreMap.get(jsonLdId);
      row.feedModified = Date.now() + 1000; // 1 second in the future
      row.parentIngested = true;
      processRow(row);
    }
  });
}

function deleteOpportunityItem(jsonLdId) {
  var row = rowStoreMap.get(jsonLdId);
  if (row) {
    var idx = parentIdIndex.get(row.jsonLdParentId);
    if (idx) {
      idx.delete(jsonLdId);
    }
    rowStoreMap.delete(jsonLdId);
  }
}

function storeOpportunityItem(item) {
  var row = {
    id: item.id,
    modified: item.modified,
    deleted: item.state == "deleted",
    feedModified: Date.now() + 1000, // 1 second in the future,
    jsonLdId: item.state == "deleted" ? null : item.data['@id'] || item.data['id'],
    jsonLd: item.state == "deleted" ? null : item.data,
    jsonLdType: item.state == "deleted" ? null : item.data['@type'] || item.data['type'],
    jsonLdParentId: item.state == "deleted" ? null : item.data.superEvent || item.data.facilityUse,
    parentIngested: item.state == "deleted" ? false : parentOpportunityMap.has(item.data.superEvent) || parentOpportunityMap.has(item.data.facilityUse)
  };

  if (row.jsonLdParentId != null && row.jsonLdId != null) {
    if (!parentIdIndex.has(row.jsonLdParentId)) parentIdIndex.set(row.jsonLdParentId, new Set());
    parentIdIndex.get(row.jsonLdParentId).add(item.jsonLdId);
  }

  rowStoreMap.set(row.jsonLdId, row);

  if (row.parentIngested) {
    processRow(row);
  }
}

function processRow(row) {
  var newItem = {
    state: row["deleted"] ? "deleted" : "updated",
    id: row["jsonLdId"],
    modified: row["feedModified"],
    data: Object.assign(
      {},
      row["jsonLd"],
      row["jsonLdType"] == "Slot" ?
      { facilityUse: parentOpportunityMap.get(row["jsonLdParentId"]) } :
      { superEvent: parentOpportunityMap.get(row["jsonLdParentId"]) }
    )
  };

  processOpportunityItem(newItem);
}

function processOpportunityItem(item) {
    if (item.data) {
      var id = item.data['@id'] || item.data['id'];
      var type = item.data['@type'] || item.data['type']; 

      // Check for bookability
      var startDate = item.data.startDate;
      var offers = item.data.offers || (item.data.superEvent && item.data.superEvent.offers); // Note FacilityUse does not have bookable offers, as it does not allow inheritance
      var remainingCapacity = item.data.remainingAttendeeCapacity || item.data.remainingUses;
      var eventStatus = item.data.eventStatus;

      var bookableOffers = offers ? offers.filter(x =>
         (!x.availableChannel || x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
         && x.advanceBooking != "https://openactive.io/Unavailable"
         && (!x.validFromBeforeStartDate || moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore())
      ) : [];

      if (!bookableOpportunityIds[type]) bookableOpportunityIds[type] = [];

      var isBookable = true;
      var isBookableIssues = [];

      if (
        !(Date.parse(startDate) > new Date(Date.now() + ( 3600 * 1000 * 2)))
      ) {
        isBookable = false;
        isBookableIssues.push("Start date must be 2hrs in advance for random tests to use")
      }

      if (
        !(bookableOffers.length > 0)
      ) {
        isBookable = false;
        isBookableIssues.push("No bookable Offers")
      }

      if (
        !(remainingCapacity > 0)
      ) {
        isBookable = false;
        isBookableIssues.push("No remaining capacity")
      }

      if (
        (eventStatus == "https://schema.org/EventCancelled" || eventStatus == "https://schema.org/EventPostponed")
      ) {
        isBookable = false;
        isBookableIssues.push("Cancelled or Postponed")
      }

      var bookableIssueList = "";

      if (isBookable) {
        // Add ID to if now bookable
        bookableOpportunityIds[type].push(id);
      } else {
        // Remove ID if no longer bookable
        var ids = bookableOpportunityIds[type];
        var index = ids.indexOf(id);
        if (index !== -1) ids.splice(index, 1);

        bookableIssueList = "\n   [Not Bookable: " + isBookableIssues.join(', ') + "]";
      }

      if (responses[id]) {
        responses[id].send(item);

        console.log(`seen ${isBookable ? "bookable " : ""}and dispatched ${id}${bookableIssueList}`);
      } else {
        console.log(`saw ${isBookable ? "bookable " : ""}${id}${bookableIssueList}`);
      }
    }
}

function monitorOrdersPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    console.log(
      `RPDE kind: Orders Monitoring, length: ${rpde.items.length}, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    if (item.data && item.id && orderResponses[item.id]) {
      orderResponses[item.id].send(item);
    }
  });

  setTimeout(x => getRPDE(rpde.next, monitorOrdersPage), 200);
}

app.listen(PORT, "127.0.0.1");
console.log("Node server running on port " + PORT);
