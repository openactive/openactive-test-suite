const config = require('config');
const _ = require('lodash');

const { Logger } = require('./logger');
const { RequestState } = require('./request-state');
const { FlowHelper } = require('./flow-helper');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = global.BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE;
const IMPLEMENTED_FEATURES = global.IMPLEMENTED_FEATURES;

/**
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 *
 * @typedef {(opportunityType: string) => [OpportunityCriteria]} CreateSingleOportunityCriteriaTemplateFn
 * @typedef {(opportunityType: string, opportunityReuseKey: number) => OpportunityCriteria[]} CreateMultipleOportunityCriteriaTemplateFn
 *
 * @typedef {object} DescribeFeatureConfiguration Configuration for the describeFeature function
 * @property {string} testCategory
 * @property {string} testFeature
 * @property {boolean} testFeatureImplemented
 * @property {string} testIdentifier
 * @property {string} testName
 * @property {string} [testDescription]
 * @property {string} [testOpportunityCriteria]
 * @property {string} [controlOpportunityCriteria] When the test is run with
 *   multiple opportunities, a "control" opportunity will be added. With this,
 *   one can test that the particular feature in focus still works if combined
 *   with other opportunities.
 *
 *   For example, if testing an error, set the `controlOpportunityCriteria` to
 *   `TestOpportunityBookable` to ensure that the correct error is returned
 *   even though one of the opportunities in the Order is valid.
 * @property {CreateSingleOportunityCriteriaTemplateFn} [singleOpportunityCriteriaTemplate]
 * @property {CreateMultipleOportunityCriteriaTemplateFn} [multipleOpportunityCriteriaTemplate]
 * @property {boolean} [runOnce]
 * @property {boolean} [skipMultiple]
 * @property {boolean} [runOnlyIf]
 * @property {number} [numOpportunitiesUsedPerCriteria] How many opportunities
 *   are used by the test per criteria. e.g. if each test iteration needs to
 *   fetch 2 opportunities, this number should be 2.
 *
 *   Used to generate the docs for each test.
 *
 *   Defaults to 1.
 *
 * @typedef {(
 *   configuration: DescribeFeatureConfiguration,
 *   orderItemCriteria: OpportunityCriteria[],
 *   implemented: boolean,
 *   logger: InstanceType<typeof Logger>,
 *   state: InstanceType<typeof RequestState>,
 *   flow: InstanceType<typeof FlowHelper>,
 * ) => void} RunTestsFn
 *
 * @typedef {DescribeFeatureConfiguration & {
 *   criteriaRequirement: Map<string, number>,
 * }} TestModuleExports The CommonJS exports object that is assigned to each test's Node Module.
 *   This is used by the documentation generator to get data about the tests.
 *   `criteriaRequirement` is a map of how many of each opportunity criteria (e.g. TestOpportunityBookable)
 *   is required.
 */

