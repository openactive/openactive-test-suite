/**
 * @param {import('../models/core').Opportunity} opportunity
 */
function detectOpportunityType(opportunity) {
  switch (opportunity['@type'] || opportunity.type) {
    case 'ScheduledSession':
      if (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type) === 'SessionSeries') {
        return 'ScheduledSession';
      }
      throw new Error('ScheduledSession must have superEvent of SessionSeries');

    case 'Slot':
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'IndividualFacilityUse') {
        return 'IndividualFacilityUseSlot';
      }
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'FacilityUse') {
        return 'FacilityUseSlot';
      }

      throw new Error('Slot must have facilityUse of FacilityUse or IndividualFacilityUse');

    case 'CourseInstance':
      return 'CourseInstance';
    case 'HeadlineEvent':
      return 'HeadlineEvent';
    case 'OnDemandEvent':
      return 'OnDemandEvent';
    case 'Event':
      switch (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type)) {
        case 'HeadlineEvent':
          return 'HeadlineEventSubEvent';
        case 'CourseInstance':
          return 'CourseInstanceSubEvent';
        case 'EventSeries':
        case null:
        case undefined:
          return 'Event';
        default:
          throw new Error('Event has unrecognised @type of superEvent');
      }
    default:
      throw new Error('Only bookable opportunities are permitted in the test interface');
  }
}

/**
 * @param {import('../models/core').Opportunity} opportunity
 */
function detectSellerId(opportunity) {
  const organizer = opportunity.organizer
    || opportunity.superEvent?.organizer
    || opportunity.superEvent?.superEvent?.organizer
    || opportunity?.facilityUse?.provider
    || opportunity?.facilityUse?.aggregateFacilityUse?.provider;

  if (typeof organizer === 'string') return organizer;

  return organizer?.['@id'] || organizer?.id;
}

module.exports = {
  detectOpportunityType,
  detectSellerId,
};
