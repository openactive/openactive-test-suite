const { state } = require('../state');

/**
 * @param {string} bookingPartnerIdentifier
 */
function getOrdersFeedHeader(bookingPartnerIdentifier) {
  return async () => {
    await state.globalAuthKeyManager.refreshClientCredentialsAccessTokensIfNeeded();
    const accessToken = state.globalAuthKeyManager.config?.bookingPartnersConfig?.[bookingPartnerIdentifier]?.authentication?.orderFeedTokenSet?.access_token;
    const requestHeaders = state.globalAuthKeyManager.config?.bookingPartnersConfig?.[bookingPartnerIdentifier]?.authentication?.ordersFeedRequestHeaders;
    return {
      ...(!accessToken ? undefined : {
        Authorization: `Bearer ${accessToken}`,
      }),
      ...requestHeaders,
    };
  };
}

/**
 * @param {() => Promise<{ [headerName: string]: string }>} getHeadersFn
 * @returns {() => Promise<{ [headerName: string]: string }>}
 */
function withOrdersRpdeHeaders(getHeadersFn) {
  return async () => ({
    Accept: 'application/json, application/vnd.openactive.booking+json; version=1',
    'Cache-Control': 'max-age=0',
    ...await getHeadersFn() || {},
  });
}

module.exports = {
  getOrdersFeedHeader,
  withOrdersRpdeHeaders,
};
