const { mergeMapsWithMut, DefaultMap, TallyMap } = require('./map-utils');

/**
 * @typedef {import('../types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

/**
 * { [opportunityCriteria] => [numOpportunitiesRequired]}
 * @extends {TallyMap<string>}
 */
class OpportunityCriteriaRequirements extends TallyMap { }

/**
 * { [sellerCriteria] => { [opportunityCriteria] => [numOpportunitiesRequired] } }
 * @extends {DefaultMap<SellerCriteria, OpportunityCriteriaRequirements>}
 */
class SellerCriteriaRequirements extends DefaultMap {
  /**
   * @param {[SellerCriteria, OpportunityCriteriaRequirements][]} [entries]
   */
  constructor(entries) {
    super(() => new OpportunityCriteriaRequirements(), entries);
  }

  /**
   * Merges SellerCriteriaRequirements by combining tallies
   *
   * @param {SellerCriteriaRequirements} mapThatIsMergedIntoMut
   * @param {SellerCriteriaRequirements} mapThatIsMergedFrom
   */
  static mergerMut(mapThatIsMergedIntoMut, mapThatIsMergedFrom) {
    mapThatIsMergedFrom.forEach((opportunityCriteriaRequirements, sellerCriteria) => {
      TallyMap.mergerMut(mapThatIsMergedIntoMut.get(sellerCriteria), opportunityCriteriaRequirements);
    });
  }

  /**
   * @param {SellerCriteriaRequirements[]} sellerCriteriaRequirementMaps
   * @returns {SellerCriteriaRequirements}
   */
  static combine(sellerCriteriaRequirementMaps) {
    return mergeMapsWithMut(SellerCriteriaRequirements.mergerMut, new SellerCriteriaRequirements(), sellerCriteriaRequirementMaps);
  }
}

module.exports = {
  OpportunityCriteriaRequirements,
  SellerCriteriaRequirements,
};
