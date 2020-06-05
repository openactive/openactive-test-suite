const express = require("express");
const logger = require("morgan");
const request = require("request");
const axios = require("axios");
const nSQL = require("@nano-sql/core").nSQL;
const moment = require("moment");
const config = require("config");
const criteria = require("./criteria").criteria.map(x => new x());
const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');

var PORT = 3000;
var DATASET_SITE_URL = config.get("datasetSiteUrl");
var REQUEST_LOGGING_ENABLED = config.get("requestLogging");
var WAIT_FOR_HARVEST = config.get("waitForHarvestCompletion");
var ORDERS_FEED_REQUEST_HEADERS = config.get("ordersFeedRequestHeaders");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.env["PORT"] = 3000;

var app = express();

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger("dev"));
}
app.use(express.json());

// nSQL joins appear to be slow, even with indexes. This is an optimisation pending further investigation
const parentOpportunityMap = new Map();
const parentOpportunityRpdeMap = new Map();
const opportunityMap = new Map();
const opportunityRpdeMap = new Map();
const rowStoreMap = new Map();
const parentIdIndex = new Map();

let datasetSiteJson = {};

// Buckets for criteria matches
var matchingCriteriaOpportunityIds = new Map();
criteria.map(criteria => criteria.name).forEach(criteriaName => {
  var typeBucket = new Map();
  [
    'ScheduledSession',
    'FacilityUseSlot',
    'IndividualFacilityUseSlot',
    'CourseInstance',
    'HeadlineEvent',
    'Event',
    'HeadlineEventSubEvent',
    'CourseInstanceSubEvent',
    'OnDemandEvent'
  ].forEach(x => typeBucket.set(x, new Map()));
  matchingCriteriaOpportunityIds.set(criteriaName, typeBucket);
});

var testDatasets = new Map();
function getTestDataset(testDatasetIdentifier) {
  if (!testDatasets.has(testDatasetIdentifier)) {
    testDatasets.set(testDatasetIdentifier, new Set());
  }
  return testDatasets.get(testDatasetIdentifier);
}

function getAllDatasets() {
  return new Set(Array.from(testDatasets.values()).flatMap(x => Array.from(x.values())));
}

