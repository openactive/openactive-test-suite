/**
 * @typedef {import('../types/SellerConfig').SellerConfig} SellerConfig
 * @typedef {import('../types/OpportunityCriteria').SellerCriteria} SellerCriteria
 */

const { SELLER_CONFIG } = global;

/**
 * Get the seller config whose taxMode matches the specified one.
 *
 * @param {string} taxMode
 * @returns {SellerConfig}
 */
function getSellerConfigWithTaxMode(taxMode) {
  if (SELLER_CONFIG.primary.taxMode === taxMode) {
    return SELLER_CONFIG.primary;
  }

  if (SELLER_CONFIG.secondary.taxMode === taxMode) {
    return SELLER_CONFIG.secondary;
  }

  throw new Error(`No seller specified for tax mode: ${taxMode}`);
}

/**
 * @param {SellerCriteria | null | undefined} sellerCriteria
 * @param {typeof SELLER_CONFIG} sellerConfig Seller Config can be overridden here
 */
function getSellerConfigFromSellerCriteria(sellerCriteria, sellerConfig = SELLER_CONFIG) {
  if (sellerCriteria == null) {
    return sellerConfig.primary;
  }
  switch (sellerCriteria) {
    case 'primary':
    case 'secondary':
      return sellerConfig[sellerCriteria];
    case 'taxGross':
      return getSellerConfigWithTaxMode('https://openactive.io/TaxGross');
    case 'taxNet':
      return getSellerConfigWithTaxMode('https://openactive.io/TaxNet');
    default:
      throw new Error(`Unrecognized sellerCriteria: ${sellerCriteria}`);
  }
}

module.exports = {
  getSellerConfigWithTaxMode,
  getSellerConfigFromSellerCriteria,
};
