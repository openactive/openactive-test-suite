const { isEmpty } = require('lodash');
const { getAllLockedOpportunityIds, getLockedOpportunityIdsInTestDataset } = require('./state-utils');

/**
 * Get a random opportunity from Broker Microservice's cache that matches the
 * criteria.
 *
 * @param {Pick<import('../state').State, 'persistentStore' | 'lockedOpportunityIdsByTestDataset'>} state
 *   ! Mutates `state` by adding the selected opportunity to the test dataset's locked opportunity IDs.
 * @param {object} args
 * @param {string} args.sellerId
 * @param {string} args.bookingFlow
 * @param {string} args.opportunityType
 * @param {string} args.criteriaName
 * @param {string} args.testDatasetIdentifier
 * @returns {Promise<any>}
 */
async function getRandomBookableOpportunity(state, { sellerId, bookingFlow, opportunityType, criteriaName, testDatasetIdentifier }) {
  const matchingOpportunityIds = await state.persistentStore.getCriteriaMatches(criteriaName, bookingFlow, opportunityType, sellerId);
  // const typeBucket = await state.persistentStore.getCriteriaOrientedOpportunityIdCacheTypeBucket(criteriaName, bookingFlow, opportunityType);
  // const sellerCompartment = typeBucket.contents.get(sellerId);
  // if (!sellerCompartment || sellerCompartment.size === 0) {
  if (matchingOpportunityIds.length === 0) {
    // const availableSellers = mapToObjectSummary(typeBucket.contents);
    const availableSellers = await state.persistentStore.getCriteriaAllSellerMatchAmounts(criteriaName, bookingFlow, opportunityType);
    if (!isEmpty(availableSellers)) {
      // We don't show any errors if there are some matches
      return {
        suggestion: 'Try setting sellers.primary.@id in the JSON config to one of the availableSellers below.',
        availableSellers,
        criteriaErrors: undefined,
      };
    }
    /** @type {unknown} */
    let resultCriteriaErrors = await state.persistentStore.getCriteriaErrors(criteriaName, bookingFlow, opportunityType);
    const noUnderlyingCriteriaErrors = isEmpty(resultCriteriaErrors);
    if (noUnderlyingCriteriaErrors) {
      if (bookingFlow === 'OpenBookingApprovalFlow') {
        resultCriteriaErrors = "Ensure that some Offers have an 'openBookingFlowRequirement' property that includes the value 'https://openactive.io/OpenBookingApproval'";
      } else {
        resultCriteriaErrors = "Ensure that some Offers have an 'openBookingFlowRequirement' property that DOES NOT include the value 'https://openactive.io/OpenBookingApproval'";
      }
    }
    const suggestionEnd = noUnderlyingCriteriaErrors
      ? ''
      : ' The number represents the number of items that do not match.';
    return {
      suggestion: `Check criteriaErrors below for reasons why '${opportunityType}' items in your feeds are not matching the criteria '${criteriaName}'.${suggestionEnd}`,
      availableSellers,
      criteriaErrors: resultCriteriaErrors,
    };
    // const criteriaErrors = await state.persistentStore.getCriteriaErrors(criteriaName, bookingFlow, opportunityType);
    // const noCriteriaErrors = bookingFlow === 'OpenBookingApprovalFlow'
    //   ? "Ensure that some Offers have an 'openBookingFlowRequirement' property that includes the value 'https://openactive.io/OpenBookingApproval'"
    //   : "Ensure that some Offers have an 'openBookingFlowRequirement' property that DOES NOT include the value 'https://openactive.io/OpenBookingApproval'";
    // const returnedCriteriaErrors = isEmpty(criteriaErrors) ? noCriteriaErrors : criteriaErrors;
    // const criteriaErrors = !typeBucket.criteriaErrors || typeBucket.criteriaErrors?.size === 0 ? noCriteriaErrors : Object.fromEntries(typeBucket.criteriaErrors);
    // return {
    //   suggestion: (availableSellers
    //     ? 'Try setting sellers.primary.@id in the JSON config to one of the availableSellers below.'
    //     : `Check criteriaErrors below for reasons why '${opportunityType}' items in your feeds are not matching the criteria '${criteriaName}'.${
    //       typeBucket.criteriaErrors?.size > 0
    //       ? ' The number represents the number of items that do not match.'
    //       : ''}`,
    //   availableSellers,
    //   criteriaErrors,
    // };
  } // Seller has no items

  const allLockedOpportunityIds = getAllLockedOpportunityIds(state);
  const unusedBucketItems = matchingOpportunityIds.filter((x) => !allLockedOpportunityIds.has(x));

  if (unusedBucketItems.length === 0) {
    return {
      suggestion: `No enough items matching criteria '${criteriaName}' were included in your feeds to run all tests. Try adding more test data to your system, or consider using 'Controlled Mode'.`,
    };
  }

  const id = unusedBucketItems[Math.floor(Math.random() * unusedBucketItems.length)];

  // Add the item to the testDataset to ensure it does not get reused
  getLockedOpportunityIdsInTestDataset(state, testDatasetIdentifier).add(id);

  return {
    opportunity: {
      '@context': 'https://openactive.io/',
      '@type': getTypeFromOpportunityType(opportunityType),
      '@id': id,
    },
  };
}

/**
 * @param {string} opportunityType
 */
function getTypeFromOpportunityType(opportunityType) {
  /** @type {Record<string, string>} */
  const mapping = {
    ScheduledSession: 'ScheduledSession',
    FacilityUseSlot: 'Slot',
    IndividualFacilityUseSlot: 'Slot',
    CourseInstance: 'CourseInstance',
    HeadlineEvent: 'HeadlineEvent',
    Event: 'Event',
    HeadlineEventSubEvent: 'Event',
    CourseInstanceSubEvent: 'Event',
    OnDemandEvent: 'OnDemandEvent',
  };
  return mapping[opportunityType];
}

module.exports = {
  getRandomBookableOpportunity,
};
