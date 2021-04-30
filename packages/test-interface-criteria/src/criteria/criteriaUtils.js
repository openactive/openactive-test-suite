// const moment = require('moment');
const { isObject, cloneDeep } = require('lodash');
const moment = require('moment');

/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/Options').Options} Options
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 * @typedef {import('../types/Criteria').TestDataShapeFactory} TestDataShapeFactory
 * @typedef {import('../types/TestDataShape').TestDataShape} TestDataShape
 * @typedef {import('../types/TestDataShape').TestDataNodeConstraint} TestDataNodeConstraint
 * @typedef {import('../types/TestDataShape').DateRangeNodeConstraint} DateRangeNodeConstraint
 * @typedef {import('../types/TestDataShape').NumericNodeConstraint} NumericNodeConstraint
 * @typedef {import('../types/TestDataShape').ArrayConstraint} ArrayConstraint
 */

/**
 * @template {TestDataNodeConstraint} TNodeConstraint
 * @param {TNodeConstraint['@type']} expectedType
 * @param {TestDataNodeConstraint} requirement
 * @param {string} criteriaName
 * @returns {TNodeConstraint}
 */
function assertNodeConstraintType(expectedType, requirement, criteriaName) {
  if (requirement['@type'] !== expectedType) {
    throw new Error(`Cannot merge requirements for criteria "${criteriaName}" as they have different types. "${requirement['@type']}" !== "${expectedType}`);
  }
  return /** @type {any} */(requirement);
}

/**
 * @template {TestDataNodeConstraint} TNodeConstraint
 * @template {keyof TNodeConstraint} TFieldName
 * @param {TFieldName} fieldName
 * @param {TNodeConstraint} reqA
 * @param {TNodeConstraint} reqB
 * @param {(reqAField: TNodeConstraint[TFieldName], reqBField: TNodeConstraint[TFieldName]) => TNodeConstraint[TFieldName] | null} getValueIfBothExist
 * @returns {{} | Pick<TNodeConstraint, TFieldName>} This format makes it easy to merge this data into an object literal.
 *   The result will look like e.g. `{ mininclusive: 3 }`.
 *   It can also be an empty object to cater for instances in which neither of the requirements have the field
 *   and therefore this field should not be added to the merged requirement.
 */
function mergeTestDataNodeConstraintField(fieldName, reqA, reqB, getValueIfBothExist) {
  if (reqA[fieldName] == null && reqB[fieldName] == null) {
    return {};
  }
  if (reqA[fieldName] != null) {
    return { [fieldName]: reqA[fieldName] };
  }
  if (reqB[fieldName] != null) {
    return { [fieldName]: reqB[fieldName] };
  }
  const mergedValue = getValueIfBothExist(reqA[fieldName], reqB[fieldName]);
  if (mergedValue == null) { return {}; }
  return { [fieldName]: mergedValue };
}

/**
 * @param {DateRangeNodeConstraint} reqA
 * @param {DateRangeNodeConstraint} reqB
 * @returns {DateRangeNodeConstraint}
 */
function mergeDateRangeNodeConstraints(reqA, reqB) {
  /** @type {DateRangeNodeConstraint} */
  return {
    '@type': 'test:DateRangeNodeConstraint',
    ...mergeTestDataNodeConstraintField('allowNull', reqA, reqB, (a, b) => (a && b ? true : null)),
    ...mergeTestDataNodeConstraintField('minDate', reqA, reqB, (a, b) => (
      moment.max(moment(a), moment(b)).utc().format())),
    ...mergeTestDataNodeConstraintField('maxDate', reqA, reqB, (a, b) => (
      moment.min(moment(a), moment(b)).utc().format())),
  };
}

/**
 * @param {NumericNodeConstraint} reqA
 * @param {NumericNodeConstraint} reqB
 * @returns {NumericNodeConstraint}
 */
function mergeNumericNodeConstraints(reqA, reqB) {
  return {
    '@type': 'NumericNodeConstraint',
    ...mergeTestDataNodeConstraintField('mininclusive', reqA, reqB, Math.max),
    ...mergeTestDataNodeConstraintField('maxinclusive', reqA, reqB, Math.min),
  };
}

