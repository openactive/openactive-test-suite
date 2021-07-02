/**
 * Identifier for an Order Feed in feedContextMap. Each Booking Partner has a separate Orders Feed
 *
 * @param {import('../models/core').OrderFeedIdentifier} feedIdentifier
 * @param {string} bookingPartnerIdentifier
 */
function orderFeedContextIdentifier(feedIdentifier, bookingPartnerIdentifier) {
  return `${feedIdentifier} (auth:${bookingPartnerIdentifier})`;
}

module.exports = {
  orderFeedContextIdentifier,
};
