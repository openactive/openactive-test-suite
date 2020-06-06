const config = require('config');

const { Logger } = require('./logger');
const { RequestState } = require('./request-state');
const { FlowHelper } = require('./flow-helper');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = config.get('bookableOpportunityTypesInScope');
const IMPLEMENTED_FEATURES = config.get('implementedFeatures');

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
            // This duplicate describe nesting ensures the number of describe levels remains consistent for the logger
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
            const singleOpportunityCriteriaTemplate = configuration.singleOpportunityCriteriaTemplate 
              || ((opportunityType) => [{
                opportunityType,
                opportunityCriteria: configuration.testOpportunityCriteria,
                primary: true,
                control: false,
              }]);

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

                const orderItemCriteria = singleOpportunityCriteriaTemplate(opportunityType);

                tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow);
              });
            });

            const multipleOpportunityCriteriaTemplate = configuration.multipleOpportunityCriteriaTemplate || ((opportunityType, i) => [{
              opportunityType,
              opportunityCriteria: configuration.testOpportunityCriteria,
              primary: true,
              control: false,
              opportunityReuseKey: i,
            },
            {
              opportunityType,
              opportunityCriteria: configuration.testOpportunityCriteria,
              primary: false,
              control: false,
              opportunityReuseKey: i,
            },
            {
              opportunityType,
              opportunityCriteria: configuration.controlOpportunityCriteria,
              primary: false,
              control: true,
              usedInOrderItems: 1,
            }]);

            describe("Multiple", function () {
              const logger = new Logger(`${configuration.testFeature} >> ${configuration.testName} (Multiple)`, this, {
                config: configuration,
                description: configuration.testDescription,
                implemented: implemented ? 'Implemented' : 'Not Implemented',
                opportunityType: "Multiple"
              });

              const state = new RequestState(logger);
              const flow = new FlowHelper(state);

              let orderItemCriteria = [];

              // Create multiple orderItems covering all opportunityTypes in scope
              opportunityTypesInScope.forEach((opportunityType, i) => {
                orderItemCriteria = orderItemCriteria.concat(multipleOpportunityCriteriaTemplate(opportunityType, i));
              });

              tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow);
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
