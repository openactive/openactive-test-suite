/* eslint-disable no-use-before-define */
const express = require('express');
const logger = require('morgan');
const request = require('request');
const axios = require('axios');
const config = require('config');
const { criteria } = require('@openactive/test-interface-criteria');
const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');
const chalk = require('chalk');

const DATASET_SITE_URL = config.get('datasetSiteUrl');
const WAIT_FOR_HARVEST = config.has('waitForHarvestCompletion') ? config.get('waitForHarvestCompletion') : false;
const REQUEST_LOGGING_ENABLED = config.has('requestLogging') ? config.get('requestLogging') : false;
const ORDERS_FEED_REQUEST_HEADERS = config.has('ordersFeedRequestHeaders') ? config.get('ordersFeedRequestHeaders') : {
};
const VERBOSE = config.has('verbose') ? config.get('verbose') : false;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const app = express();

// eslint-disable-next-line no-console
const logError = x => console.error(chalk.cyanBright(x));
// eslint-disable-next-line no-console
const log = x => console.log(chalk.cyan(x));

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger('dev'));
}
app.use(express.json());

// nSQL joins appear to be slow, even with indexes. This is an optimisation pending further investigation
const parentOpportunityMap = new Map();
const parentOpportunityRpdeMap = new Map();
const opportunityMap = new Map();
const opportunityRpdeMap = new Map();
const rowStoreMap = new Map();
const parentIdIndex = new Map();

const startTime = new Date();

let datasetSiteJson = {
};

// Buckets for criteria matches
const matchingCriteriaOpportunityIds = new Map();
criteria.map(c => c.name).forEach((criteriaName) => {
  const typeBucket = new Map();
  [
    'ScheduledSession',
    'FacilityUseSlot',
    'IndividualFacilityUseSlot',
    'CourseInstance',
    'HeadlineEvent',
    'Event',
    'HeadlineEventSubEvent',
    'CourseInstanceSubEvent',
    'OnDemandEvent',
  ].forEach(x => typeBucket.set(x, new Map()));
  matchingCriteriaOpportunityIds.set(criteriaName, typeBucket);
});

const feedContextMap = new Map();

const testDatasets = new Map();
function getTestDataset(testDatasetIdentifier) {
  if (!testDatasets.has(testDatasetIdentifier)) {
    testDatasets.set(testDatasetIdentifier, new Set());
  }
  return testDatasets.get(testDatasetIdentifier);
}

function getAllDatasets() {
  return new Set(Array.from(testDatasets.values()).flatMap(x => Array.from(x.values())));
}

