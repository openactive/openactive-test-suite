
/*
var longpoll = require("express-longpoll")(app)
// You can also enable debug flag for debug messages
var longpollWithDebug = require("express-longpoll")(app, { DEBUG: true });
*/


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/oa', function (req, res) {
   // respond with json
  if (/(ld\+)?json/.test(req.headers.accept)) {
    request.get({ url: (process.env.NAMESPACE || "https://www.openactive.io/ns/oa.jsonld") }, function(error, response, body) { 
      if (!error && response.statusCode == 200) { 
        res.json(JSON.parse(body));
      } 
    });
  } else {
    res.redirect(process.env.REDIRECT || 'https://www.openactive.io/');
  }
});

app.get('/activity-list', function (req, res) {
   // respond with json
  if (/(ld\+)?json/.test(req.headers.accept)) {
    request.get({ url: "https://www.openactive.io/activity-list/activity-list.jsonld" }, function(error, response, body) { 
      if (!error && response.statusCode == 200) { 
        res.json(JSON.parse(body));
      } 
    });
  } else {
    res.redirect('https://www.openactive.io/activity-list/');
  }
});

app.get('/activity-list/activity-list.jsonld', function (req, res) {
  // respond with json
  request.get({ url: "https://www.openactive.io/activity-list/activity-list.jsonld" }, function(error, response, body) { 
    if (!error && response.statusCode == 200) { 
      res.json(JSON.parse(body));
    } 
  });
});

app.get('/accessibility-support', function (req, res) {
   // respond with json
  if (/(ld\+)?json/.test(req.headers.accept)) {
    request.get({ url: "https://www.openactive.io/accessibility-support/accessibility-support.jsonld" }, function(error, response, body) { 
      if (!error && response.statusCode == 200) { 
        res.json(JSON.parse(body));
      } 
    });
  } else {
    res.redirect('https://www.openactive.io/accessibility-support/');
  }
});

app.get('/accessibility-support/accessibility-support.jsonld', function (req, res) {
  // respond with json
  request.get({ url: "https://www.openactive.io/accessibility-support/accessibility-support.jsonld" }, function(error, response, body) { 
    if (!error && response.statusCode == 200) { 
      res.json(JSON.parse(body));
    } 
  });
});

app.get('/get-match/:name', function (req, res) {
   // respond with json
  if (!req.params.vocab) {
    res.redirect( (process.env.BASE_URL || "https://www.openactive.io") + "/controlled-vocabularies/");
  } else if (/(ld\+)?json/.test(req.headers.accept)) {
    request.get({ url: (process.env.BASE_URL || "https://www.openactive.io") + "/controlled-vocabularies/" + req.params.vocab + "/" + req.params.vocab + ".jsonld" }, function(error, response, body) { 
      if (!error && response.statusCode == 200) { 
        res.json(JSON.parse(body));
      } 
    });
  } else {
    res.redirect( (process.env.BASE_URL || "https://www.openactive.io") + "/controlled-vocabularies/" + req.params.vocab + "/");
  }
});
