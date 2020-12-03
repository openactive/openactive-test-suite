const NodeEnvironment = require('jest-environment-node');
const axios = require('axios');
const { getConfigVarOrThrow } = require('./helpers/config-utils');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;
const TEST_DATASET_IDENTIFIER = getConfigVarOrThrow('integrationTests', 'testDatasetIdentifier');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');

class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    // Get endpoint URL from Broker Microservice
    const configUrl = `${MICROSERVICE_BASE}/config`;
    const response = await axios.get(configUrl);
    if (response && response.data) {
      this.global.BOOKING_API_BASE = response.data.bookingApiBaseUrl;
      this.global.AUTHENTICATION_AUTHORITY = response.data.authenticationAuthority;
      this.global.HARVEST_START_TIME = new Date(response.data.harvestStartTime);
      this.global.SELLER_CONFIG = response.data.sellersConfig;
      this.global.BOOKING_PARTNER_CONFIG = response.data.bookingPartnersConfig;
      this.global.AUTHENTICATION_FAILURE = response.data.authenticationFailure;
      this.global.DYNAMIC_REGISTRATION_FAILURE = response.data.dynamicRegistrationFailure;
      this.global.HEADLESS_AUTH = response.data.headlessAuth;
    } else {
      throw new Error(`Error accessing broker microservice at ${configUrl}`);
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