class FeatureHelper {
  /**
   * @param {NodeModule} documentationModule
   * @param {DescribeFeatureConfiguration} configuration
   * @param {RunTestsFn} tests
   */
  static describeFeature(documentationModule, configuration, tests) {
    /**
     * Default templates
     * @type {CreateSingleOportunityCriteriaTemplateFn}
     */
    const singleOpportunityCriteriaTemplate = configuration.singleOpportunityCriteriaTemplate 
    || 
    (configuration.testOpportunityCriteria ? ((opportunityType) => [{
      opportunityType,
      opportunityCriteria: configuration.testOpportunityCriteria,
      primary: true,
      control: false,
    }]) : null);

    /**
     * Default template: Two of the same opportunity (via opportunityReuseKey), and one different
     * @type {CreateMultipleOportunityCriteriaTemplateFn}
     */
    const multipleOpportunityCriteriaTemplate = configuration.multipleOpportunityCriteriaTemplate
    ||
    (configuration.testOpportunityCriteria ? (opportunityType, i) => [{
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
    }]: null);

    // Documentation generation

    if (global.documentationGenerationMode)
    {
      const numOpportunitiesUsedPerCriteria = _.defaultTo(configuration.numOpportunitiesUsedPerCriteria, 1);
      /** @type {Map<string, number>} */
      const criteriaRequirement = new Map();
      
      if (!configuration.runOnce) {
        /** @type {OpportunityCriteria[]} */
        const orderItemCriteria = [].concat(
          singleOpportunityCriteriaTemplate === null ? [] : singleOpportunityCriteriaTemplate(null),
          configuration.skipMultiple || multipleOpportunityCriteriaTemplate === null ? [] : multipleOpportunityCriteriaTemplate(null, 0)
        );
        
        orderItemCriteria.forEach(x => {
          if (!criteriaRequirement.has(x.opportunityCriteria)) criteriaRequirement.set(x.opportunityCriteria, 0);
          criteriaRequirement.set(x.opportunityCriteria, criteriaRequirement.get(x.opportunityCriteria) + numOpportunitiesUsedPerCriteria);
        });
      }

      
      documentationModule.exports = /** @type {TestModuleExports} */(Object.assign({}, configuration, {
        criteriaRequirement
      }));
      return;
    }

    const opportunityTypesInScope = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, value]) => value === true).map(([key]) => key);
    const implemented = IMPLEMENTED_FEATURES[configuration.testFeature];

    // Only run the test if it is for the correct implmentation status
    // Do not run tests if they are disabled for this feature (testFeatureImplemented == null)
    if (!(configuration.runOnlyIf !== undefined && !configuration.runOnlyIf) && implemented === configuration.testFeatureImplemented) {
      describe(configuration.testFeature, function () {
        describe(configuration.testIdentifier, function () {
          if (configuration.runOnce) {
            // This duplicate describe nesting ensures the number of describe levels remains consistent for the logger
            describe(configuration.testIdentifier, function () {
              const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier}`, this, {
                config: configuration,
                description: configuration.testDescription,
                implemented,
              });

              const state = new RequestState(logger);
              const flow = new FlowHelper(state);

              tests.bind(this)(configuration, null, implemented, logger, state, flow);
            });
          } else {
            // Create a new test for each opportunityType in scope
            opportunityTypesInScope.forEach((opportunityType) => {
              describe(opportunityType, function () {
                const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (${opportunityType})`, this, {
                  config: configuration,
                  description: configuration.testDescription,
                  implemented,
                  opportunityType: opportunityType
                });

                const state = new RequestState(logger);
                const flow = new FlowHelper(state);

                const orderItemCriteria = singleOpportunityCriteriaTemplate === null ? null : singleOpportunityCriteriaTemplate(opportunityType);

                tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow);
              });
            });

            if (!configuration.skipMultiple) {
              describe("Multiple", function () {
                const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (Multiple)`, this, {
                  config: configuration,
                  description: configuration.testDescription,
                  implemented,
                  opportunityType: "Multiple"
                });

                const state = new RequestState(logger);
                const flow = new FlowHelper(state);

                let orderItemCriteria = [];

                // Create multiple orderItems covering all opportunityTypes in scope
                if (multipleOpportunityCriteriaTemplate !== null) {
                  opportunityTypesInScope.forEach((opportunityType, i) => {
                    orderItemCriteria = orderItemCriteria.concat(multipleOpportunityCriteriaTemplate(opportunityType, i));
                  });
                }

                tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow);
              });
            }
          }
        });
      });
    } else {
      // Jest will fail if no tests are included in a test suite, so this todo keeps it happy
      test.todo('');
    }
  }

  /**
   * @param {NodeModule} documentationModule
   * @param {DescribeFeatureConfiguration} configuration
   */
  static describeRequiredFeature (documentationModule, configuration) {
    this.describeFeature(documentationModule, Object.assign({
      testDescription: 'This feature is required by the specification and must be implemented.',
    }, configuration),
    // eslint-disable-next-line no-unused-vars
    function (_configuration, _orderItemCriteria, _featureIsImplemented, _logger, state, _flow) {
      describe('Feature', function () {
        it('must be implemented', () => {
          // eslint-disable-next-line no-unused-expressions
          throw new Error('This feature is required by the specification, and so cannot be set to "not-implemented".');
        });
      });
    });    
  }
}

module.exports = {
  FeatureHelper,
};
