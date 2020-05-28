const config = require('config');

const { Logger } = require('./logger');
const { RequestState } = require('./request-state');
const { FlowHelper } = require('./flow-helper');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = config.get('tests.bookableOpportunityTypesInScope');
const IMPLEMENTED_FEATURES = config.get('tests.implementedFeatures');

class FeatureHelper {
  static describeFeature(configuration, tests) {
    const opportunityTypesInScope = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, value]) => value === true).map(([key]) => key);
    const implemented = IMPLEMENTED_FEATURES[configuration.testFeature];

    // Only run the test if it is for the correct implmentation status
    // Do not run tests if they are disabled for this feature (testFeatureImplemented == null)
    if (implemented === configuration.testFeatureImplemented) {
      describe(configuration.testFeature, function () {
        describe(configuration.testName, function () {
          if (configuration.runOnce) {
            // TODO: This duplicate describe nesting ensures the number of describe levels remains consistent for the logger
            // However should the logger rely on an exact number of levels?
            describe(configuration.testName, function () {
              const logger = new Logger(`${configuration.testFeature} >> ${configuration.testName}`, this, {
                config: configuration,
                description: configuration.testDescription,
                implemented: implemented ? 'Implemented' : 'Not Implemented',
              });

              const state = new RequestState(logger);
              const flow = new FlowHelper(state);

              tests.bind(this)(configuration, null, implemented, logger, state, flow);
            });
          } else {
            // Create a new test for each opportunityType in scope
            opportunityTypesInScope.forEach((opportunityType) => {
              describe(opportunityType, function () {
                const logger = new Logger(`${configuration.testFeature} >> ${configuration.testName} (${opportunityType})`, this, {
                  config: configuration,
                  description: configuration.testDescription,
                  implemented: implemented ? 'Implemented' : 'Not Implemented',
                  opportunityType: opportunityType
                });

                const state = new RequestState(logger);
                const flow = new FlowHelper(state);

                // TODO: Drive from number of events in this iteration (using testOpportunityCriteria for primary event, and controlOpportunityCriteria for others)
                const orderItemCriteria = configuration.testOpportunityCriteria ? [
                  {
                    opportunityType,
                    opportunityCriteria: configuration.testOpportunityCriteria,
                    control: false,
                  },
                  {
                    opportunityType,
                    opportunityCriteria: configuration.controlOpportunityCriteria,
                    control: true,
                  },
                  {
                    opportunityType,
                    opportunityCriteria: configuration.controlOpportunityCriteria,
                    control: true,
                  },
                ] : [];

                tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow);
              });
            });
          }
        });
      });
    }
  }
}

module.exports = {
  FeatureHelper,
};
