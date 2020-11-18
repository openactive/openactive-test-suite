// /**
//  * @typedef {{
//  *   requestHeaders: {[headerName: string]: string},
//  *   '@id': string,
//  *   '@type': string,
//  * }} SellerConfig
//  */
/**
 * @typedef {import('../types/SellerConfig').SellerConfig} SellerConfig
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

// /** @type {SellerConfig} */
// const primarySeller = SELLER_CONFIG.primary;

module.exports = {
  getSellerConfigWithTaxMode,
  // primarySeller,
};
