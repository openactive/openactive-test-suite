const assert = require("assert");
const axios = require("axios");
const config = require("config");

var BOOKING_API_BASE = config.get("tests.bookingApiBase");
var MICROSERVICE_BASE = config.get("tests.microserviceApiBase");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function ping() {
  let response = await axios.get(MICROSERVICE_BASE + "health-check/");

  assert.strictEqual(response.data, "openactive-broker");

  return true;
}

class Reporter {
  onRunStart() {
    console.log('run')
    process.exit();
  }
  onTestStart() {
    console.log('test start')
    process.exit();
  }
  onTestResult() {
    console.log('test result')
    process.exit();
  }
  onRunComplete() {
    console.log('run complete')
    process.exit();
  }
}

module.exports = async () => {
  global.abc = 'it works!'

  try {
    await ping();
  } catch (error) {
    throw new Error("The broker microservice is unreachable. This is a pre-requisite for the test suite. \n" + error);
  }
};
