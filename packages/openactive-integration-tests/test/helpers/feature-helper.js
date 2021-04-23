const _ = require('lodash');
const chakram = require('chakram');

const { Logger } = require('./logger');
const { RequestState } = require('./request-state');
const RequestHelper = require('./request-helper');
const { FlowHelper } = require('./flow-helper');
const { OpportunityCriteriaRequirements, SellerCriteriaRequirements } = require('./criteria-utils');

const { BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE, IMPLEMENTED_FEATURES, AUTHENTICATION_FAILURE, DYNAMIC_REGISTRATION_FAILURE } = global;

/**
 * @typedef {import('../types/OpportunityCriteria').BookingFlow} BookingFlow
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../types/OpportunityCriteria').SellerCriteria} SellerCriteria
 *
 * @typedef {(opportunityType: string, bookingFlow: BookingFlow) => OpportunityCriteria[]} CreateSingleOportunityCriteriaTemplateFn
 * @typedef {(opportunityType: string, bookingFlow: BookingFlow, opportunityReuseKey: number) => OpportunityCriteria[]} CreateMultipleOportunityCriteriaTemplateFn
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
 * @property {boolean} [surviveAuthenticationFailure]
 * @property {boolean} [surviveDynamicRegistrationFailure]
 * @property {number} [numOpportunitiesUsedPerCriteria] How many opportunities
 *   are used by the test per criteria. e.g. if each test iteration needs to
 *   fetch 2 opportunities, this number should be 2.
 *
 *   Used to generate the docs for each test.
 *
 *   Defaults to 1.
 * @property {string[]} [skipOpportunityTypes] Some tests (eg access-channel tests for virtual events) only apply to
 *   certain types of opportunity (in the example provided, access-channel tests should not be run for facility slots)
 *
 * @typedef {(
 *   configuration: DescribeFeatureConfiguration,
 *   orderItemCriteria: OpportunityCriteria[],
 *   implemented: boolean,
 *   logger: InstanceType<typeof Logger>,
 *   state: InstanceType<typeof RequestState>,
 *   flow: InstanceType<typeof FlowHelper>,
 *   opportunityType?: string | null,
 * ) => void} RunTestsFn
 *
 * @typedef {DescribeFeatureConfiguration & {
 *   criteriaRequirement: OpportunityCriteriaRequirements,
 *   sellerCriteriaRequirements: SellerCriteriaRequirements,
 * }} TestModuleExports The CommonJS exports object that is assigned to each test's Node Module.
 *   This is used by the documentation generator to get data about the tests.
 *
 *   `criteriaRequirement` is a map of how many of each opportunity criteria (e.g. TestOpportunityBookable)
 *   is required. THIS FIELD IS OBSOLETE. PLEASE USE sellerCriteriaRequirements, which groups requirements
 *   by seller.
 *
 *   `sellerCriteriaRequirements`: { [sellerCriteria] => { [opportunityCriteria] => [number] } }
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
    || (configuration.testOpportunityCriteria ? ((opportunityType, bookingFlow) => [{
      opportunityType,
      opportunityCriteria: configuration.testOpportunityCriteria,
      primary: true,
      control: false,
      bookingFlow,
    }]) : null);

    /**
     * Default template: Two of the same opportunity (via opportunityReuseKey), and one different
     * @type {CreateMultipleOportunityCriteriaTemplateFn}
     */
    const multipleOpportunityCriteriaTemplate = configuration.multipleOpportunityCriteriaTemplate
    || (configuration.testOpportunityCriteria ? (opportunityType, bookingFlow, i) => [{
      opportunityType,
      opportunityCriteria: configuration.testOpportunityCriteria,
      primary: true,
      control: false,
      opportunityReuseKey: opportunityType === 'IndividualFacilityUseSlot' ? null : i, // IndividualFacilityUseSlot has a capacity limit of 1
      bookingFlow,
    },
    {
      opportunityType,
      opportunityCriteria: configuration.testOpportunityCriteria,
      primary: false,
      control: false,
      opportunityReuseKey: opportunityType === 'IndividualFacilityUseSlot' ? null : i, // IndividualFacilityUseSlot has a capacity limit of 1
      bookingFlow,
    },
    {
      opportunityType,
      opportunityCriteria: configuration.controlOpportunityCriteria,
      primary: false,
      control: true,
      usedInOrderItems: 1,
      bookingFlow,
    }] : null);

    // Documentation generation

    if (global.documentationGenerationMode) {
      const numOpportunitiesUsedPerCriteria = _.defaultTo(configuration.numOpportunitiesUsedPerCriteria, 1);
      const criteriaRequirement = new OpportunityCriteriaRequirements();
      const sellerCriteriaRequirements = new SellerCriteriaRequirements();

      if (!configuration.runOnce) {
        /* Note that we use dummy args for opportunityType & bookingFlow in the criteria template functions here
        because all we want from them is the values for `opportunityCriteria`, which are unrelated. */
        /** @type {OpportunityCriteria[]} */
        const orderItemCriteriaList = [].concat(
          singleOpportunityCriteriaTemplate === null
            ? []
            : singleOpportunityCriteriaTemplate(null, null),
          configuration.skipMultiple || (multipleOpportunityCriteriaTemplate === null
            ? []
            : multipleOpportunityCriteriaTemplate(null, null, 0)),
        );

        for (const orderItemCriteria of orderItemCriteriaList) {
          const sellerCriteria = orderItemCriteria.sellerCriteria || 'primary';
          sellerCriteriaRequirements.get(sellerCriteria).add(orderItemCriteria.opportunityCriteria, numOpportunitiesUsedPerCriteria);
          criteriaRequirement.add(orderItemCriteria.opportunityCriteria, numOpportunitiesUsedPerCriteria);
        }
      }

      // This function mutates its arg, documentationModule
      // eslint-disable-next-line no-param-reassign
      documentationModule.exports = /** @type {TestModuleExports} */({
        ...configuration,
        criteriaRequirement,
        sellerCriteriaRequirements,
      });
      return;
    }

    const opportunityTypesInScope = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, value]) => value === true).map(([key]) => key);
    // TODO this should come from config var
    /** @type {BookingFlow[]} */
    const bookingFlowsInScope = ['https://openactive.io/OpenBookingSimpleFlow'];
    const implemented = IMPLEMENTED_FEATURES[configuration.testFeature];
    const skipOpportunityTypes = _.defaultTo(configuration.skipOpportunityTypes, []);

    // Only run the test if it is for the correct implmentation status
    // Do not run tests if they are disabled for this feature (testFeatureImplemented == null)
    if (
      !(configuration.runOnlyIf !== undefined && !configuration.runOnlyIf)
      && implemented === configuration.testFeatureImplemented
      && !(AUTHENTICATION_FAILURE && !configuration.surviveAuthenticationFailure)
      && !(DYNAMIC_REGISTRATION_FAILURE && !configuration.surviveDynamicRegistrationFailure)
    ) {
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
            // Create a new test for each bookingFlow in scope
            for (const bookingFlow of bookingFlowsInScope) {
              // And create a new test for each opportunityType in scope
              for (const opportunityType of opportunityTypesInScope) {
                if (skipOpportunityTypes.includes(opportunityType)) { continue; }

                describe(opportunityType, function () {
                  const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (${opportunityType})`, this, {
                    config: configuration,
                    description: configuration.testDescription,
                    implemented,
                    opportunityType,
                  });

                  const state = new RequestState(logger);
                  const flow = new FlowHelper(state);

                  const orderItemCriteria = singleOpportunityCriteriaTemplate === null
                    ? null
                    : singleOpportunityCriteriaTemplate(opportunityType, bookingFlow);

                  tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow, opportunityType);
                });
              }
            }

            if (!configuration.skipMultiple) {
              describe('Multiple', function () {
                const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (Multiple)`, this, {
                  config: configuration,
                  description: configuration.testDescription,
                  implemented,
                  opportunityType: 'Multiple',
                });

                const state = new RequestState(logger);
                const flow = new FlowHelper(state);

                const orderItemCriteria = [];

                // Create multiple orderItems covering all opportunityTypes in scope
                if (multipleOpportunityCriteriaTemplate !== null) {
                  // Create a new test for each bookingFlow in scope
                  for (const bookingFlow of bookingFlowsInScope) {
                    opportunityTypesInScope.forEach((opportunityType, i) => {
                      if (!skipOpportunityTypes.includes(opportunityType)) {
                        orderItemCriteria.push(...multipleOpportunityCriteriaTemplate(opportunityType, bookingFlow, i));
                      }
                    });
                  }
                }

                tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow, null);
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
  static describeRequiredFeature(documentationModule, configuration) {
    this.describeFeature(documentationModule, { testDescription: 'This feature is required by the specification and must be implemented.', ...configuration },
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

  /**
   * @param {NodeModule} documentationModule
   * @param {DescribeFeatureConfiguration & {
   *   unmatchedOpportunityCriteria: string[],
   * }} configuration
   */
  static describeUnmatchedCriteriaFeature(documentationModule, configuration) {
    this.describeFeature(documentationModule, {
      testDescription: `Assert that no opportunities that match criteria ${configuration.unmatchedOpportunityCriteria.map(x => `'${x}'`).join(' or ')} are available in the opportunity feeds.`,
      skipMultiple: true,
      runOnce: false,
      ...configuration,
    },
    function (_configuration, orderItemCriteria, _featureIsImplemented, logger, state, _flow, opportunityType) {
      if (opportunityType != null) {
        configuration.unmatchedOpportunityCriteria.forEach((criteria) => {
          describe(`${criteria} opportunity feed items`, function () {
            it(`should be no events matching the [${criteria}](https://openactive.io/test-interface#${criteria}) criteria in the '${opportunityType}' feed(s)`, async () => {
              const requestHelper = new RequestHelper(logger);
              const response = await requestHelper.callAssertUnmatchedCriteria(opportunityType, criteria);
              chakram.expect(response).to.have.status(204);
            });
          });
        });
      }
    });
  }
}

module.exports = {
  FeatureHelper,
};