/**
 * @param {ArrayConstraint} constraintA
 * @param {ArrayConstraint} constraintB
 * @param {string} criteriaName
 * @returns {ArrayConstraint}
 */
function mergeArrayConstraints(constraintA, constraintB, criteriaName) {
  // assert that datatype is the same
  if (constraintA.datatype !== constraintB.datatype) {
    throw new Error(`Cannot merge ArrayConstraints for criteria "${criteriaName}" as they have different data types. "${constraintA.datatype}" != "${constraintB.datatype}"`);
  }
  // includesAll arrays are merged
  const includesAll = [...new Set([ // dedupe any values that exist in both
    ...(constraintA.includesAll || []),
    ...(constraintB.includesAll || []),
  ])];
  // excludesAll arrays are merged
  const excludesAll = [...new Set([ // dedupe any values that exist in both
    ...(constraintA.excludesAll || []),
    ...(constraintB.excludesAll || []),
  ])];
  // assert that the merged includesAll & excludesAll have no values in common
  if (includesAll.some((value) => excludesAll.includes(value))) {
    throw new Error(`Cannot merge ArrayConstraints for criteria "${criteriaName}" as they have have conflicting includesAll/excludesAll values`);
  }
  // use the highest minLength
  const minLengthOrMinusOne = Math.max(constraintA.minLength ?? -1, constraintB.minLength ?? -1);
  return {
    '@type': 'test:ArrayConstraint',
    datatype: constraintA.datatype,
    ...(includesAll.length > 0 ? { includesAll } : {}),
    ...(excludesAll.length > 0 ? { excludesAll } : {}),
    ...(minLengthOrMinusOne >= 0 ? { minLength: minLengthOrMinusOne } : {}),
  };
}

/**
 * @param {TestDataNodeConstraint} reqA
 * @param {TestDataNodeConstraint} reqB
 * @param {string} criteriaName
 * @returns {TestDataNodeConstraint}
 */
function mergeTestData(reqA, reqB, criteriaName) {
  switch (reqA['@type']) {
    case 'test:DateRangeNodeConstraint':
      return mergeDateRangeNodeConstraints(reqA, assertNodeConstraintType('test:DateRangeNodeConstraint', reqB, criteriaName));
    case 'NumericNodeConstraint':
      return mergeNumericNodeConstraints(reqA, assertNodeConstraintType('NumericNodeConstraint', reqB, criteriaName));
    case 'test:ArrayConstraint':
      return mergeArrayConstraints(reqA, assertNodeConstraintType('test:ArrayConstraint', reqB, criteriaName), criteriaName);
    default:
      throw new Error(`Merging is not supported for requirements of type "${reqA['@type']}" (criteria "${criteriaName}").

Please consider implementing merging for this requirements if necessary.`);
  }
}

/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria['testDataShape']} args.testDataShape
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
function createCriteria({
  name,
  opportunityConstraints,
  offerConstraints,
  testDataShape: testDataShapeFactory,
  includeConstraintsFromCriteria = null,
}) {
  const baseOpportunityConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.opportunityConstraints : [];
  const baseOfferConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.offerConstraints : [];
  /** @type {TestDataShapeFactory} */
  const baseTestDataShapeFactory = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.testDataShape : () => ({
  });
  return {
    name,
    opportunityConstraints: [
      ...baseOpportunityConstraints,
      ...opportunityConstraints,
    ],
    offerConstraints: [
      ...baseOfferConstraints,
      ...offerConstraints,
    ],
    testDataShape: (options) => {
      if (!includeConstraintsFromCriteria) { return testDataShapeFactory(options); }
      const baseTestDataShape = baseTestDataShapeFactory(options);
      const thisTestDataShape = testDataShapeFactory(options);
      return extendTestDataShape(baseTestDataShape, thisTestDataShape, name);
    },
  };
}

