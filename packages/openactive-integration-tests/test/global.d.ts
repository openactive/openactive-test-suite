import { JasmineStateReporter } from './test-framework/jasmine-state-reporter';

/**
 * Extensions to the `global` object that are used in this code base.
 *
 * Warning: `global` should be used sparingly as it makes it difficult for
 * tools and humans to analyze code.
 */
declare global {
  namespace NodeJS  {
    interface Global {
      // These variables are added to Node.js' global object by jest-environment-node
      MICROSERVICE_BASE: string;
      BOOKING_API_BASE?: string;
      HARVEST_START_TIME: Date;
      TEST_DATASET_IDENTIFIER: string;
      BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE: { [opportunityType: string]: boolean };
      IMPLEMENTED_FEATURES: { [featureIdentifier: string]: boolean | null };
      // Created in packages/openactive-integration-tests/documentation/generator.js
      documentationGenerationMode?: boolean;
      // Created in packages/openactive-integration-tests/test/setup.js
      testState: InstanceType<typeof JasmineStateReporter>;
      BOOKING_PARTNER_CONFIG: { [bookingPartnerIdentifier: string]: { authentication: { initialAccessToken: string, clientCredentials: { clientId: string, clientSecret: string} } } };
      SELLER_CONFIG: { [sellerIdentifier: string]: { authentication: { loginCredentials: { username: string, password: string } } } };
      AUTHENTICATION_FAILURE: boolean;
      DYNAMIC_REGISTRATION_FAILURE: boolean;
      HEADLESS_AUTH: boolean;
    }
  }
}

export {};
