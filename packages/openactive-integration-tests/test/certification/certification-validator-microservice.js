const express = require('express');
const cors = require('cors');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const http = require('http');
const { withTimeout, Mutex } = require('async-mutex');

const { validateCertificateHtml, validateCertificate } = require('./certification-validator');

/**
 * This mutex is used to protect the microservice from running out of memory due to too many simultaneous requests
 * It queues requests, and times them out after 25 seconds (Heroku will timeout the request after 30 seconds anyway)
 * Note the CDN buffers uploads, so the request is only made once upload from the certificate webpage is complete.
 */
const mutex = withTimeout(new Mutex(), 25000);

const app = express();
app.use(cors());

app.use(express.json({
  limit: '500mb',
}));

app.get('/', (req, res) => {
  res.redirect(301, 'https://www.openactive.io/');
});

async function validateUrl(url, holder) {
  const certReq = await axios.get(url);
  if (certReq.data) {
    return await validateCertificateHtml(certReq.data, url, holder);
  }
  return { error: 'Invalid url specified' };
}

app.get('/validate', asyncHandler(async (req, res) => await mutex.runExclusive(async () => {
  const result = await validateUrl(req.query.url, req.query.holder);
  if (!result.error) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
})));

app.post('/validate-json', asyncHandler(async (req, res) => await mutex.runExclusive(async () => {
  // Ensure this endpoint is not run in parallel, to protect memory usage
  if (req.body.certificateJson && typeof req.body.url === 'string') {
    // Attempt both types of validation in parallel
    let urlResult = req.body.url.indexOf('//localhost') !== -1 || req.body.url.indexOf('file://') !== -1
      ? (async () => ({ skipped: true }))() : validateUrl(req.body.url, null);
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
    res.status(400).json({ error: 'Invalid body or url specified' });
  }
})));

const server = http.createServer(app);
server.on('error', onError);

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
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

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
