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
parentOpportunityMap = {};
parentOpportunityRpdeMap = {};
opportunityMap = {};
opportunityRpdeMap = {};

nSQL().createDatabase({
  tables: [
    {
      name: "ParentOpportunity",
      model: {
        "id:int": { pk: true },
        "modified:int": {},
        "deleted:bool": {},
        "jsonLdId:string": {},
        "feedModified:int": {},
        "jsonLd:obj": {}
      },
      indexes: {
        "feedModified:int": {},
        "jsonLdId:string": {}
      }
    },
    {
      name: "Opportunity",
      model: {
        "id:int": { pk: true },
        "modified:int": {},
        "deleted:bool": {},
        "jsonLdId:string": {},
        "feedModified:int": {},
        "jsonLdType:string": {},
        "jsonLd:obj": {},
        "jsonLdParentId:string": {},
        "parentIngested:bool": {}
      },
      indexes: {
        "jsonLdParentId:string": {
          /*  foreignKey: { // foreign key property
                      target: "ParentOpportunity.jsonLdId" // parent Table.column or Table.nested.column
                  }*/
        },
        "feedModified:int": {},
        "jsonLdId:string": {}
      }
    }
  ]
});

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


      cb(json);
    } else if (response.statusCode === 404) {
      console.log(`Not Found error for RPDE feed "${url}", feed will be ignored: ${error}.`);
      // Stop polling feed
    } else {
      console.log(`Error ${response.statusCode} for RPDE page "${url}": ${error}. Response: ${body}`);
      // Fake next page to force retry, after a delay
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
  if (opportunityMap[opportunityId] && parentOpportunityMap[opportunityMap[opportunityId].superEvent || opportunityMap[opportunityId].facilityUse]) {
    return Object.assign(
      {},
      opportunityMap[opportunityId],
      { 
        superEvent: parentOpportunityMap[opportunityMap[opportunityId].superEvent],
        facilityUse: parentOpportunityMap[opportunityMap[opportunityId].facilityUse]
      }
    )
  }
}

