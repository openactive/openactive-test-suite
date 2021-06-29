const PORT = normalizePort(process.env.PORT || '3000');
const MICROSERVICE_BASE_URL = `http://localhost:${PORT}`;

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const integerPort = parseInt(val, 10);

  if (Number.isNaN(integerPort)) {
    // named pipe
    return val;
  }

  if (integerPort >= 0) {
    // port number
    return integerPort;
  }

  return false;
}

module.exports = {
  PORT,
  MICROSERVICE_BASE_URL,
};
