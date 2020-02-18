var express = require("express");
var logger = require("morgan");
var request = require("request");
var nSQL = require("@nano-sql/core").nSQL;
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
sessionSeriesMap = {};
sessionSeriesRpdeMap = {};
scheduledSessionsMap = {};
scheduledSessionsRpdeMap = {};

nSQL().createDatabase({
  tables: [
    {
      name: "SessionSeries",
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
      name: "ScheduledSessions",
      model: {
        "id:int": { pk: true },
        "modified:int": {},
        "deleted:bool": {},
        "jsonLdId:string": {},
        "feedModified:int": {},
        "jsonLd:obj": {},
        "jsonLdParentId:string": {},
        "parentIngested:bool": {}
      },
      indexes: {
        "jsonLdParentId:string": {
          /*  foreignKey: { // foreign key property
                      target: "SessionSeries.jsonLdId" // parent Table.column or Table.nested.column
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
      cb(JSON.parse(body));
    } else {
      console.log("Error for RPDE page: " + error + ". Response: " + body);
      // Fake next page to force retry, after a delay
      setTimeout(x => getRPDE(url, cb), 5000);
    }
  });
}

function getBaseUrl(url) {
  if (url.indexOf("//") > -1) {
    return url.substring(0, url.indexOf("/", url.indexOf("//") + 2));
  } else {
    return "";
  }
}

var bookableOpportunityIds = [];

function getRandomBookableOpportunity() {
  if (bookableOpportunityIds.length == 0) return null;
  return bookableOpportunityIds[Math.floor(Math.random() * bookableOpportunityIds.length)];
}

function getOpportunityById(opportunityId) {
  if (scheduledSessionsMap[opportunityId] && sessionSeriesMap[scheduledSessionsMap[opportunityId].superEvent]) {
    return Object.assign(
      {},
      scheduledSessionsMap[opportunityId],
      { superEvent: sessionSeriesMap[scheduledSessionsMap[opportunityId].superEvent] }
    )
  }
}

app.get("/feeds/scheduled-sessions", function(req, res) {
  var afterId = null;
  var afterTimestamp = null;
  if (req.query && req.query.afterId && req.query.afterTimestamp) {
    afterId = req.query.afterId;
    afterTimestamp = parseInt(req.query.afterTimestamp);
  }

  var baseUrl = "http://localhost:" + PORT + "/feeds/scheduled-sessions";
  var PAGE_SIZE = 500;

  nSQL("ScheduledSessions")
    .query("select", [
      "jsonLdId",
      "deleted",
      "feedModified",
      "jsonLd",
      "jsonLdParentId"
      // "SessionSeries.jsonLd",
      //"SessionSeries.jsonLdId",
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
  with: {table: "SessionSeries"},
  on: ["jsonLdParentId","=","SessionSeries.jsonLdId"]
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
              { superEvent: sessionSeriesMap[row["jsonLdParentId"]] } // Note sessionSeriesMap used as much faster than nSQL join
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
  var randomOpportunity = getRandomBookableOpportunity();
  console.log("Random Bookable Opportunity: " + randomOpportunity['@id']);
  res.json({ 
    "@context": "https://openactive.io/",
    "@type": "ScheduledSession",
    "@id": randomOpportunity
  });
  res.end();
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

//setupDataStore().then(() => {
// Start processing first pages of external feeds
getRPDE(FEED_BASE + "session-series", ingestSessionSeriesPage);
getRPDE(FEED_BASE + "scheduled-sessions", ingestScheduledSessionPage);

// Start monitoring first page of internal feed
getRPDE("http://localhost:" + PORT + "/feeds/scheduled-sessions", monitorPage);
//});

// Only poll orders feed if enabled
if (BOOKING_API_BASE != null)
  getRPDE(BOOKING_API_BASE + "orders-rpde", monitorOrdersPage);



function ingestSessionSeriesPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    console.log(
      `RPDE kind: SessionSeries, page: ${pageNumber + 1 || 0}, length: ${
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
      var jsonLdId = sessionSeriesRpdeMap[item.id];
      delete sessionSeriesMap[jsonLdId];
      delete sessionSeriesRpdeMap[item.id];
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      sessionSeriesRpdeMap[item.id] = jsonLdId;
      sessionSeriesMap[jsonLdId] = item.data;
    }
  });

  nSQL("SessionSeries")
    .query("upsert", newItems)
    .exec()
    .then(() => {
      // Update any children that reference this parent
      nSQL("ScheduledSessions")
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
                ingestSessionSeriesPage(x, pageNumber + 1 || 0)
              ),
            200
          );
        });
    });
}

function ingestScheduledSessionPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    console.log(
      `RPDE kind: ScheduledSession, page: ${pageNumber + 1 || 0}, length: ${
        rpde.items.length
      }, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    if (item.state == "deleted") {
      var jsonLdId = scheduledSessionsRpdeMap[item.id];
      delete scheduledSessionsMap[jsonLdId];
      delete scheduledSessionsRpdeMap[item.id];
    } else {
      var jsonLdId = item.data['@id'] || item.data['id'];
      scheduledSessionsRpdeMap[item.id] = jsonLdId;
      scheduledSessionsMap[jsonLdId] = item.data;
    }
  });

  nSQL("ScheduledSessions")
    .query(
      "upsert",
      rpde.items.map(item => ({
        id: item.id,
        modified: item.modified,
        deleted: item.state == "deleted",
        feedModified: Date.now() + 1000, // 1 second in the future,
        jsonLdId: item.state == "deleted" ? null : item.data['@id'] || item.data['id'],
        jsonLd: item.state == "deleted" ? null : item.data,
        jsonLdParentId: item.state == "deleted" ? null : item.data.superEvent,
        parentIngested: item.state == "deleted" ? false : typeof sessionSeriesMap[item.data.superEvent] !== "undefined"
      }))
    )
    .exec()
    .then(() => {
      setTimeout(
        x =>
          getRPDE(rpde.next, x =>
            ingestScheduledSessionPage(x, pageNumber + 1 || 0)
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
    // TODO: make this regex loop (note ignore deleted items)
    if (item.data && item.data.superEvent) {
      var id = item.data['@id'] || item.data['id'];

      if (Date.parse(item.data.startDate) > new Date(Date.now() + ( 3600 * 1000 * 24)) ) {
        bookableOpportunityIds.push(id);
      }

      if (responses[id]) {
        responses[id].send(item);

        console.log("seen and dispatched " + id);
      } else {
        console.log("saw " + id);
      }
    }
  });

  setTimeout(x => getRPDE(rpde.next, monitorPage), 5000);
}

function monitorOrdersPage(rpde, pageNumber) {
  if (REQUEST_LOGGING_ENABLED) {
    console.log(
      `RPDE kind: Orders Monitoring, length: ${rpde.items.length}, next: '${rpde.next}'`
    );
  }

  rpde.items.forEach(item => {
    // TODO: make this regex loop (note ignore deleted items)
    if (item.data && item.id && orderResponses[item.id]) {
      orderResponses[item.id].send(item);
    }
  });

  setTimeout(x => getRPDE(rpde.next, monitorOrdersPage), 200);
}

app.listen(PORT, "127.0.0.1");
console.log("Node server running on port " + PORT);
