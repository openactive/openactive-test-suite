/**
 * This SellerConfig comes from the broker microservice's /config route, which augments
 * the contents from its config files with up-to-date access tokens.
 */
export interface SellerConfig {
  '@type': string;
  '@id': string;
  authentication: {
    loginCredentials: {
      username: string;
      password: string;
    };
    requestHeaders: {
      [header: string]: string;
    },
    bookingPartnerTokenSets: {
      [bookingPartner in 'primary' | 'secondary']: {
        access_token: string;
      };
    };
  };
  taxMode: 'https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet';
  paymentReconciliationDetails: {
    name: string;
    accountId: string;
    paymentProviderId: string;
  };
}
