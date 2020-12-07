// const moment = require('moment');
const { isObject } = require('lodash');
const moment = require('moment');

/**
 * @typedef {import('../types/Opportunity').Opportunity} Opportunity
 * @typedef {import('../types/Offer').Offer} Offer
 * @typedef {import('../types/Options').Options} Options
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 * @typedef {import('../types/Criteria').Criteria} Criteria
 * @typedef {import('../types/Criteria').TestDataRequirementsFactory} TestDataRequirementsFactory
 * @typedef {import('../types/TestDataRequirements').TestDataRequirements} TestDataRequirements
 * @typedef {import('../types/TestDataRequirements').TestDataFieldRequirement} TestDataFieldRequirement
 * @typedef {import('../types/TestDataRequirements').DateRange} DateRange
 * @typedef {import('../types/TestDataRequirements').QuantitativeValue} QuantitativeValue
 */

/**
 * @template {TestDataFieldRequirement} TRequirement
 * @param {TRequirement['@type']} expectedType
 * @param {TestDataFieldRequirement} requirement
 * @param {string} criteriaName
 * @returns {TRequirement}
 */
function assertFieldRequirementType(expectedType, requirement, criteriaName) {
  if (requirement['@type'] !== expectedType) {
    throw new Error(`Cannot merge requirements for criteria "${criteriaName}" as they have different types. "${requirement['@type']}" !== "${expectedType}`);
  }
  return /** @type {any} */(requirement);
}

/**
 * @template {TestDataFieldRequirement} TRequirement
 * @template {keyof TRequirement} TFieldName
 * @param {TFieldName} fieldName
 * @param {TRequirement} reqA
 * @param {TRequirement} reqB
 * @param {(reqAField: TRequirement[TFieldName], reqBField: TRequirement[TFieldName]) => TRequirement[TFieldName] | null} getValueIfBothExist
 * @returns {{} | Pick<TRequirement, TFieldName>} This format makes it easy to merge this data into an object literal.
 *   The result will look like e.g. `{ minValue: 3 }`.
 *   It can also be an empty object to cater for instances in which neither of the requirements have the field
 *   and therefore this field should not be added to the merged requirement.
 */