function getRPDE(url, contextIdentifier, cb) {
  const context = feedContextMap.get(contextIdentifier);
  const options = {
    url,
    method: 'get',
    headers: Object.assign({
    }, {
      Accept: 'application/json, application/vnd.openactive.booking+json; version=1',
      'Cache-Control': 'max-age=0',
    }, context.headers || {
    }),
    time: true,
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let json;
      try {
        json = JSON.parse(body);
      } catch (ex) {
        logError(`Invalid Json from "${url}" recieved "${body}" throwing ${ex}`);
        throw new Error('Deserialization error');
      }
      // Validate RPDE base URL
      if (!json.next) {
        throw new Error("RPDE does not have 'next' property");
      }
      if (getBaseUrl(json.next) !== getBaseUrl(url)) {
        throw new Error(`(Base URL of RPDE 'next' property ("${getBaseUrl(json.next)}") does not match base URL of RPDE page ("${url}")`);
      }

      context.currentPage = url;
      if (json.next === url && json.items.length === 0) {
        if (WAIT_FOR_HARVEST) {
          feedUpToDate(url);
        } else if (VERBOSE) log(`Sleep mode poll for RPDE feed "${url}"`);
        context.sleepMode = true;
        if (context.timeToHarvestCompletion === undefined) context.timeToHarvestCompletion = millisToMinutesAndSeconds(new Date() - startTime);
        setTimeout(() => getRPDE(url, contextIdentifier, cb), 500);
      } else {
        context.responseTimes.push(response.elapsedTime);
        // Maintain a buffer of the last 5 items
        if (context.responseTimes.length > 5) context.responseTimes.shift();
        context.pages += 1;
        context.items += json.items.length;
        delete context.sleepMode;
        cb(json, contextIdentifier);
      }
    } else if (!response) {
      log(`Error for RPDE feed "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(() => getRPDE(url, contextIdentifier, cb), 5000);
    } else if (response.statusCode === 404) {
      if (WAIT_FOR_HARVEST) feedUpToDate(url);
      log(`Not Found error for RPDE feed "${url}", feed will be ignored: ${error}.`);
      // Stop polling feed
    } else {
      log(`Error ${response.statusCode} for RPDE page "${url}": ${error}. Response: ${body}`);
      // Force retry, after a delay
      setTimeout(() => getRPDE(url, contextIdentifier, cb), 5000);
    }
  });
}

function getBaseUrl(url) {
  if (url.indexOf('//') > -1) {
    return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
  }
  throw new Error("RPDE 'next' property MUST be an absolute URL");
}

function getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier) {
  const criteriaBucket = matchingCriteriaOpportunityIds.get(criteriaName);
  if (!criteriaBucket) throw new Error('The specified testOpportunityCriteria is not currently supported.');
  const bucket = criteriaBucket.get(opportunityType);
  if (!bucket) throw new Error('The specified opportunity type is not currently supported.');
  const sellerCompartment = bucket.get(sellerId);
  if (!sellerCompartment) {
    return {
      sellers: Array.from(bucket.keys()),
    };
  } // Seller has no items

  const allTestDatasets = getAllDatasets();
  const unusedBucketItems = Array.from(sellerCompartment).filter(x => !allTestDatasets.has(x));

  if (unusedBucketItems.length === 0) return null;

  const id = unusedBucketItems[Math.floor(Math.random() * unusedBucketItems.length)];

  // Add the item to the testDataset to ensure it does not get reused
  getTestDataset(testDatasetIdentifier).add(id);

  return {
    opportunity: {
      '@context': 'https://openactive.io/',
      '@type': getTypeFromOpportunityType(opportunityType),
      '@id': id,
    },
  };
}

function releaseOpportunityLocks(testDatasetIdentifier) {
  const testDataset = getTestDataset(testDatasetIdentifier);
  log(`Cleared dataset '${testDatasetIdentifier}' of opportunity locks ${Array.from(testDataset).join(', ')}`);
  testDataset.clear();
}


function getOpportunityById(opportunityId) {
  const opportunity = opportunityMap.get(opportunityId);
  if (opportunity && parentOpportunityMap.has(opportunity.superEvent || opportunity.facilityUse)) {
    return Object.assign(
      {
      },
      opportunity,
      {
        superEvent: parentOpportunityMap.get(opportunity.superEvent),
        facilityUse: parentOpportunityMap.get(opportunity.facilityUse),
      },
    );
  }
  return null;
}

const responses = {
  /* Keyed by expression = */
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
      log('Harvesting is up-to-date');
      healthCheckResponsesWaitingForHarvest.forEach(res => res.send('openactive-broker'));
    }
  }
}

app.get('/health-check', function (req, res) {
  // Healthcheck response will block until all feeds are up-to-date, which is useful in CI environments
  // to ensure that the tests will not run until the feeds have been fully consumed
  if (!WAIT_FOR_HARVEST || incompleteFeeds.length === 0) {
    res.send('openactive-broker');
  } else {
    healthCheckResponsesWaitingForHarvest.push(res);
  }
});

app.get('/dataset-site', function (req, res) {
  res.send(datasetSiteJson);
});

function mapToObject(map) {
  if (map instanceof Map) {
    // Return a object representation of a Map
    return Object.assign(Object.create(null), ...[...map].map(v => (typeof v[1] === 'object' && v[1].size === 0 ? {
    } : {
      [v[0]]: mapToObject(v[1]),
    })));
  } if (map instanceof Set) {
    // Return just the size of a Set, to render at the leaf nodes of the resulting tree,
    // instead of outputting the whole set contents. This reduces the size of the output for display.
    return map.size;
  }
  return map;
}

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

app.get('/status', function (req, res) {
  res.send({
    elapsedTime: millisToMinutesAndSeconds(new Date() - startTime),
    feeds: mapToObject(feedContextMap),
    buckets: mapToObject(matchingCriteriaOpportunityIds),
  });
});

function getMatch(req, res, useCache) {
  // respond with json
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityById(id);

    if (useCache && cachedResponse) {
      log(`used cached response for ${id}`);
      res.json({
        data: cachedResponse,
      });
      res.end();
    } else {
      log(`listening for ${id}`);

      // Stash the response and reply later when an event comes through (kill any existing id still waiting)
      if (responses[id] && responses[id] !== null) {
        log(`ignoring previous request for ${id}`);
        responses[id].end();
      }
      responses[id] = {
        send(json) {
          responses[id] = null;
          res.json(json);
          res.end();
        },
        end() {
          res.end();
        },
        res,
      };
    }
  } else {
    res.send('id not valid');
  }
}

app.get('/get-cached-opportunity/:id', function (req, res) {
  getMatch(req, res, true);
});

app.get('/get-opportunity/:id', function (req, res) {
  getMatch(req, res, false);
});

function getTypeFromOpportunityType(opportunityType) {
  const mapping = {
    ScheduledSession: 'ScheduledSession',
    FacilityUseSlot: 'Slot',
    IndividualFacilityUseSlot: 'Slot',
    CourseInstance: 'CourseInstance',
    HeadlineEvent: 'HeadlineEvent',
    Event: 'Event',
    HeadlineEventSubEvent: 'Event',
    CourseInstanceSubEvent: 'Event',
    OnDemandEvent: 'OnDemandEvent',
  };
  return mapping[opportunityType];
}

function detectSellerId(opportunity) {
  const organizer = opportunity.organizer
    || (opportunity.superEvent
      && (opportunity.superEvent.organizer || (opportunity.superEvent.superEvent && opportunity.superEvent.superEvent.organizer)))
    || (opportunity.facilityUse && opportunity.facilityUse.provider);

  return organizer['@id'] || organizer.id;
}

function detectOpportunityType(opportunity) {
  switch (opportunity['@type'] || opportunity.type) {
    case 'ScheduledSession':
      if (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type) === 'SessionSeries') {
        return 'ScheduledSession';
      }
      throw new Error('ScheduledSession must have superEvent of SessionSeries');

    case 'Slot':
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'IndividualFacilityUse') {
        return 'IndividualFacilityUseSlot';
      }
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'FacilityUse') {
        return 'FacilityUseSlot';
      }

      throw new Error('Slot must have facilityUse of FacilityUse or IndividualFacilityUse');

    case 'CourseInstance':
      return 'CourseInstance';
    case 'HeadlineEvent':
      return 'HeadlineEvent';
    case 'OnDemandEvent':
      return 'OnDemandEvent';
    case 'Event':
      switch (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type)) {
        case 'HeadlineEvent':
          return 'HeadlineEventSubEvent';
        case 'CourseInstance':
          return 'CourseInstanceSubEvent';
        case 'EventSeries':
        case null:
          return 'Event';
        default:
          throw new Error('Event has unrecognised @type of superEvent');
      }
    default:
      throw new Error('Only bookable opportunities are permitted in the test interface');
  }
}

app.post('/test-interface/datasets/:testDatasetIdentifier/opportunities', function (req, res) {
  // Use :testDatasetIdentifier to ensure the same id is not returned twice
  const { testDatasetIdentifier } = req.params;

  const opportunity = req.body;
  const opportunityType = detectOpportunityType(opportunity);
  const sellerId = detectSellerId(opportunity);
  const criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');

  const result = getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier);
  if (result && result.opportunity) {
    log(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${result.opportunity['@type']}): ${result.opportunity['@id']}`);
    res.json(result.opportunity);
    res.end();
  } else {
    logError(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${opportunityType}) call failed: No matching opportunities found`);
    res.status(404).send(`Opportunity Type '${opportunityType}' Not found from seller ${sellerId} for ${criteriaName}.\n\nSellers available:\n${result && result.sellers && result.sellers.length > 0 ? result.sellers.join('\n') : 'none'}.`);
  }
});

app.delete('/test-interface/datasets/:testDatasetIdentifier', function (req, res) {
  // Use :testDatasetIdentifier to identify locks, and clear them
  const { testDatasetIdentifier } = req.params;
  releaseOpportunityLocks(testDatasetIdentifier);
  res.status(204).send();
});

const orderResponses = {
  /* Keyed by expression = */
};

app.get('/get-order/:expression', function (req, res) {
  // respond with json
  if (req.params.expression) {
    const { expression } = req.params;

    // Stash the response and reply later when an event comes through (kill any existing expression still waiting)
    if (orderResponses[expression] && orderResponses[expression] !== null) orderResponses[expression].end();
    orderResponses[expression] = {
      send(json) {
        orderResponses[expression] = null;
        res.json(json);
        res.end();
      },
      end() {
        res.end();
      },
      res,
    };
  } else {
    res.send('Expression not valid');
  }
});


function ingestParentOpportunityPage(rpde, contextIdentifier, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    const kind = rpde.items && rpde.items[0] && rpde.items[0].kind;
    log(
      `RPDE kind: ${kind}, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`,
    );
  }

  rpde.items.forEach((item) => {
    if (item.state === 'deleted') {
      const jsonLdId = parentOpportunityRpdeMap.get(item.id);
      parentOpportunityMap.delete(jsonLdId);
      parentOpportunityRpdeMap.delete(item.id);
    } else {
      const jsonLdId = item.data['@id'] || item.data.id;
      parentOpportunityRpdeMap.set(item.id, jsonLdId);
      // Remove nested @context
      const dataWithoutContext = Object.assign({
      }, item.data, {
        '@context': undefined,
      });
      parentOpportunityMap.set(jsonLdId, dataWithoutContext);
    }
  });

  // As these parent opportunities have been updated, update all child items for these parent IDs
  touchOpportunityItems(rpde.items
    .filter(item => item.state !== 'deleted')
    .map(item => item.data['@id'] || item.data.id));

  setTimeout(
    () => getRPDE(rpde.next, contextIdentifier, (x, cId) => ingestParentOpportunityPage(x, cId, pageNumber + 1 || 0)),
    200,
  );
}

function ingestOpportunityPage(rpde, contextIdentifier, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    const kind = rpde.items && rpde.items[0] && rpde.items[0].kind;
    log(
      `RPDE kind: ${kind}, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`,
    );
  }

  rpde.items.forEach((item) => {
    if (item.state === 'deleted') {
      const jsonLdId = opportunityRpdeMap.get(item.id);
      opportunityMap.delete(jsonLdId);
      opportunityRpdeMap.delete(item.id);

      deleteOpportunityItem(jsonLdId);
    } else {
      const jsonLdId = item.data['@id'] || item.data.id;
      opportunityRpdeMap.set(item.id, jsonLdId);
      opportunityMap.set(jsonLdId, item.data);

      storeOpportunityItem(item);
    }
  });

  setTimeout(
    () => getRPDE(rpde.next, contextIdentifier, (x, cId) => ingestOpportunityPage(x, cId, pageNumber + 1 || 0)),
    200,
  );
}

function touchOpportunityItems(parentIds) {
  const opportunitiesToUpdate = new Set();

  parentIds.forEach((parentId) => {
    if (parentIdIndex.has(parentId)) {
      parentIdIndex.get(parentId).forEach((jsonLdId) => {
        opportunitiesToUpdate.add(jsonLdId);
      });
    }
  });

  opportunitiesToUpdate.forEach((jsonLdId) => {
    if (rowStoreMap.has(jsonLdId)) {
      const row = rowStoreMap.get(jsonLdId);
      row.feedModified = Date.now() + 1000; // 1 second in the future
      row.parentIngested = true;
      processRow(row);
    }
  });
}

function deleteOpportunityItem(jsonLdId) {
  const row = rowStoreMap.get(jsonLdId);
  if (row) {
    const idx = parentIdIndex.get(row.jsonLdParentId);
    if (idx) {
      idx.delete(jsonLdId);
    }
    rowStoreMap.delete(jsonLdId);
  }
}

function storeOpportunityItem(item) {
  const row = {
    id: item.id,
    modified: item.modified,
    deleted: item.state === 'deleted',
    feedModified: Date.now() + 1000, // 1 second in the future,
    jsonLdId: item.state === 'deleted' ? null : item.data['@id'] || item.data.id,
    jsonLd: item.state === 'deleted' ? null : item.data,
    jsonLdType: item.state === 'deleted' ? null : item.data['@type'] || item.data.type,
    jsonLdParentId: item.state === 'deleted' ? null : item.data.superEvent || item.data.facilityUse,
    parentIngested: item.state === 'deleted' ? false : parentOpportunityMap.has(item.data.superEvent) || parentOpportunityMap.has(item.data.facilityUse),
  };

  if (row.jsonLdParentId != null && row.jsonLdId != null) {
    if (!parentIdIndex.has(row.jsonLdParentId)) parentIdIndex.set(row.jsonLdParentId, new Set());
    parentIdIndex.get(row.jsonLdParentId).add(row.jsonLdId);
  }

  rowStoreMap.set(row.jsonLdId, row);

  if (row.parentIngested) {
    processRow(row);
  }
}

function processRow(row) {
  const newItem = {
    state: row.deleted ? 'deleted' : 'updated',
    id: row.jsonLdId,
    modified: row.feedModified,
    data: Object.assign(
      {
      },
      row.jsonLd,
      row.jsonLdType === 'Slot'
        ? {
          facilityUse: parentOpportunityMap.get(row.jsonLdParentId),
        }
        : {
          superEvent: parentOpportunityMap.get(row.jsonLdParentId),
        },
    ),
  };

  processOpportunityItem(newItem);
}

function processOpportunityItem(item) {
  if (item.data) {
    const id = item.data['@id'] || item.data.id;
    const opportunityType = detectOpportunityType(item.data);
    const sellerId = detectSellerId(item.data);

    const matchingCriteria = [];
    let unmetCriteriaDetails = [];

    criteria.map(c => ({
      criteriaName: c.name, criteriaResult: c.testMatch(item.data),
    })).forEach((result) => {
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

    const bookableIssueList = unmetCriteriaDetails.length > 0
      ? `\n   [Unmet Criteria: ${unmetCriteriaDetails.join(', ')}]` : '';

    if (responses[id]) {
      responses[id].send(item);

      if (VERBOSE) log(`seen ${matchingCriteria.join(', ')} and dispatched ${id}${bookableIssueList}`);
    } else if (VERBOSE) log(`saw ${matchingCriteria.join(', ')} ${id}${bookableIssueList}`);
  }
}

function monitorOrdersPage(rpde, contextIdentifier) {
  if (REQUEST_LOGGING_ENABLED) {
    log(
      `RPDE kind: Orders Monitoring, length: ${rpde.items.length}, next: '${rpde.next}'`,
    );
  }

  rpde.items.forEach((item) => {
    if (item.data && item.id && orderResponses[item.id]) {
      orderResponses[item.id].send(item);
    }
  });

  setTimeout(() => getRPDE(rpde.next, contextIdentifier, monitorOrdersPage), 200);
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
  const parser = new Parser(handler, {
    decodeEntities: true,
  });
  parser.write(html);
  parser.done();

  return jsonld;
}

async function extractJSONLDfromDatasetSiteUrl(url) {
  const response = await axios.get(url);

  const jsonld = extractJSONLDfromHTML(url, response.data);
  return jsonld;
}


async function startPolling() {
  const dataset = await extractJSONLDfromDatasetSiteUrl(DATASET_SITE_URL);

  log(`Dataset Site JSON-LD: ${JSON.stringify(dataset, null, 2)}`);

  datasetSiteJson = dataset;

  if (!dataset || !Array.isArray(dataset.distribution)) {
    throw new Error('Unable to read valid JSON-LD from Dataset Site. Please try loading the Dataset Site URL in validator.openactive.io to confirm it is valid.');
  }

  dataset.distribution.forEach((dataDownload) => {
    addFeed(dataDownload.contentUrl);
    if (dataDownload.additionalType === 'https://openactive.io/SessionSeries'
      || dataDownload.additionalType === 'https://openactive.io/FacilityUse') {
      log(`Found parent opportunity feed: ${dataDownload.contentUrl}`);
      getRPDE(dataDownload.contentUrl, setupContext(dataDownload.identifier || dataDownload.name), ingestParentOpportunityPage);
    } else {
      log(`Found opportunity feed: ${dataDownload.contentUrl}`);
      getRPDE(dataDownload.contentUrl, setupContext(dataDownload.identifier || dataDownload.name), ingestOpportunityPage);
    }
  });

  // Only poll orders feed if included in the dataset site
  if (dataset.accessService && dataset.accessService.endpointURL) {
    const ordersFeedUrl = `${dataset.accessService.endpointURL}orders-rpde`;
    log(`Found orders feed: ${ordersFeedUrl}`);
    getRPDE(ordersFeedUrl, setupContext('OrdersFeed', ORDERS_FEED_REQUEST_HEADERS), monitorOrdersPage);
  }

  // Finished processing dataset site
  if (WAIT_FOR_HARVEST) log('\nBlocking integration tests to wait for harvest completion...');
  feedUpToDate(DATASET_SITE_URL);
}

function setupContext(identifier, headers) {
  const context = {
    currentPage: null,
    pages: 0,
    items: 0,
    responseTimes: [],
  };
  if (headers !== undefined) context.headers = headers;
  if (feedContextMap.has(identifier)) {
    throw new Error('Duplicate feed identifier not permitted.');
  }
  feedContextMap.set(identifier, context);
  return identifier;
}

// Ensure that dataset site request also delays "readiness"
addFeed(DATASET_SITE_URL);

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1');
log(`Broker Microservice running on port ${port}

Check http://localhost:${port}/status for current harvesting status
`);

(async () => {
  await startPolling();
})();