function getRPDE(url, headers, cb) {
  var options = {
    url: url,
    method: "get",
    headers: Object.assign({}, {
      Accept: "application/json, application/vnd.openactive.booking+json; version=1",
      "Cache-Control": "max-age=0"
    }, headers)
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
        if (WAIT_FOR_HARVEST) {
          feedUpToDate(url);
        } else {
          console.log(`Sleep mode poll for RPDE feed "${url}"`);
        }
        setTimeout(x => getRPDE(url, headers, cb), 500);
      } else {
        cb(json, headers);
      }
    } else if (!response) {
      console.log(`Error for RPDE feed "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(x => getRPDE(url, headers, cb), 5000);
    } else if (response.statusCode === 404) {
      if (WAIT_FOR_HARVEST) feedUpToDate(url);
      console.log(`Not Found error for RPDE feed "${url}", feed will be ignored: ${error}.`);
      // Stop polling feed
    } else {
      console.log(`Error ${response.statusCode} for RPDE page "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(x => getRPDE(url, headers, cb), 5000);
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

function getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier) {
  var criteriaBucket = matchingCriteriaOpportunityIds.get(criteriaName);
  if (!criteriaBucket) throw new Error('The specified testOpportunityCriteria is not currently supported.');
  var bucket = criteriaBucket.get(opportunityType);
  if (!bucket) throw new Error('The specified opportunity type is not currently supported.');
  var sellerCompartment = bucket.get(sellerId);
  if (!sellerCompartment) return { sellers: Array.from(bucket.keys()) }; // Seller has no items
  
  var testDatasets = getAllDatasets();
  var unusedBucketItems = Array.from(sellerCompartment).filter(x => !testDatasets.has(x));
  
  if (unusedBucketItems.length == 0) return null;

  var id = unusedBucketItems[Math.floor(Math.random() * unusedBucketItems.length)];

  // Add the item to the testDataset to ensure it does not get reused
  getTestDataset(testDatasetIdentifier).add(id);

  return {
    opportunity: { 
      "@context": "https://openactive.io/",
      "@type": getTypeFromOpportunityType(opportunityType),
      "@id": id
    }
  };
}

function releaseOpportunityLocks(testDatasetIdentifier) {
  var testDataset = getTestDataset(testDatasetIdentifier);
  console.log(`Cleared from dataset '${testDatasetIdentifier}': ${Array.from(testDataset).join(', ')}`)
  testDataset.clear();
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

const healthCheckResponsesWaitingForHarvest = [];
const incompleteFeeds = [];


function addFeed(feedUrl) {
  incompleteFeeds.push(feedUrl);
}

function feedUpToDate(feedNextUrl) {
  const queryStringIndex = feedNextUrl.indexOf('?');
  const feedUrl = queryStringIndex > -1 ? feedNextUrl.substring(0, queryStringIndex) : feedNextUrl;
  const index = incompleteFeeds.indexOf(feedUrl);
  if (index > -1) {
    // Remove the feed from the list
    incompleteFeeds.splice(index, 1);

    // If the list is now empty, trigger responses to healthcheck
    if (incompleteFeeds.length === 0) {
      healthCheckResponsesWaitingForHarvest.forEach(res => res.send("openactive-broker"));
    }  
  }
}

app.get("/health-check", function(req, res) {
  // Healthcheck response will block until all feeds are up-to-date, which is useful in CI environments
  // to ensure that the tests will not run until the feeds have been fully consumed
  if (!WAIT_FOR_HARVEST || incompleteFeeds.length === 0) {
    res.send("openactive-broker");
  } else {
    healthCheckResponsesWaitingForHarvest.push(res);
  }
});

app.get("/dataset-site", function(req, res) {
  res.send(datasetSiteJson);
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

function getTypeFromOpportunityType(opportunityType) {
  const mapping = {
    'ScheduledSession': 'ScheduledSession',
    'FacilityUseSlot': 'Slot',
    'IndividualFacilityUseSlot': 'Slot',
    'CourseInstance': 'CourseInstance',
    'HeadlineEvent': 'HeadlineEvent',
    'Event': 'Event',
    'HeadlineEventSubEvent': 'Event',
    'CourseInstanceSubEvent': 'Event',
    'OnDemandEvent': 'OnDemandEvent'
  };
  return mapping[opportunityType];
}

function detectSellerId(opportunity) {
  const organizer = opportunity.organizer || 
    (opportunity.superEvent && opportunity.superEvent.organizer) ||
    (opportunity.facilityUse && opportunity.facilityUse.provider);

  return organizer['@id'] || organizer['id']; 
}

function detectOpportunityType(opportunity) {
  switch (opportunity['@type'] || opportunity['type']) {
    case 'ScheduledSession':
      if (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent['type'])  === 'SessionSeries')
      {
        return 'ScheduledSession';
      } else
      {
        throw new Error("ScheduledSession must have superEvent of SessionSeries");
      }
    case 'Slot':
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse['type']) === 'IndividualFacilityUse')
      {
        return 'IndividualFacilityUseSlot';
      }
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse['type']) === 'FacilityUse')
      {
        return 'FacilityUseSlot';
      }
      else
      {
        throw new Error("Slot must have facilityUse of FacilityUse or IndividualFacilityUse");
      }
    case 'CourseInstance':
      return 'CourseInstance';
    case 'HeadlineEvent':
      return 'HeadlineEvent';
    case 'OnDemandEvent':
      return 'OnDemandEvent';
    case 'Event':
      switch (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent['type'])) {
        case 'HeadlineEvent':
          return 'HeadlineEventSubEvent';
        case 'CourseInstance':
          return 'CourseInstanceSubEvent';
        case 'EventSeries':
        case null:
          return 'Event';
        default:
          throw new Error("Event has unrecognised @type of superEvent");
      }
      break;
    default:
      throw new Error("Only bookable opportunities are permitted in the test interface");
  }
}

app.post("/test-interface/datasets/:testDatasetIdentifier/opportunities", function(req, res) {
  // Use :testDatasetIdentifier to ensure the same id is not returned twice
  var testDatasetIdentifier = req.params.testDatasetIdentifier;

  var opportunity = req.body;
  var opportunityType = detectOpportunityType(opportunity);
  var sellerId = detectSellerId(opportunity);
  var criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');

  var result = getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier);
  if (result && result.opportunity) {
    console.log(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${result.opportunity['@type']}): ${result.opportunity['@id']}`);
    res.json(result.opportunity);
    res.end();
  } else {
    console.error(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${opportunityType}) call failed: No matching opportunities found`);
    res.status(404).send(`Opportunity Type '${opportunityType}' Not found from seller ${sellerId} for ${criteriaName}.\n\nSellers available:\n${result && result.sellers && result.sellers.length > 0 ? result.sellers.join('\n') : 'none'}.`);
  }
});

