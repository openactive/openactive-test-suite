/**
 * @typedef {import('@openactive/harvesting-utils').FeedContext & {
 *   _progressbar?: import('cli-progress').SingleBar
 * }} BrokerFeedContext
 */

const { createFeedContext } = require('@openactive/harvesting-utils');

/**
 * @param {string} feedContextIdentifier
 * @param {string} contentUrl
 * @param {import('cli-progress').MultiBar} [multibar]
 * @returns {BrokerFeedContext}
 */
function createBrokerFeedContext(feedContextIdentifier, contentUrl, multibar) {
  /** @type {BrokerFeedContext} */
  const context = createFeedContext(contentUrl);
  if (multibar) {
    context._progressbar = multibar.create(0, 0, {
      feedIdentifier: feedContextIdentifier,
      pages: 0,
      responseTime: '-',
      status: 'Harvesting...',
      ...getMultibarProgressFromContext(context),
    });
  }
  return context;
}

/**
 * Identifier for an Order Feed in feedContextMap. Each Booking Partner has a separate Orders Feed
 *
 * @param {import('../models/core').OrderFeedIdentifier} feedIdentifier
 * @param {string} bookingPartnerIdentifier
 */
function orderFeedContextIdentifier(feedIdentifier, bookingPartnerIdentifier) {
  return `${feedIdentifier} (auth:${bookingPartnerIdentifier})`;
}

/**
 * @param {BrokerFeedContext} c
 */
function getMultibarProgressFromContext(c) {
  return {
    totalItemsQueuedForValidation: c.totalItemsQueuedForValidation,
    validatedItems: c.validatedItems,
    validatedPercentage: c.totalItemsQueuedForValidation === 0 ? 0 : Math.round((c.validatedItems / c.totalItemsQueuedForValidation) * 100),
    items: c.items,
  };
}

module.exports = {
  createBrokerFeedContext,
  orderFeedContextIdentifier,
  getMultibarProgressFromContext,
};
