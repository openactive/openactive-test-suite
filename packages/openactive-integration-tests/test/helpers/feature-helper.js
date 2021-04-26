const _ = require('lodash');
const chakram = require('chakram');

const { Logger } = require('./logger');
const { RequestState } = require('./request-state');
const RequestHelper = require('./request-helper');
const { FlowHelper } = require('./flow-helper');
const { OpportunityCriteriaRequirements, SellerCriteriaRequirements } = require('./criteria-utils');

const { BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE, BOOKING_FLOWS_IN_SCOPE, IMPLEMENTED_FEATURES, AUTHENTICATION_FAILURE, DYNAMIC_REGISTRATION_FAILURE } = global;

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
 * @property {boolean} [doesNotUseOpportunitiesMode] If true, this test will not bother with finding opportunities that
 *   match some criteria.
 *   Instead of running once for each OpportunityType and once for each BookingFlow, this test will just run once - as
 *   these combinations are irrelevant to it as it does not use opportunities.
 *   Use this for things like testing a Booking System's auth
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
 * @property {boolean} [supportsApproval] TEMPORARY field until approval works for all tests. Approval will only be
 *   attempted for a test that has this field set to true (unless skipBookingFlows is set).
 * @property {BookingFlow[]} [skipBookingFlows] This test will not be run for any of these Booking Flows
 *
 * @typedef {(
 *   configuration: DescribeFeatureConfiguration,
 *   orderItemCriteria: OpportunityCriteria[],
 *   implemented: boolean,
 *   logger: InstanceType<typeof Logger>,
 *   state: InstanceType<typeof RequestState>,
 *   flow: InstanceType<typeof FlowHelper>,
 *   opportunityType?: string | null,
 *   bookingFlow?: BookingFlow | null,
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
    if (configuration.doesNotUseOpportunitiesMode && (
      configuration.testOpportunityCriteria
      || configuration.singleOpportunityCriteriaTemplate
      || configuration.multipleOpportunityCriteriaTemplate)
    ) {
      throw new Error(`doesNotUseOpportunitiesMode cannot be used in conjunction with opportunity criteria settings as the former means that no opportunities whatsoever will be used. Test: "${configuration.testIdentifier}"`);
    }
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

      if (!configuration.doesNotUseOpportunitiesMode) {
        /* Note that we use dummy args for opportunityType & bookingFlow in the criteria template functions here
        because all we want from them is the values for `opportunityCriteria`, which are unrelated. */
        /** @type {OpportunityCriteria[]} */
        const orderItemCriteriaList = [].concat(
          singleOpportunityCriteriaTemplate === null
            ? []
            : singleOpportunityCriteriaTemplate(null, null),
          ((configuration.skipMultiple || multipleOpportunityCriteriaTemplate === null)
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
    const skipOpportunityTypes = new Set(_.defaultTo(configuration.skipOpportunityTypes, []));
    /** @type {Set<BookingFlow>} */
    const skipBookingFlows = new Set(_.defaultTo(
      configuration.skipBookingFlows,
      configuration.supportsApproval
        ? []
        : ['OpenBookingApprovalFlow'], // the default value if neither skipBookingFlows nor supportsApproval are set.
    ));

    const opportunityTypesInScope = getEnabledFeaturesFromObj(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE, skipOpportunityTypes);
    // TODO TODO TODO deleteme
    if (!BOOKING_FLOWS_IN_SCOPE) {
      console.error('BOOKING_FLOWS_IN_SCOPE is mysteriously absent. configuration:', configuration);
      throw new Error(`BOOKING_FLOWS_IN_SCOPE is mysteriously absent. configuration: ${JSON.stringify({
        configuration,
        BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE,
        BOOKING_FLOWS_IN_SCOPE,
      })}`);
    }
    const bookingFlowsInScope = getEnabledFeaturesFromObj(BOOKING_FLOWS_IN_SCOPE, skipBookingFlows);
    const implemented = IMPLEMENTED_FEATURES[configuration.testFeature];

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
          if (configuration.doesNotUseOpportunitiesMode) {
            // Here we add some describe blocks so that these test uses the exact same number of describe levels as
            // normal tests. This means that the logger (which looks at number of describe levels) can be used
            // consistently across tests.
            describe('_NoFlow_', () => {
              describe('_NoOpportunityType_', function () {
                const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier}`, this, {
                  config: configuration,
                  description: configuration.testDescription,
                  implemented,
                });

                const state = new RequestState(logger);
                const flow = new FlowHelper(state);

                tests.bind(this)(configuration, null, implemented, logger, state, flow);
              });
            });
          } else {
            // Create a new test for each bookingFlow in scope
            for (const bookingFlow of bookingFlowsInScope) {
              describe(bookingFlow, () => {
                // And create a new test for each opportunityType in scope
                for (const opportunityType of opportunityTypesInScope) {
                  describe(opportunityType, function () {
                    const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (${bookingFlow} >> ${opportunityType})`, this, {
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

                    tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow, opportunityType, bookingFlow);
                  });
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
                      opportunityTypesInScope.forEach((opportunityType, i) => {
                        orderItemCriteria.push(...multipleOpportunityCriteriaTemplate(opportunityType, bookingFlow, i));
                      });
                    }

                    tests.bind(this)(configuration, orderItemCriteria, implemented, logger, state, flow, null, bookingFlow);
                  });
                }
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
      doesNotUseOpportunitiesMode: false,
      ...configuration,
    },
    function (_configuration, orderItemCriteria, _featureIsImplemented, logger, state, _flow, opportunityType, bookingFlow) {
      if (opportunityType != null) {
        configuration.unmatchedOpportunityCriteria.forEach((criteria) => {
          describe(`${criteria} opportunity feed items`, function () {
            it(`should be no events matching the [${criteria}](https://openactive.io/test-interface#${criteria}) criteria in the '${opportunityType}' feed(s)`, async () => {
              const requestHelper = new RequestHelper(logger);
              const response = await requestHelper.callAssertUnmatchedCriteria({
                opportunityType,
                testOpportunityCriteria: criteria,
                bookingFlow,
              });
              chakram.expect(response).to.have.status(204);
            });
          });
        });
      }
    });
  }
}

/**
 * @template {string} TFeatureName
 * @param {{ [featureName in TFeatureName]: boolean}} featuresObj
 * @param {Set<TFeatureName>} featuresToSkip
 * @returns {TFeatureName[]}
 */
function getEnabledFeaturesFromObj(featuresObj, featuresToSkip) {
  return /** @type {[TFeatureName, boolean][]} */(Object.entries(featuresObj))
    .filter(([key, value]) => value === true && !featuresToSkip.has(key))
    .map(([key]) => key);
}

module.exports = {
  FeatureHelper,
};