function mergeTestDataFieldRequirementField(fieldName, reqA, reqB, getValueIfBothExist) {
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
 * @param {DateRange} reqA
 * @param {DateRange} reqB
 * @returns {DateRange}
 */
function mergeDateRanges(reqA, reqB) {
  /** @type {DateRange} */
  return {
    '@type': 'test:DateRange',
    ...mergeTestDataFieldRequirementField('allowNull', reqA, reqB, (a, b) => (a && b ? true : null)),
    ...mergeTestDataFieldRequirementField('minDate', reqA, reqB, (a, b) => (
      moment.max(moment(a), moment(b)).utc().format())),
    ...mergeTestDataFieldRequirementField('maxDate', reqA, reqB, (a, b) => (
      moment.min(moment(a), moment(b)).utc().format())),
  };
}

/**
 * @param {QuantitativeValue} reqA
 * @param {QuantitativeValue} reqB
 * @returns {QuantitativeValue}
 */
function mergeQuantitativeValues(reqA, reqB) {
  return {
    '@type': 'QuantitativeValue',
    ...mergeTestDataFieldRequirementField('minValue', reqA, reqB, Math.max),
    ...mergeTestDataFieldRequirementField('maxValue', reqA, reqB, Math.min),
  };
}

/**
 * @param {TestDataFieldRequirement} reqA
 * @param {TestDataFieldRequirement} reqB
 * @param {string} criteriaName
 * @returns {TestDataFieldRequirement}
 */
function mergeTestData(reqA, reqB, criteriaName) {
  switch (reqA['@type']) {
    case 'test:DateRange':
      return mergeDateRanges(reqA, assertFieldRequirementType('test:DateRange', reqB, criteriaName));
    case 'QuantitativeValue':
      return mergeQuantitativeValues(reqA, assertFieldRequirementType('QuantitativeValue', reqB, criteriaName));
    default:
      throw new Error(`Merging is not supported for requirements of type "${reqA['@type']}" (criteria "${criteriaName}")`);
  }
}

/**
 * @param {object} args
 * @param {string} args.name
 * @param {Criteria['opportunityConstraints']} args.opportunityConstraints
 * @param {Criteria['offerConstraints']} args.offerConstraints
 * @param {Criteria['testDataRequirements']} args.testDataRequirements
 * @param {Criteria | null} [args.includeConstraintsFromCriteria] If provided,
 *   opportunity and offer constraints will be included from this criteria.
 * @returns {Criteria}
 */
function createCriteria({
  name,
  opportunityConstraints,
  offerConstraints,
  testDataRequirements: testDataRequirementsFactory,
  includeConstraintsFromCriteria = null,
}) {
  const baseOpportunityConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.opportunityConstraints : [];
  const baseOfferConstraints = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.offerConstraints : [];
  /** @type {TestDataRequirementsFactory} */
  const baseTestDataRequirementsFactory = includeConstraintsFromCriteria ? includeConstraintsFromCriteria.testDataRequirements : () => ({
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
    testDataRequirements: (options) => {
      if (!includeConstraintsFromCriteria) { return testDataRequirementsFactory(options); }
      const baseTestDataRequirements = baseTestDataRequirementsFactory(options);
      const thisTestDataRequirements = testDataRequirementsFactory(options);
      // TODO TODO TODO run test-data-generator and see the issue
      // TODO if needed, create functionality for merging requirements. e.g. two dateRanges could be merged by taking the latest minDate and the earliest maxDate (i.e. an intersection of both requirements)
      // Do any of the opportunity requirements overlap?
      if (baseTestDataRequirements['test:testOpportunityDataRequirements'] && thisTestDataRequirements['test:testOpportunityDataRequirements']) {
        for (const key of Object.keys(baseTestDataRequirements['test:testOpportunityDataRequirements'])) {
          if (key === '@type') { continue; } // this is not a requirement field
          if (key in thisTestDataRequirements['test:testOpportunityDataRequirements']) {
            const baseFieldRequirement = baseTestDataRequirements['test:testOpportunityDataRequirements'][key];
            const thisFieldRequirement = thisTestDataRequirements['test:testOpportunityDataRequirements'][key];
            thisTestDataRequirements['test:testOpportunityDataRequirements'][key] = mergeTestData(baseFieldRequirement, thisFieldRequirement, name);
          }
        }
      } else if (baseTestDataRequirements['test:testOpportunityDataRequirements']) {
        thisTestDataRequirements['test:testOpportunityDataRequirements'] = baseTestDataRequirements['test:testOpportunityDataRequirements'];
      }
      // Do any of the offer requirements overlap?
      if (baseTestDataRequirements['test:testOfferDataRequirements'] && thisTestDataRequirements['test:testOfferDataRequirements']) {
        for (const key of Object.keys(baseTestDataRequirements['test:testOfferDataRequirements'])) {
          if (key === '@type') { continue; } // this is not a requirement field
          if (key in thisTestDataRequirements['test:testOfferDataRequirements']) {
            const baseFieldRequirement = baseTestDataRequirements['test:testOfferDataRequirements'][key];
            const thisFieldRequirement = thisTestDataRequirements['test:testOfferDataRequirements'][key];
            thisTestDataRequirements['test:testOfferDataRequirements'][key] = mergeTestData(baseFieldRequirement, thisFieldRequirement, name);
          }
        }
      } else if (baseTestDataRequirements['test:testOfferDataRequirements']) {
        thisTestDataRequirements['test:testOfferDataRequirements'] = baseTestDataRequirements['test:testOfferDataRequirements'];
      }
      return thisTestDataRequirements;
      // /**
      //  * Combine the test data requirements from the base criteria with the new criteria by
      //  * choosing, for each field, the narrower requirement (e.g. if durationMin is 60 or
      //  * 90, choose 90).
      //  *
      //  * @template {keyof TestDataRequirements} TRequirementField
      //  * @param {TRequirementField} requirementField
      //  * @param {(
      //  *   thisTestDataRequirementValue: TestDataRequirements[TRequirementField],
      //  *   thatTestDataRequirementValue: TestDataRequirements[TRequirementField],
      //  * ) => boolean} chooseThisRequirementOverThatRequirement
      //  * @returns {TestDataRequirements[TRequirementField]}
      //  */
      // const chooseNarrowerRequirement = (requirementField, chooseThisRequirementOverThatRequirement) => {
      //   const thisTestDataRequirementValue = thisTestDataRequirements[requirementField] ?? null;
      //   const baseTestDataRequirementValue = baseTestDataRequirements[requirementField] ?? null;
      //   if (thisTestDataRequirementValue === null || baseTestDataRequirementValue === null) {
      //     return thisTestDataRequirementValue ?? baseTestDataRequirementValue;
      //   }
      //   return chooseThisRequirementOverThatRequirement(thisTestDataRequirementValue, baseTestDataRequirementValue)
      //     ? thisTestDataRequirementValue
      //     : baseTestDataRequirementValue;
      // };
      // return {
      //   ...baseTestDataRequirements,
      //   ...testDataRequirementsFactory,
      //   startDateMin: chooseNarrowerRequirement('startDateMin', (thisValue, thatValue) => moment(thisValue).isBefore(thatValue)),
      //   startDateMax: chooseNarrowerRequirement('startDateMax', (thisValue, thatValue) => moment(thisValue).isAfter(thatValue)),
      //   validFromMin: chooseNarrowerRequirement('validFromMin', (thisValue, thatValue) => moment(thisValue).isBefore(thatValue)),
      //   validFromMax: chooseNarrowerRequirement('validFromMax', (thisValue, thatValue) => moment(thisValue).isAfter(thatValue)),
      //   // durationMin: chooseNarrowerRequirement('durationMin',
      //   //   (thisValue, thatValue) => moment.duration(thisValue).asMilliseconds() > moment.duration(thatValue).asMilliseconds()),
      //   // durationMax: chooseNarrowerRequirement('durationMax',
      //   //   (thisValue, thatValue) => moment.duration(thisValue).asMilliseconds() < moment.duration(thatValue).asMilliseconds()),
      //   remainingCapacityMin: chooseNarrowerRequirement('remainingCapacityMin',
      //     (thisValue, thatValue) => thisValue > thatValue),
      //   remainingCapacityMax: chooseNarrowerRequirement('remainingCapacityMax',
      //     (thisValue, thatValue) => thisValue < thatValue),
      //   // TODO There are requirements that have no clear way of merging (e.g. eventStatusIsEventScheduled).
      //   // These should error if there is an overwrite
      //   //
      //   // [obsolete] TODO eventStatusOptions cannot be merged in this way. Either:
      //   // - MAKE IT MERGEABLE
      //   //   - make a more generic method for merging values so that eventStatusOptions can use an intersection
      //   // - MAKE IT UN-MERGEABLE
      //   //   - If a base criteria has a value for this and a child criteria has a value, raise an error.
      //   //   - I think it would also be clearer that it cannot be merged if it was a singular value ("eventStatusOption")
      //   //     rather than an array
      // };
    },
  };
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
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeAtLeastTwo(opportunity) {
  // A capacity of at least 2 is needed for cases other than IndividualFacilityUse because the multiple OrderItem tests use 2 of the same item (via the opportunityReuseKey).
  // The opportunityReuseKey is not used for IndividualFacilityUse, which is limited to a maximumUses of 1 by the specification.
  return getRemainingCapacity(opportunity) > (hasCapacityLimitOfOne(opportunity) ? 0 : 1);
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

module.exports = {
  createCriteria,
  getId,
  getType,
  getRemainingCapacity,
  hasCapacityLimitOfOne,
  remainingCapacityMustBeAtLeastTwo,
  getOrganizerOrProvider,
};
