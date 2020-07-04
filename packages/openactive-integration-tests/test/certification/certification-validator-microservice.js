
const express = require('express');
const asyncHandler = require('express-async-handler')
const app = express();
var http = require('http');
const axios = require("axios");
const {validateCertificateHtml, validateCertificate} = require('./certification-validator');

app.use(express.json({
  limit: '50mb'
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.redirect(301, 'https://www.openactive.io/');
});

async function validateUrl(url, holder) {
  let certReq = await axios.get(url);
  if (certReq.data) {
    return await validateCertificateHtml(certReq.data, url, holder);
  } else {
    return { "error": "Invalid url specified" };
  }
}

app.get('/validate', asyncHandler(async (req, res) => {
  let result = await validateUrl(req.query.url, req.query.holder);
  if (!result.error) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
}));

app.post('/validate-json', asyncHandler(async (req, res) => {
  if (req.body.certificateJson && typeof req.body.url === 'string') {
    // Attempt both types of validation in parallel 
    const urlResult = req.body.url.indexOf('//localhost') !== -1 || req.body.url.indexOf('file://') !== -1
    ? (async () => { skipped: true })() : validateUrl(req.body.url, null);
    let payloadResult = validateCertificate(req.body.certificateJson, req.body.url, null);
    urlResult = await urlResult;
    payloadResult = await payloadResult;
    payloadResult.exposureVerification = !urlResult.skipped;

    if (!payloadResult.valid) {
      res.json(payloadResult);
    } else if (!urlResult.skipped && !urlResult.valid) {
      res.json(urlResult);
    } else {
      res.json(payloadResult);
    }    
  } else {
    res.status(400).json({ "error": "Invalid body or url specified" });
  }
}));
var server = http.createServer(app);
server.on('error', onError);

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}