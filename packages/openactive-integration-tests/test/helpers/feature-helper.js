const _ = require('lodash');
const { expect } = require('chai');
const chakram = require('chakram');

const { Logger } = require('./logger');
const RequestHelper = require('./request-helper');
const { OpportunityCriteriaRequirements, SellerCriteriaRequirements } = require('./criteria-utils');
const { DescribeFeatureRecord } = require('./describe-feature-record');

const { BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE, BOOKING_FLOWS_IN_SCOPE, IMPLEMENTED_FEATURES, AUTHENTICATION_FAILURE, DYNAMIC_REGISTRATION_FAILURE } = global;

const { SINGLE_FLOW_PATH_MODE } = process.env;

// TODO2 doc
const FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME = 'Feature Description Assertions (for OpenActive maintainers)';

/**
 * @typedef {import('../types/OpportunityCriteria').BookingFlow} BookingFlow
 * @typedef {import('../types/OpportunityCriteria').OpportunityType} OpportunityType
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
 * @property {boolean} [skipMultiple] If true, this test will not be run in
 *   Multiple Opportunities mode i.e. with multiple Opportunities in one Order.
 * @property {string[]} [testInterfaceActions] TODO2 doc also mention that no need to include duplicates
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
 * @property {OpportunityType[]} [skipOpportunityTypes] Some tests (eg access-channel tests for virtual events) only apply to
 *   certain types of opportunity (in the example provided, access-channel tests should not be run for facility slots)
 * @property {BookingFlow[]} [skipBookingFlows] This test will not be run for any of these Booking Flows
 *
 * @typedef {(
 *   configuration: DescribeFeatureConfiguration,
 *   orderItemCriteria: OpportunityCriteria[],
 *   implemented: boolean,
 *   logger: InstanceType<typeof Logger>,
 *   describeFeatureRecord: import('./describe-feature-record').DescribeFeatureRecord,
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
      || (configuration.testOpportunityCriteria
        ? createDefaultMultipleOpportunityCriteriaTemplateFn({
          testOpportunityCriteria: configuration.testOpportunityCriteria,
          controlOpportunityCriteria: configuration.controlOpportunityCriteria,
        })
        : null);

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
      [], // the default value if skipBookingFlows is not set.
    ));

    const opportunityTypesInScope = getEnabledFeaturesFromObj(/** @type {{[k in OpportunityType]: boolean}} */(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE), skipOpportunityTypes);
    const bookingFlowsInScope = getEnabledFeaturesFromObj(BOOKING_FLOWS_IN_SCOPE, skipBookingFlows);
    const implemented = IMPLEMENTED_FEATURES[configuration.testFeature];

    // Selections for SINGLE_FLOW_PATH_MODE
    const bookingFlowsSingleSelection = (SINGLE_FLOW_PATH_MODE || '').split('/')[0];
    const opportunityTypesSingleSelection = (SINGLE_FLOW_PATH_MODE || '').split('/')[1];

    // TODO2 doc
    /**
     * @param {DescribeFeatureRecord} describeFeatureRecord
     * @param {BookingFlow} [bookingFlow] TODO2 doc
     */
    const itAssertTestInterfaceActionsUsedAsSpecified = (describeFeatureRecord, bookingFlow) => {
      const testInterfaceActions = configuration.testInterfaceActions ?? [];
      // TODO2 make this non-alarming to users when a test fails. Make clear that this is only important
      // to a maintainer and then only if this test fails where other tests pass and so make an issue if
      // that happens
      describe(FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME, () => {
        it('Feature Description `.testInterfaceActions` should match the Test Interface Actions that were used in the test', () => {
          const expectedUsedTestInterfaceActions = [...testInterfaceActions].sort();
          // const usedTestInterfaceActions = [...describeFeatureRecord.getUsedTestInterfaceActions()].sort();
          const usedTestInterfaceActions = (() => {
            const allUsedTestInterfaceActions = [...describeFeatureRecord.getUsedTestInterfaceActions()].sort();
            // TODO2 ensure that approvalFlow means that this action is always required in test-data-generator script
            // TODO2 doc
            if (bookingFlow === 'OpenBookingApprovalFlow'
              && !expectedUsedTestInterfaceActions.includes('test:SellerAcceptOrderProposalSimulateAction')
              && allUsedTestInterfaceActions.includes('test:SellerAcceptOrderProposalSimulateAction')
            ) {
              return allUsedTestInterfaceActions
                .filter(x => x !== 'test:SellerAcceptOrderProposalSimulateAction');
            }
            return allUsedTestInterfaceActions;
          })();

          // TODO2 doc use of stringify
          expect(JSON.stringify(usedTestInterfaceActions))
            .to.deep.equal(JSON.stringify(expectedUsedTestInterfaceActions));
        });
      });
    };

    // Only run the test if it is for the correct implmentation status
    // Do not run tests if they are disabled for this feature (testFeatureImplemented == null)
    if (
      !(configuration.runOnlyIf !== undefined && !configuration.runOnlyIf)
      && implemented === configuration.testFeatureImplemented
      && !(AUTHENTICATION_FAILURE && !configuration.surviveAuthenticationFailure)
      && !(DYNAMIC_REGISTRATION_FAILURE && !configuration.surviveDynamicRegistrationFailure)
      && (bookingFlowsInScope.length > 0)
      && (opportunityTypesInScope.length > 0)
      // @ts-ignore
      && (!SINGLE_FLOW_PATH_MODE || (bookingFlowsInScope.includes(bookingFlowsSingleSelection) && (opportunityTypesInScope.includes(opportunityTypesSingleSelection) || (!configuration.skipMultiple && opportunityTypesSingleSelection === 'Multiple'))))
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

                const describeFeatureRecord = new DescribeFeatureRecord();
                tests.bind(this)(configuration, null, implemented, logger, describeFeatureRecord);

                itAssertTestInterfaceActionsUsedAsSpecified(describeFeatureRecord);
              });
            });
          } else {
            // Create a new test for each bookingFlow in scope
            for (const bookingFlow of bookingFlowsInScope) {
              if (SINGLE_FLOW_PATH_MODE && bookingFlow !== bookingFlowsSingleSelection) continue;
              describe(bookingFlow, () => {
                // And create a new test for each opportunityType in scope
                for (const opportunityType of opportunityTypesInScope) {
                  if (SINGLE_FLOW_PATH_MODE && opportunityType !== opportunityTypesSingleSelection) continue;
                  describe(opportunityType, function () {
                    const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (${bookingFlow} >> ${opportunityType})`, this, {
                      config: configuration,
                      description: configuration.testDescription,
                      implemented,
                      bookingFlow,
                      opportunityType,
                    });

                    const orderItemCriteria = singleOpportunityCriteriaTemplate === null
                      ? null
                      : singleOpportunityCriteriaTemplate(opportunityType, bookingFlow);

                    const describeFeatureRecord = new DescribeFeatureRecord();
                    tests.bind(this)(configuration, orderItemCriteria, implemented, logger, describeFeatureRecord, opportunityType, bookingFlow);

                    itAssertTestInterfaceActionsUsedAsSpecified(describeFeatureRecord, bookingFlow);
                  });
                }

                if (!configuration.skipMultiple && (!SINGLE_FLOW_PATH_MODE || opportunityTypesSingleSelection === 'Multiple')) {
                  describe('Multiple', function () {
                    const logger = new Logger(`${configuration.testFeature} >> ${configuration.testIdentifier} (${bookingFlow} >> Multiple)`, this, {
                      config: configuration,
                      description: configuration.testDescription,
                      implemented,
                      bookingFlow,
                      opportunityType: 'Multiple',
                    });

                    const orderItemCriteria = [];

                    // Create multiple orderItems covering all opportunityTypes in scope
                    if (multipleOpportunityCriteriaTemplate !== null) {
                      opportunityTypesInScope.forEach((opportunityType, i) => {
                        orderItemCriteria.push(...multipleOpportunityCriteriaTemplate(opportunityType, bookingFlow, i));
                      });
                    }

                    const describeFeatureRecord = new DescribeFeatureRecord();
                    tests.bind(this)(configuration, orderItemCriteria, implemented, logger, describeFeatureRecord, null, bookingFlow);

                    itAssertTestInterfaceActionsUsedAsSpecified(describeFeatureRecord, bookingFlow);
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
      (_configuration, _orderItemCriteria, _featureIsImplemented, _logger) => {
        describe('Feature', () => {
          it('must be implemented', () => {
            throw new Error('This feature is required by the specification, and so cannot be set to "not-implemented".');
          });
        });
      });
  }

  /**
   * Use this for a `not-implemented` test for a feature that should be implemented if another given
   * set of features are.
   *
   * @param {NodeModule} documentationModule
   * @param {Omit<DescribeFeatureConfiguration, 'skipMultiple' | 'doesNotUseOpportunitiesMode'> & {
   *   otherFeaturesWhichImplyThisOne: string[];
   * }} configuration
   *   - `otherFeaturesWhichImplyThisOne` is an array of feature names. If any
   *     of these features are implemented, then the feature in focus MUST also
   *     be implemented
   */
  static describeFeatureShouldBeImplementedIfOtherFeaturesAre(documentationModule, configuration) {
    const otherFeaturesSummary = configuration.otherFeaturesWhichImplyThisOne.map(f => `'${f}'`).join(' and ');
    this.describeFeature(documentationModule, {
      testDescription: `This feature must be implemented if features: ${otherFeaturesSummary} are implemented`,
      skipMultiple: true,
      doesNotUseOpportunitiesMode: true,
      ...configuration,
    }, () => {
      describe('Feature', () => {
        it(`must be implemented if other features: ${otherFeaturesSummary} are`, () => {
          expect(IMPLEMENTED_FEATURES).to.not.include(
            Object.fromEntries(configuration.otherFeaturesWhichImplyThisOne.map(f => [f, true])),
          );
        });
      });
    });
  }

  /**
   * Use this for a `not-implemented` test for a feature that should be
   * implemented if another given set of features are NOT. i.e. this feature
   * is mutually exclusive with another set of features.
   *
   * @param {NodeModule} documentationModule
   * @param {Omit<DescribeFeatureConfiguration, 'skipMultiple' | 'doesNotUseOpportunitiesMode'> & {
   *   otherFeaturesWhichAreMutuallyExclusiveWithThisOne: string[];
   * }} configuration
   *   - `otherFeaturesWhichAreMutuallyExclusiveWithThisOne` is an array of
   *     feature names. If all of these features are not implemented, then
   *     the feature in focus MUST be implemented.
   */
  static describeFeatureShouldBeImplementedIfOtherFeaturesAreNot(documentationModule, configuration) {
    const otherFeaturesSummary = configuration.otherFeaturesWhichAreMutuallyExclusiveWithThisOne
      .map(f => `'${f}'`)
      .join(' and ');
    this.describeFeature(documentationModule, {
      testDescription: `This feature must be implemented if features: ${otherFeaturesSummary} are NOT implemented`,
      skipMultiple: true,
      doesNotUseOpportunitiesMode: true,
      ...configuration,
    }, () => {
      describe('Feature', () => {
        it(`must be implemented if other features: ${otherFeaturesSummary} are NOT`, () => {
          expect(IMPLEMENTED_FEATURES).to.include(
            Object.fromEntries(
              configuration.otherFeaturesWhichAreMutuallyExclusiveWithThisOne.map(
                f => [f, true],
              ),
            ),
          );
        });
      });
    });
  }

  /**
   * Use this for a `not-implemented` test for a feature that should be implemented if a specific flow is implemented.
   *
   * @param {NodeModule} documentationModule
   * @param {Omit<DescribeFeatureConfiguration, 'testDescription' | 'skipMultiple' | 'doesNotUseOpportunitiesMode'> & {
    *   flowsThatImplyThisFeature: string[];
    * }} configuration
    */
  static describeFeatureShouldBeImplementedIfFlowIsImplemented(documentationModule, configuration) {
    const flowSummary = configuration.flowsThatImplyThisFeature.map(f => `\`${f}\``).join(' and ');
    this.describeFeature(documentationModule, {
      testDescription: `This feature '${configuration.testFeature}' must be implemented if ${flowSummary} is implemented`,
      skipMultiple: true,
      doesNotUseOpportunitiesMode: true,
      ...configuration,
    }, () => {
      describe('Feature', () => {
        it(`'${configuration.testFeature}' must be implemented if ${flowSummary} is set to \`true\` in the test suite configuration.`, () => {
          expect(BOOKING_FLOWS_IN_SCOPE).to.not.include(
            Object.fromEntries(configuration.flowsThatImplyThisFeature.map(f => [f, true])),
          );
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
    }, (_configuration, _orderItemCriteria, _featureIsImplemented, logger, _describeFeatureRecord, opportunityType, bookingFlow) => {
      if (opportunityType != null) {
        configuration.unmatchedOpportunityCriteria.forEach((criteria) => {
          describe(`${criteria} opportunity feed items`, () => {
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

/**
 * @param {object} args
 * @param {string} args.testOpportunityCriteria
 * @param {string} args.controlOpportunityCriteria
 * @param {SellerCriteria} [args.sellerCriteria] Identifier of Seller Config e.g. 'primary'
 * @returns {CreateMultipleOportunityCriteriaTemplateFn}
 */
function createDefaultMultipleOpportunityCriteriaTemplateFn({ testOpportunityCriteria, controlOpportunityCriteria, sellerCriteria }) {
  return (opportunityType, bookingFlow, i) => {
    /** @type {OpportunityCriteria[]} */
    const result = [
      {
        opportunityType,
        opportunityCriteria: testOpportunityCriteria,
        primary: true,
        control: false,
        opportunityReuseKey: opportunityType === 'IndividualFacilityUseSlot' ? null : i, // IndividualFacilityUseSlot has a capacity limit of 1
        bookingFlow,
      },
      {
        opportunityType,
        opportunityCriteria: testOpportunityCriteria,
        primary: false,
        control: false,
        opportunityReuseKey: opportunityType === 'IndividualFacilityUseSlot' ? null : i, // IndividualFacilityUseSlot has a capacity limit of 1
        bookingFlow,
      },
      {
        opportunityType,
        opportunityCriteria: controlOpportunityCriteria,
        primary: false,
        control: true,
        usedInOrderItems: 1,
        bookingFlow,
      },
    ];
    if (sellerCriteria) {
      for (const resultItem of result) {
        resultItem.sellerCriteria = sellerCriteria;
      }
    }
    return result;
  };
}

module.exports = {
  FeatureHelper,
  createDefaultMultipleOpportunityCriteriaTemplateFn,
  FEATURE_DESCRIPTION_ASSERTIONS_TEST_NAME: FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME,
};
