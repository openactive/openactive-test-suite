const { mergeMapsWithMut, DefaultMap, TallyMap } = require('./map-utils');

/**
 * @typedef {import('../types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

/**
 * { [opportunityCriteria] => [numOpportunitiesRequired]}
 * @extends {TallyMap<string>}
 */
class CriteriaRequirementsDatum extends TallyMap { }

/**
 * { [sellerCriteria] => { [opportunityCriteria] => [numOpportunitiesRequired] } }
 * @extends {DefaultMap<SellerCriteria, CriteriaRequirementsDatum>}
 */
class SellerCriteriaRequirements extends DefaultMap {
  /**
   * @param {[SellerCriteria, CriteriaRequirementsDatum][]} [entries]
   */
  constructor(entries) {
    super(() => new CriteriaRequirementsDatum(), entries);
  }

  /**
   * Merges SellerCriteriaRequirements by combining tallies
   *
   * @param {SellerCriteriaRequirements} mapThatIsMergedIntoMut
   * @param {SellerCriteriaRequirements} mapThatIsMergedFrom
   */
  static mergerMut(mapThatIsMergedIntoMut, mapThatIsMergedFrom) {
    mapThatIsMergedFrom.forEach((criteriaRequirementsDatum, sellerCriteria) => {
      TallyMap.mergerMut(mapThatIsMergedIntoMut.get(sellerCriteria), criteriaRequirementsDatum);
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
  CriteriaRequirementsDatum,
  SellerCriteriaRequirements,
};
