/**
 * This SellerConfig comes from the broker microservice's config files (by way of
 * the broker's /config route).
 */
export interface BookingPartnerConfig {
  authentication: {
    initialAccessToken: string;
    ordersFeedRequestHeaders: {
      [header: string]: string;
    };
  } | {
    clientCredentials: {
      clientId: string;
      clientSecret: string;
    };
  };
}
