const NodeEnvironment = require('jest-environment-node');
const axios = require("axios");
const config = require("config");

const MICROSERVICE_BASE = config.get("microserviceApiBase");
const TEST_DATASET_IDENTIFIER = config.get("testDatasetIdentifier");

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = config.get('bookableOpportunityTypesInScope');
const IMPLEMENTED_FEATURES = config.get('implementedFeatures');

class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    // Get endpoint URL from Dataset Site
    let response = await axios.get(MICROSERVICE_BASE + "dataset-site");
    if (response && response.data && response.data.accessService && response.data.accessService.endpointURL) {
      this.global.BOOKING_API_BASE = response.data.accessService.endpointURL;
    }
    this.global.MICROSERVICE_BASE = MICROSERVICE_BASE;
    this.global.TEST_DATASET_IDENTIFIER = TEST_DATASET_IDENTIFIER;

    // Note these are defined in the test environment to allow the certificate validator to override them
    this.global.BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE;
    this.global.IMPLEMENTED_FEATURES = IMPLEMENTED_FEATURES;
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = TestEnvironment;