/**
 * Merge constraints so that the result has the simplest representation of the combination of all constraints.
 *
 * @param {TestDataShape} baseTestDataShape
 * @param {TestDataShape} extraTestDataShape
 * @param {string} criteriaName
 * @return {TestDataShape}
 */
function extendTestDataShape(baseTestDataShape, extraTestDataShape, criteriaName) {
  const resultTestDataShape = cloneDeep(extraTestDataShape);
  // Do any of the opportunity requirements overlap?
  if (baseTestDataShape.opportunityConstraints && extraTestDataShape.opportunityConstraints) {
    for (const key of Object.keys(baseTestDataShape.opportunityConstraints)) {
      if (key === '@type') { continue; } // this is not a requirement field
      if (key in extraTestDataShape.opportunityConstraints) {
        const baseNodeConstraint = baseTestDataShape.opportunityConstraints[key];
        const thisNodeConstraint = extraTestDataShape.opportunityConstraints[key];
        resultTestDataShape.opportunityConstraints[key] = mergeTestData(baseNodeConstraint, thisNodeConstraint, criteriaName);
      }
    }
  } else if (baseTestDataShape.opportunityConstraints) {
    resultTestDataShape.opportunityConstraints = baseTestDataShape.opportunityConstraints;
  }
  // Do any of the offer requirements overlap?
  if (baseTestDataShape.offerConstraints && extraTestDataShape.offerConstraints) {
    for (const key of Object.keys(baseTestDataShape.offerConstraints)) {
      if (key === '@type') { continue; } // this is not a requirement field
      if (key in extraTestDataShape.offerConstraints) {
        const baseNodeConstraint = baseTestDataShape.offerConstraints[key];
        const thisNodeConstraint = extraTestDataShape.offerConstraints[key];
        resultTestDataShape.offerConstraints[key] = mergeTestData(baseNodeConstraint, thisNodeConstraint, criteriaName);
      }
    }
  } else if (baseTestDataShape.offerConstraints) {
    resultTestDataShape.offerConstraints = baseTestDataShape.offerConstraints;
  }
  return resultTestDataShape;
}

/**
* @param {Opportunity} opportunity
* @returns {string}
*/
function getId(opportunity) {
  // return '@id' in opportunity ? opportunity['@id'] : opportunity.id;
  return opportunity['@id'] || opportunity.id;
}

/**
* @param {Opportunity} opportunity
* @returns {string}
*/
function getType(opportunity) {
  return opportunity['@type'] || opportunity.type;
}

/**
* @param {Opportunity} opportunity
* @returns {boolean}
*/
function hasCapacityLimitOfOne(opportunity) {
  // return true for a Slot of an IndividualFacilityUse, which is limited to a maximumUses of 1 by the specification.
  return opportunity && opportunity.facilityUse && getType(opportunity.facilityUse) === 'IndividualFacilityUse';
}

/**
* @param {Opportunity} opportunity
* @returns {number | null | undefined} Not all opportunities have
*   remainingAttendeeCapacity (which is optional in ScheduledSessions) or
*   remainingUses, therefore the return value may be null-ish.
*/
function getRemainingCapacity(opportunity) {
  return opportunity.remainingAttendeeCapacity !== undefined ? opportunity.remainingAttendeeCapacity : opportunity.remainingUses;
}

/**
* @type {OfferConstraint}
*/
function mustBeWithinBookingWindow(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return null; // Required for validation step
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.validFromBeforeStartDate);

  const valid = start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
}

/**
* @type {OfferConstraint}
*/
function mustRequireAttendeeDetails(offer) {
  return Array.isArray(offer.openBookingFlowRequirement) && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingAttendeeDetails');
}

/**
* @type {OfferConstraint}
*/
function mustNotRequireAttendeeDetails(offer) {
  return !mustRequireAttendeeDetails(offer);
}

/**
 * @type {OfferConstraint}
 */
function mustRequireAdditionalDetails(offer) {
  return Array.isArray(offer.openBookingFlowRequirement) && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingIntakeForm');
}

/**
 * @type {OfferConstraint}
 */
