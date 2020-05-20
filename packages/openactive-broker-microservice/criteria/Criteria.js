module.exports = class Criteria {
	getId(opportunity) {
		return opportunity['@id'] || opportunity['id'];
	}

	getType(opportunity) {
		return opportunity['@type'] || opportunity['type'];
	}

	getOffers(opportunity) {
		return opportunity.offers || (opportunity.superEvent && opportunity.superEvent.offers) || []; // Note FacilityUse does not have bookable offers, as it does not allow inheritance
	}

	getBookableOffers(opportunity) {
		const offers = this.getOffers(opportunity);
		return offers ? offers.filter(x =>
			(!x.availableChannel || x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
			&& x.advanceBooking != "https://openactive.io/Unavailable"
			&& (!x.validFromBeforeStartDate || moment(startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore())
		) : [];
	}

	getRemainingCapacity(opportunity) {
		return opportunity.remainingAttendeeCapacity || opportunity.remainingUses;
	}

	testMatch(opportunity) {
		const matchesCriteria = true;
		const unmetCriteriaDetails = [];
		
		return { matchesCriteria, unmetCriteriaDetails };
	}

	get name() {
		return 'Criteria';
	}
}