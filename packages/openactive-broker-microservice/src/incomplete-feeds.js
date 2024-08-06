/**
 * A record of which feeds have started but not yet completed harvesting.
 */
class IncompleteFeeds {
  constructor() {
    /**
     * @type {Set<string>}
     */
    this._incompleteFeeds = new Set();
  }

  /**
   * @param {string} feedIdentifier
   */
  markFeedHarvestStarted(feedIdentifier) {
    this._incompleteFeeds.add(feedIdentifier);
  }

  /**
   * @param {string} feedIdentifier
   * @returns {boolean} `true` if a "started" feed was found and removed.
   *   If this returns `false`, it may mean that the feed has already
   *   been recorded as ended.
   */
  markFeedHarvestComplete(feedIdentifier) {
    return this._incompleteFeeds.delete(feedIdentifier);
  }

  /**
   * Record all feeds as having ended harvesting.
   */
  markFeedHarvestCompleteAll() {
    this._incompleteFeeds.clear();
  }

  anyFeedsStillHarvesting() {
    return this._incompleteFeeds.size > 0;
  }
}

module.exports = {
  IncompleteFeeds,
};