function mustNotRequireAdditionalDetails(offer) {
  return !mustRequireAdditionalDetails(offer);
}

/**
 * @type {OfferConstraint}
 */
function mustAllowProposalAmendment(offer) {
  return Array.isArray(offer.openBookingFlowRequirement) && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingNegotiation');
}

/**
* @type {OfferConstraint}
*/
function mustBeWithinCancellationWindow(offer, opportunity, options) {
  if (!offer || !offer.latestCancellationBeforeStartDate) {
    return null; // Required for validation step
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.latestCancellationBeforeStartDate);

  const valid = !start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
}

/**
* @type {OpportunityConstraint}
*/
function remainingCapacityMustBeAtLeastTwo(opportunity) {
  // A capacity of at least 2 is needed for cases other than IndividualFacilityUse because the multiple OrderItem tests use 2 of the same item (via the opportunityReuseKey).
  // The opportunityReuseKey is not used for IndividualFacilityUse, which is limited to a maximumUses of 1 by the specification.
  return getRemainingCapacity(opportunity) > (hasCapacityLimitOfOne(opportunity) ? 0 : 1);
}

/**
* @type {OpportunityConstraint}
*/
function startDateMustBe2HrsInAdvance(opportunity, options) {
  return moment(options.harvestStartTime).add(moment.duration('P2H')).isBefore(opportunity.startDate);
}

/**
* @type {OpportunityConstraint}
*/
function eventStatusMustNotBeCancelledOrPostponed(opportunity) {
  return !(opportunity.eventStatus === 'https://schema.org/EventCancelled' || opportunity.eventStatus === 'https://schema.org/EventPostponed');
}

/**
* @type {OfferConstraint}
*/
function mustHaveBookableOffer(offer, opportunity, options) {
  return offer.openBookingInAdvance !== 'https://openactive.io/Unavailable'
   && (!offer.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isBefore(options.harvestStartTime));
}

/**
* @type {OfferConstraint}
*/
function mustNotAllowFullRefund(offer) {
  return offer.allowCustomerCancellationFullRefund === false;
}

/**
* @type {OfferConstraint}
*/
function mustAllowFullRefund(offer) {
  return offer.allowCustomerCancellationFullRefund === true;
}

/**
* For a session, get `organizer`. For a facility, get `provider`.
* These can be used interchangeably as `organizer` is either a Person or an Organization
* and `provider` is an Organization.
*
* @param {Opportunity} opportunity
*/
function getOrganizerOrProvider(opportunity) {
  if (isObject(opportunity.superEvent)) {
    // TS doesn't allow accessing unknown fields of an `object` type - not sure why
    return /** @type {any} */(opportunity.superEvent).organizer;
  }
  if (isObject(opportunity.facilityUse)) {
    // TS doesn't allow accessing unknown fields of an `object` type - not sure why
    return /** @type {any} */(opportunity.facilityUse).provider;
  }
  throw new Error(`Opportunity has neither superEvent nor facilityUse from which to get organizer/provider. Opportunity fields: ${Object.keys(opportunity).join(', ')}`);
}

/**
 * @type {OpportunityConstraint}
 */
function sellerMustAllowOpenBooking(opportunity) {
  const organizerOrProvider = getOrganizerOrProvider(opportunity);
  return organizerOrProvider.isOpenBookingAllowed === true;
}

module.exports = {
  createCriteria,
  getId,
  getType,
  getRemainingCapacity,
  mustBeWithinBookingWindow,
  mustBeWithinCancellationWindow,
  hasCapacityLimitOfOne,
  remainingCapacityMustBeAtLeastTwo,
  mustRequireAttendeeDetails,
  mustNotRequireAttendeeDetails,
  mustAllowProposalAmendment,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  mustHaveBookableOffer,
  getOrganizerOrProvider,
  mustNotAllowFullRefund,
  mustAllowFullRefund,
  mustRequireAdditionalDetails,
  mustNotRequireAdditionalDetails,
  sellerMustAllowOpenBooking,
  extendTestDataShape,
};