app.delete("/test-interface/datasets/:testDatasetIdentifier", function(req, res) {
  // Use :testDatasetIdentifier to identify locks, and clear them
  var testDatasetIdentifier = req.params.testDatasetIdentifier;
  releaseOpportunityLocks(testDatasetIdentifier);
  res.status(204).send();
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


function ingestParentOpportunityPage(rpde, headers, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    var kind = rpde.items && rpde.items[0] && rpde.items[0].kind;
    console.log(
      `RPDE kind: ${kind}, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    // Remove nested @context
    delete item.data['@context'];
    
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
      getRPDE(rpde.next, headers, (x, headers) =>
        ingestParentOpportunityPage(x, headers, pageNumber + 1 || 0)
      ),
    200
  );
}

function ingestOpportunityPage(rpde, headers, pageNumber) {
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
      getRPDE(rpde.next, headers, (x, headers) =>
        ingestOpportunityPage(x, headers, pageNumber + 1 || 0)
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
      var opportunityType = detectOpportunityType(item.data); 
      var sellerId = detectSellerId(item.data);

      var matchingCriteria = [];
      var unmetCriteriaDetails = [];

      criteria.map(criteria => ({criteriaName: criteria.name, criteriaResult: criteria.testMatch(item.data)})).forEach(result => {
        const bucket = matchingCriteriaOpportunityIds.get(result.criteriaName).get(opportunityType);
        if (!bucket.has(sellerId)) bucket.set(sellerId, new Set());
        const sellerCompartment = bucket.get(sellerId);
        if (result.criteriaResult.matchesCriteria) {
          sellerCompartment.add(id);
          matchingCriteria.push(result.criteriaName);
        } else {
          sellerCompartment.delete(id);
          unmetCriteriaDetails = unmetCriteriaDetails.concat(result.criteriaResult.unmetCriteriaDetails);
        }
      });

      if (unmetCriteriaDetails.length > 0) {
        bookableIssueList = "\n   [Unmet Criteria: " + unmetCriteriaDetails.join(', ') + "]";
      }

      if (responses[id]) {
        responses[id].send(item);

        console.log(`seen ${matchingCriteria.join(', ')} and dispatched ${id}${bookableIssueList}`);
      } else {
        console.log(`saw ${matchingCriteria.join(', ')} ${id}${bookableIssueList}`);
      }
    }
}

function monitorOrdersPage(rpde, headers, pageNumber) {
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

  setTimeout(x => getRPDE(rpde.next, headers, monitorOrdersPage), 200);
}


function extractJSONLDfromHTML(url, html) {
  let jsonld = null;

  const handler = new Handler(
    (err, result) => {
      if (!err && typeof result === 'object') {
        const jsonldArray = result.jsonld;
        // Use the first JSON-LD block on the page
        if (Array.isArray(jsonldArray) && jsonldArray.length > 0) {
          [jsonld] = jsonldArray;
        }
      }
    },
    {
      url, // The HTML pages URL is used to resolve relative URLs. TODO: Remove this
    },
  );

  // Create a HTML parser with the handler.
  const parser = new Parser(handler, { decodeEntities: true });
  parser.write(html);
  parser.done();

  return jsonld;
};

async function extractJSONLDfromDatasetSiteUrl(url) {
  let response = await axios.get(url);

  var jsonld = extractJSONLDfromHTML(url, response.data);
  return jsonld;
}



async function startPolling() {

  let dataset = await extractJSONLDfromDatasetSiteUrl(DATASET_SITE_URL);

  console.log("Dataset Site JSON-LD: " + JSON.stringify(dataset, null, 2));

  datasetSiteJson = dataset;

  if (!dataset || !Array.isArray(dataset.distribution)) {
    throw new Error("Unable to read valid JSON-LD from Dataset Site. Please try loading the Dataset Site URL in validator.openactive.io to confirm it is valid.");
  }

  dataset.distribution.forEach(dataDownload => {
    addFeed(dataDownload.contentUrl);
    if (dataDownload.additionalType === 'https://openactive.io/SessionSeries'
      || dataDownload.additionalType === 'https://openactive.io/FacilityUse') {
      console.log("Found parent opportunity feed: " + dataDownload.contentUrl);
      getRPDE(dataDownload.contentUrl, {}, ingestParentOpportunityPage);
    } else {
      console.log("Found opportunity feed: " + dataDownload.contentUrl);
      getRPDE(dataDownload.contentUrl, {}, ingestOpportunityPage);
    }
  });

  // Only poll orders feed if included in the dataset site
  if (dataset.accessService && dataset.accessService.endpointURL) {
    console.log("Found orders feed: " + dataset.accessService.endpointURL);
    getRPDE(dataset.accessService.endpointURL + "orders-rpde", ORDERS_FEED_REQUEST_HEADERS, monitorOrdersPage);
  }
}

app.listen(PORT, "127.0.0.1");
console.log("Node server running on port " + PORT);

(async () => {
  await startPolling();
})();