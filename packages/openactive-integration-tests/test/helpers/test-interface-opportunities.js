const { getTestDataShapeExpressions } = require('@openactive/test-interface-criteria');

/**
 * @typedef {import('../types/TestInterfaceOpportunity').TestInterfaceOpportunity} TestInterfaceOpportunity
 */

const { HARVEST_START_TIME } = global;

/**
 * Create opportunity data for sending to https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities
 *
 * @param {string} opportunityType
 * @param {string} testOpportunityCriteria
 * @param {string | null} [sellerId]
 * @param {string | null} [sellerType]
 * @returns {TestInterfaceOpportunity}
 */
function createTestInterfaceOpportunity(opportunityType, testOpportunityCriteria, sellerId = null, sellerType = null) {
  const remainingCapacityPredicate = opportunityType === 'FacilityUseSlot' || opportunityType === 'IndividualFacilityUseSlot' ? 'oa:remainingUses' : 'schema:remainingAttendeeCapacity';
  const testDataShapeExpressions = getTestDataShapeExpressions(testOpportunityCriteria, remainingCapacityPredicate, { harvestStartTime: HARVEST_START_TIME });
  /** @type {Pick<TestInterfaceOpportunity, '@context' | 'test:testOpportunityCriteria' | 'test:testOpportunityDataShapeExpression' | 'test:testOfferDataShapeExpression'>} */
  const testInterfaceOpportunityFields = {
    '@context': [
      'https://openactive.io/',
      'https://openactive.io/test-interface',
    ],
    'test:testOpportunityCriteria': `https://openactive.io/test-interface#${testOpportunityCriteria}`,
    'test:testOpportunityDataShapeExpression': testDataShapeExpressions['test:testOpportunityDataShapeExpression'],
    'test:testOfferDataShapeExpression': testDataShapeExpressions['test:testOfferDataShapeExpression'],
  };
  const seller = sellerId ? {
    '@type': sellerType,
    '@id': sellerId,
  } : undefined;
  switch (opportunityType) {
    case 'ScheduledSession':
      return {
        '@type': 'ScheduledSession',
        superEvent: {
          '@type': 'SessionSeries',
          organizer: seller,
        },
        ...testInterfaceOpportunityFields,
      };
    case 'FacilityUseSlot':
      return {
        '@type': 'Slot',
        facilityUse: {
          '@type': 'FacilityUse',
          provider: seller,
        },
        ...testInterfaceOpportunityFields,
      };
    case 'IndividualFacilityUseSlot':
      return {
        '@type': 'Slot',
        facilityUse: {
          '@type': 'IndividualFacilityUse',
          provider: seller,
        },
        ...testInterfaceOpportunityFields,
      };
    case 'CourseInstance':
      return {
        '@type': 'CourseInstance',
        organizer: seller,
        ...testInterfaceOpportunityFields,
      };
    case 'CourseInstanceSubEvent':
      return {
        '@type': 'Event',
        superEvent: {
          '@type': 'CourseInstance',
          organizer: seller,
        },
        ...testInterfaceOpportunityFields,
      };
    case 'HeadlineEvent':
      return {
        '@type': 'HeadlineEvent',
        organizer: seller,
        ...testInterfaceOpportunityFields,
      };
    case 'HeadlineEventSubEvent':
      return {
        '@type': 'Event',
        superEvent: {
          '@type': 'HeadlineEvent',
          organizer: seller,
        },
        ...testInterfaceOpportunityFields,
      };
    case 'Event':
      return {
        '@type': 'Event',
        organizer: seller,
        ...testInterfaceOpportunityFields,
      };
    case 'OnDemandEvent':
      return {
        '@type': 'OnDemandEvent',
        organizer: seller,
        ...testInterfaceOpportunityFields,
      };
    default:
      throw new Error('Unrecognised opportunity type');
  }
}

module.exports = {
  createTestInterfaceOpportunity,
};
