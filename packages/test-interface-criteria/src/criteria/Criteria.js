/*
  Useful base class
*/

const moment = require('moment')

module.exports = class Criteria {
	getId(opportunity) {
		return opportunity['@id'] || opportunity['id'];
	}

	getType(opportunity) {
		return opportunity['@type'] || opportunity['type'];
	}

	getRemainingCapacity(opportunity) {
		return opportunity.remainingAttendeeCapacity !== undefined ? opportunity.remainingAttendeeCapacity : opportunity.remainingUses;
	}

	get opportunityConstraints() {
    return {};
  }

  get offerConstraints() {
    return {}
  }

	get name() {
		return 'Criteria';
	}
}