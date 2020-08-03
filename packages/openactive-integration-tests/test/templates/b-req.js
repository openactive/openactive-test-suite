/**
 * @typedef {{
 *   sellerId: string,
 *   orderItems: {
 *     position: number,
 *     acceptedOffer: {
 *       '@id': string,
 *     },
 *     orderedItem: {
 *       '@type': string,
 *       '@id': string,
 *     },
 *   }[],
 *   totalPaymentDue: number,
 * }} BReqTemplateData
 */

/**
 * Create a B request, excluding the payment related details
 *
 * @param {BReqTemplateData} data
 */
function createNonPaymentRelatedCoreBReq(data) {
  return {
    "@context": "https://openactive.io/",
    "@type": "Order",
    brokerRole: "https://openactive.io/AgentBroker",
    broker: {
      "@type": "Organization",
      name: "MyFitnessApp",
      url: "https://myfitnessapp.example.com",
      description: "A fitness app for all the community",
      logo: {
        "@type": "ImageObject",
        url: "http://data.myfitnessapp.org.uk/images/logo.png"
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Alan Peacock Way",
        addressLocality: "Village East",
        addressRegion: "Middlesbrough",
        postalCode: "TS4 3AE",
        addressCountry: "GB"
      }
    },
    seller: {
      "@type": "Organization",
      "@id": `${data.sellerId}`,
    },
    customer: {
      "@type": "Person",
      email: "geoffcapes@example.com",
      telephone: "020 811 8055",
      givenName: "Geoff",
      familyName: "Capes"
    },
    orderedItem: data.orderItems.map((orderItem) => {
      return {
        "@type": "OrderItem",
        position: orderItem.position,
        acceptedOffer: {
          "@type": "Offer",
          "@id": `${orderItem.acceptedOffer['@id']}`
        },
        orderedItem: {
          "@type": `${orderItem.orderedItem['@type']}`,
          "@id": `${orderItem.orderedItem['@id']}`
        }
      };
    }),
  };
}

/**
 * @param {BReqTemplateData} data
 */
function createStandardFreeBReq(data) {
  return {
    ...createNonPaymentRelatedCoreBReq(data),
    totalPaymentDue: {
      "@type": "PriceSpecification",
      price: 0,
      priceCurrency: "GBP"
    },
  };
}

/**
 * @param {BReqTemplateData} data
 */
function createStandardPaidBReq(data) {
  return {
    ...createNonPaymentRelatedCoreBReq(data),
    totalPaymentDue: {
      "@type": "PriceSpecification",
      price: data.totalPaymentDue,
      priceCurrency: "GBP"
    },
    payment: {
      "@type": "Payment",
      name: "AcmeBroker Points",
      identifier: "1234567890npduy2f",
      accountId: "STRIP"
    }
  };
}

/**
 * Flexibly creates a free or paid B request determined by if totalPaymentDue
 * is zero or not.
 *
 * @param {BReqTemplateData} data
 */
function createStandardFreeOrPaidBReq(data) {
  if (data.totalPaymentDue === 0) {
    return createStandardFreeBReq(data);
  }
  return createStandardPaidBReq(data);
}

/**
 * Template functions are put into this object so that the function can be
 * referred to by its key e.g. `standardFree`
 */
const bReqTemplates = {
  standardFree: createStandardFreeBReq,
  standardPaid: createStandardPaidBReq,
  standard: createStandardFreeOrPaidBReq,
};

/**
 * @typedef {keyof typeof bReqTemplates} BReqTemplateRef Reference to a particular B Request template
 */

module.exports = {
  bReqTemplates,
};