app.get("/feeds/opportunities", function(req, res) {
  var afterId = null;
  var afterTimestamp = null;
  if (req.query && req.query.afterId && req.query.afterTimestamp) {
    afterId = req.query.afterId;
    afterTimestamp = parseInt(req.query.afterTimestamp);
  }

  var baseUrl = "http://localhost:" + PORT + "/feeds/opportunities";
  var PAGE_SIZE = 500;

  nSQL("Opportunity")
    .query("select", [
      "jsonLdId",
      "deleted",
      "feedModified",
      "jsonLd",
      "jsonLdParentId",
      "jsonLdType"
      // "ParentOpportunity.jsonLd",
      //"ParentOpportunity.jsonLdId",
    ])
    .where(
      afterTimestamp != null
        ?
        [ 
          ["parentIngested", "=", true],
          "AND",
          [
            [
              [
                ["feedModified", "=", afterTimestamp],
                "AND",
                ["jsonLdId", ">", afterId]
              ],
              "OR",
              ["feedModified", ">", afterTimestamp]
            ],
            "AND",
            ["feedModified", "<=", Date.now()] // Only show items that have been updated and are ready for display
          ]
        ]
        :
        ["parentIngested", "=", true]
    )
    .orderBy({ feedModified: "asc", jsonLdId: "asc" })
    .limit(PAGE_SIZE)
    /*.join({
  type: "left",
  with: {table: "ParentOpportunity"},
  on: ["jsonLdParentId","=","ParentOpportunity.jsonLdId"]
})*/ .exec()
    .then(rows => {
      if (rows.length > 0) {
        var aggregatedRows = [];
        var lastId = rows[rows.length - 1]["jsonLdId"];
        var lastTimestamp = parseInt(rows[rows.length - 1]["feedModified"]);
        res.json({
          next:
            baseUrl +
            "?afterTimestamp=" +
            lastTimestamp +
            "&afterId=" +
            encodeURIComponent(lastId),
          items: rows.map(row => ({
            state: row["deleted"] ? "deleted" : "updated",
            id: row["jsonLdId"],
            modified: row["feedModified"],
            data: Object.assign(
              {},
              row["jsonLd"],
              row["jsonLdType"] == "slot" ? // Note parentOpportunityMap used as much faster than nSQL join
              { facilityUse: parentOpportunityMap[row["jsonLdParentId"]] } :
              { superEvent: parentOpportunityMap[row["jsonLdParentId"]] }
            )
          })),
          license: "https://creativecommons.org/licenses/by/4.0/"
        });
        res.end();
      } else {
        res.json({
          next:
            baseUrl +
            (afterTimestamp == null
              ? ""
              : "?afterTimestamp=" +
                afterTimestamp +
                "&afterId=" +
                encodeURIComponent(afterId)),
          items: [],
          license: "https://creativecommons.org/licenses/by/4.0/"
        });
        res.end();
      }
    });
});

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
getRPDE("http://localhost:" + PORT + "/feeds/opportunities", monitorPage);

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

  var newItems = rpde.items.map(item => ({
    id: item.id,
    modified: item.modified,
    deleted: item.state == "deleted",
    feedModified: Date.now() + 1000, // 1 second in the future
    jsonLdId: item.state == "deleted" ? null : item.data['@id'] || item.data['id'],
    jsonLd: item.state == "deleted" ? null : item.data
  }));

  rpde.items.forEach(item => {
    if (item.state == "deleted") {
      var jsonLdId = parentOpportunityRpdeMap[item.id];
      delete parentOpportunityMap[jsonLdId];
      delete parentOpportunityRpdeMap[item.id];
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      parentOpportunityRpdeMap[item.id] = jsonLdId;
      parentOpportunityMap[jsonLdId] = item.data;
    }
  });

  nSQL("ParentOpportunity")
    .query("upsert", newItems)
    .exec()
    .then(() => {
      // Update any children that reference this parent
      nSQL("Opportunity")
        .query("upsert", {
          feedModified: Date.now() + 1000, // 1 second in the future
          parentIngested: true
        })
        .where([
          "jsonLdParentId",
          "IN",
          rpde.items
            .filter(item => item.state != "deleted")
            .map(item => item.data['@id'] || item.data['id'])
        ])
        .exec()
        .then(() => {
          setTimeout(
            x =>
              getRPDE(rpde.next, x =>
                ingestParentOpportunityPage(x, pageNumber + 1 || 0)
              ),
            200
          );
        });
    });
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
      var jsonLdId = opportunityRpdeMap[item.id];
      delete opportunityMap[jsonLdId];
      delete opportunityRpdeMap[item.id];
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      opportunityRpdeMap[item.id] = jsonLdId;
      opportunityMap[jsonLdId] = item.data;
    }
  });

  nSQL("Opportunity")
    .query(
      "upsert",
      rpde.items.map(item => ({
        id: item.id,
        modified: item.modified,
        deleted: item.state == "deleted",
        feedModified: Date.now() + 1000, // 1 second in the future,
        jsonLdId: item.state == "deleted" ? null : item.data['@id'] || item.data['id'],
        jsonLd: item.state == "deleted" ? null : item.data,
        jsonLdType: item.state == "deleted" ? null : item.data['@type'] || item.data['type'],
        jsonLdParentId: item.state == "deleted" ? null : item.data.superEvent || item.data.facilityUse,
        parentIngested: item.state == "deleted" ? false : typeof parentOpportunityMap[item.data.superEvent] !== "undefined" || typeof parentOpportunityMap[item.data.facilityUse] !== "undefined"
      }))
    )
    .exec()
    .then(() => {
      setTimeout(
        x =>
          getRPDE(rpde.next, x =>
            ingestOpportunityPage(x, pageNumber + 1 || 0)
          ),
        200
      );
    });
}

function monitorPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    console.log(
      `RPDE kind: Opportunity Monitoring, length: ${rpde.items.length}, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    if (item.data) {
      var id = item.data['@id'] || item.data['id'];
      var type = item.data['@type'] || item.data['type']; 

      // Check for bookability
      var startDate = item.data.startDate;
      var offers = item.data.offers || item.data.superEvent.offers; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
      var remainingCapacity = item.data.remainingAttendeeCapacity || item.data.remainingUses;
      var eventStatus = item.data.eventStatus;

      var bookableOffers = offers ? offers.filter(x =>
         (!x.availableChannel || x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
         && x.advanceBooking != "https://openactive.io/Unavailable"
         && (!x.validFromBeforeStartDate || moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore())
      ) : [];

      if (!bookableOpportunityIds[type]) bookableOpportunityIds[type] = [];

      var isBookable = false;

      if (
        Date.parse(startDate) > new Date(Date.now() + ( 3600 * 1000 * 24))
        && bookableOffers.length > 0
        && remainingCapacity > 0
        && !(eventStatus == "https://schema.org/EventCancelled" || eventStatus == "https://schema.org/EventPostponed")
      ) {
        // Add ID to if now bookable
        bookableOpportunityIds[type].push(id);
        isBookable = true;
      } else {
        // Remove ID if no longer bookable
        var ids = bookableOpportunityIds[type];
        var index = ids.indexOf(id);
        if (index !== -1) ids.splice(index, 1);
        isBookable = false;
      }

      if (responses[id]) {
        responses[id].send(item);

        console.log(`seen ${isBookable ? "bookable " : ""}and dispatched ${id}`);
      } else {
        console.log(`saw ${isBookable ? "bookable " : ""}${id}`);
      }
    }
  });

  setTimeout(x => getRPDE(rpde.next, monitorPage), 200);
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
