[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:48:50 GMT+0000 (Coordinated Universal Time)

# business-to-business-tax-calculation-net >> business-to-business-tax-calculation-net (OpenBookingApprovalFlow >> FacilityUseSlot)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** FacilityUseSlot

**Feature:** Tax / Business-to-business Tax Calculation (TaxNet) (Implemented) 

**Test:**  Tax calculations

The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.

### Running only this test

```bash
npm start -- --runInBand test/features/tax/business-to-business-tax-calculation-net/implemented/business-to-business-tax-calculation-net-test.js
```

---

⚠️ 12 passed with 0 failures, 92 warnings and 10 suggestions 

---


## Fetch Opportunities

### Local Microservice Test Interface for OrderItem 0 Request
POST http://localhost:3000/test-interface/datasets/uat-ci/opportunities

```json
{
  "@type": "Slot",
  "facilityUse": {
    "@type": "FacilityUse",
    "provider": {
      "@type": "Organization",
      "@id": "https://localhost:5001/api/identifiers/sellers/2"
    }
  },
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxNet",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/taxMode",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "oa:TaxMode",
        "allowlist": [
          "https://openactive.io/TaxNet"
        ]
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/remainingUses",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 2
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/isOpenBookingAllowed",
      "valueExpr": {
        "@type": "test:BooleanNodeConstraint",
        "value": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/startDate",
      "valueExpr": {
        "@type": "test:DateRangeNodeConstraint",
        "minDate": "2021-07-01T20:34:26.489+00:00"
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/eventStatus",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "schema:EventStatusType",
        "blocklist": [
          "https://schema.org/EventCancelled",
          "https://schema.org/EventPostponed"
        ]
      }
    }
  ],
  "test:testOfferDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/openBookingFlowRequirement",
      "valueExpr": {
        "@type": "test:ArrayConstraint",
        "datatype": "oa:OpenBookingFlowRequirement",
        "includesAll": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "excludesAll": [
          "https://openactive.io/OpenBookingAttendeeDetails",
          "https://openactive.io/OpenBookingIntakeForm"
        ]
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/price",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 0.01
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/validFromBeforeStartDate",
      "valueExpr": {
        "@type": "test:DateRangeNodeConstraint",
        "maxDate": "2021-07-01T18:34:26.489+00:00",
        "allowNull": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/openBookingInAdvance",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "oa:RequiredStatusType",
        "blocklist": [
          "https://openactive.io/Unavailable"
        ]
      }
    }
  ]
}
```

---
Response status code: 200 OK. Responded in 146.428611ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F1798%2Ffacility-use-slots%2F17977?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 137.392853ms.
```json
{
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977",
    "identifier": 17977,
    "duration": "PT1H57M",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/1798",
      "name": "Metal Swimming Pool Hall",
      "activity": [
        {
          "@type": "Concept",
          "@id": "https://openactive.io/activity-list#c07d63a0-8eb9-4602-8bcc-23be6deb8f83",
          "inScheme": "https://openactive.io/activity-list",
          "prefLabel": "Jet Skiing"
        }
      ],
      "location": {
        "@type": "Place",
        "name": "Fake Pond",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "GB",
          "addressLocality": "Another town",
          "addressRegion": "Oxfordshire",
          "postalCode": "OX1 1AA",
          "streetAddress": "1 Fake Park"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 0,
          "longitude": 0
        }
      },
      "provider": {
        "@type": "Organization",
        "@id": "https://localhost:5001/api/identifiers/sellers/2",
        "name": "Road Runner Bookcamp Ltd",
        "isOpenBookingAllowed": true,
        "taxMode": "https://openactive.io/TaxNet",
        "termsOfService": [
          {
            "@type": "PrivacyPolicy",
            "name": "Privacy Policy",
            "requiresExplicitConsent": false,
            "url": "https://example.com/privacy.html"
          }
        ]
      },
      "url": "https://www.example.com/a-session-age"
    },
    "maximumUses": 5,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "openBookingPrepayment": "https://openactive.io/Required",
        "price": 14.26,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P3DT15H2M"
      }
    ],
    "remainingUses": 5,
    "startDate": "2021-07-04T16:07:10+00:00",
    "endDate": "2021-07-04T18:04:10+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableNonFreeTaxNet' required for this test

### Validations
 * ⚠️ $.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.facilityUse.provider.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.facilityUse.provider.telephone: Recommended property `telephone` is missing from `Organization`.
 * ⚠️ $.facilityUse.provider.sameAs: Recommended property `sameAs` is missing from `Organization`.
 * ⚠️ $.offers[0].name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.offers[0].ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * 📝 $.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/3c732dd4-6acf-4008-94ff-24513e5eeb0e

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAyIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMiIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.lsKkGZJj_rJ8iLIRQzzoY9xSYzJ4KOmMbIDIhIS4dMpzjpYtwwVs4We0edzAxVYWOhtim02lEpWnzpZMjjHFZ2ddn5cj4NZLP2Fsnf_-xvXB9h0uLGocenrneRmfwjtSCf9IAYTcUqyi0hsHYRYXUhTTogJderw0z0HNjxG3c1OQHnXNB9L3jhhb90XHre7SykQAO9QxBf6l81uBB76efqyOHqwbd1VrFLgBalUAUnIsL88da6nb3kRy0qVMRFxNzM3n_MLLY1qiCdm4n6QchzXuKi_9stl0MY2NYjVfU6n_Zt1X8jWWgVy9EWiWEFtRUIy8O7rNDRD5cBXQLzpC3Q"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com",
    "description": "A fitness app for all the community",
    "logo": {
      "@type": "ImageObject",
      "url": "http://data.myfitnessapp.org.uk/images/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alan Peacock Way",
      "addressLocality": "Village East",
      "addressRegion": "Middlesbrough",
      "postalCode": "TS4 3AE",
      "addressCountry": "GB"
    }
  },
  "seller": "https://localhost:5001/api/identifiers/sellers/2",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977"
    }
  ],
  "payment": {
    "@type": "Payment",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 200 OK. Responded in 829.392494ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:54:22+00:00"
  },
  "orderRequiresApproval": true,
  "bookingService": {
    "@type": "BookingService",
    "name": "Acme booking system",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ],
    "url": "https://example.com"
  },
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com"
  },
  "brokerRole": "https://openactive.io/AgentBroker",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Required",
        "price": 14.26,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P3DT15H2M"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/1798",
          "name": "Metal Swimming Pool Hall",
          "activity": [
            {
              "@type": "Concept",
              "@id": "https://openactive.io/activity-list#6bdea630-ad22-4e58-98a3-bca26ee3f1da",
              "inScheme": "https://openactive.io/activity-list",
              "prefLabel": "Rave Fitness"
            }
          ],
          "location": {
            "@type": "Place",
            "name": "Fake fitness studio",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 0,
              "longitude": 0
            }
          },
          "url": "https://example.com/events/1798"
        },
        "maximumUses": 5,
        "remainingUses": 5,
        "startDate": "2021-07-04T16:07:10+00:00",
        "endDate": "2021-07-04T18:04:10+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.852,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
  "payment": {
    "@type": "Payment",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  },
  "seller": {
    "@type": "Organization",
    "@id": "https://localhost:5001/api/identifiers/sellers/2",
    "name": "Road Runner Bookcamp Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Road Runner Bookcamp Ltd",
    "taxMode": "https://openactive.io/TaxNet",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ]
  },
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "openBookingPrepayment": "https://openactive.io/Required",
    "price": 17.112,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 2.852,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ should calculate net tax correctly

## C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/3c732dd4-6acf-4008-94ff-24513e5eeb0e

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAyIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMiIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.lsKkGZJj_rJ8iLIRQzzoY9xSYzJ4KOmMbIDIhIS4dMpzjpYtwwVs4We0edzAxVYWOhtim02lEpWnzpZMjjHFZ2ddn5cj4NZLP2Fsnf_-xvXB9h0uLGocenrneRmfwjtSCf9IAYTcUqyi0hsHYRYXUhTTogJderw0z0HNjxG3c1OQHnXNB9L3jhhb90XHre7SykQAO9QxBf6l81uBB76efqyOHqwbd1VrFLgBalUAUnIsL88da6nb3kRy0qVMRFxNzM3n_MLLY1qiCdm4n6QchzXuKi_9stl0MY2NYjVfU6n_Zt1X8jWWgVy9EWiWEFtRUIy8O7rNDRD5cBXQLzpC3Q"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com",
    "description": "A fitness app for all the community",
    "logo": {
      "@type": "ImageObject",
      "url": "http://data.myfitnessapp.org.uk/images/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alan Peacock Way",
      "addressLocality": "Village East",
      "addressRegion": "Middlesbrough",
      "postalCode": "TS4 3AE",
      "addressCountry": "GB"
    }
  },
  "seller": "https://localhost:5001/api/identifiers/sellers/2",
  "customer": {
    "@type": "Organization",
    "name": "SomeCorporateClient",
    "email": "mybooking@corporate-client.com",
    "identifier": "7f72295b-b96f-4f28-a183-9718ca5f288c",
    "url": "https://corporate.client.com",
    "description": "A corporate client using fitness services",
    "logo": {
      "@type": "ImageObject",
      "url": "http://corporate.client.com/images/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "A Street",
      "addressLocality": "A Town",
      "addressRegion": "Middlesbrough",
      "postalCode": "TS4 3AE",
      "addressCountry": "GB"
    }
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977"
    }
  ],
  "payment": {
    "@type": "Payment",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 200 OK. Responded in 1624.599442ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:54:24+00:00"
  },
  "orderRequiresApproval": true,
  "bookingService": {
    "@type": "BookingService",
    "name": "Acme booking system",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ],
    "url": "https://example.com"
  },
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com"
  },
  "brokerRole": "https://openactive.io/AgentBroker",
  "customer": {
    "@type": "Organization",
    "name": "SomeCorporateClient",
    "email": "mybooking@corporate-client.com"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Required",
        "price": 14.26,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P3DT15H2M"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/1798",
          "name": "Metal Swimming Pool Hall",
          "activity": [
            {
              "@type": "Concept",
              "@id": "https://openactive.io/activity-list#6bdea630-ad22-4e58-98a3-bca26ee3f1da",
              "inScheme": "https://openactive.io/activity-list",
              "prefLabel": "Rave Fitness"
            }
          ],
          "location": {
            "@type": "Place",
            "name": "Fake fitness studio",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 0,
              "longitude": 0
            }
          },
          "url": "https://example.com/events/1798"
        },
        "maximumUses": 5,
        "remainingUses": 5,
        "startDate": "2021-07-04T16:07:10+00:00",
        "endDate": "2021-07-04T18:04:10+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.852,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
  "payment": {
    "@type": "Payment",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  },
  "seller": {
    "@type": "Organization",
    "@id": "https://localhost:5001/api/identifiers/sellers/2",
    "name": "Road Runner Bookcamp Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Road Runner Bookcamp Ltd",
    "taxMode": "https://openactive.io/TaxNet",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ]
  },
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "openBookingPrepayment": "https://openactive.io/Required",
    "price": 17.112,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 2.852,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ should calculate net tax correctly

## C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## P

### P Request
PUT https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAyIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMiIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.lsKkGZJj_rJ8iLIRQzzoY9xSYzJ4KOmMbIDIhIS4dMpzjpYtwwVs4We0edzAxVYWOhtim02lEpWnzpZMjjHFZ2ddn5cj4NZLP2Fsnf_-xvXB9h0uLGocenrneRmfwjtSCf9IAYTcUqyi0hsHYRYXUhTTogJderw0z0HNjxG3c1OQHnXNB9L3jhhb90XHre7SykQAO9QxBf6l81uBB76efqyOHqwbd1VrFLgBalUAUnIsL88da6nb3kRy0qVMRFxNzM3n_MLLY1qiCdm4n6QchzXuKi_9stl0MY2NYjVfU6n_Zt1X8jWWgVy9EWiWEFtRUIy8O7rNDRD5cBXQLzpC3Q"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderProposal",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com",
    "description": "A fitness app for all the community",
    "logo": {
      "@type": "ImageObject",
      "url": "http://data.myfitnessapp.org.uk/images/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alan Peacock Way",
      "addressLocality": "Village East",
      "addressRegion": "Middlesbrough",
      "postalCode": "TS4 3AE",
      "addressCountry": "GB"
    }
  },
  "seller": "https://localhost:5001/api/identifiers/sellers/2",
  "customer": {
    "@type": "Organization",
    "name": "SomeCorporateClient",
    "email": "mybooking@corporate-client.com",
    "identifier": "7f72295b-b96f-4f28-a183-9718ca5f288c",
    "url": "https://corporate.client.com",
    "description": "A corporate client using fitness services",
    "logo": {
      "@type": "ImageObject",
      "url": "http://corporate.client.com/images/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "A Street",
      "addressLocality": "A Town",
      "addressRegion": "Middlesbrough",
      "postalCode": "TS4 3AE",
      "addressCountry": "GB"
    }
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977"
    }
  ],
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 17.112,
    "priceCurrency": "GBP"
  },
  "payment": {
    "@type": "Payment",
    "identifier": "F9c2kOFVT",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 2139.283938ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderProposal",
  "@id": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "orderProposalStatus": "https://openactive.io/AwaitingSellerConfirmation",
  "bookingService": {
    "@type": "BookingService",
    "name": "Acme booking system",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ],
    "url": "https://example.com"
  },
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com"
  },
  "brokerRole": "https://openactive.io/AgentBroker",
  "customer": {
    "@type": "Organization",
    "name": "SomeCorporateClient",
    "email": "mybooking@corporate-client.com"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/3c732dd4-6acf-4008-94ff-24513e5eeb0e#/orderedItems/2333",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Required",
        "price": 14.26,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P3DT15H2M"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/1798",
          "name": "Metal Swimming Pool Hall",
          "activity": [
            {
              "@type": "Concept",
              "@id": "https://openactive.io/activity-list#6bdea630-ad22-4e58-98a3-bca26ee3f1da",
              "inScheme": "https://openactive.io/activity-list",
              "prefLabel": "Rave Fitness"
            }
          ],
          "location": {
            "@type": "Place",
            "name": "Fake fitness studio",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 0,
              "longitude": 0
            }
          },
          "url": "https://example.com/events/1798"
        },
        "maximumUses": 5,
        "remainingUses": 5,
        "startDate": "2021-07-04T16:07:10+00:00",
        "endDate": "2021-07-04T18:04:10+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.852,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e/versions/7d97bac9-19bb-4d7d-a56f-28720868ffd3",
  "payment": {
    "@type": "Payment",
    "identifier": "F9c2kOFVT",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  },
  "seller": {
    "@type": "Organization",
    "@id": "https://localhost:5001/api/identifiers/sellers/2",
    "name": "Road Runner Bookcamp Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Road Runner Bookcamp Ltd",
    "taxMode": "https://openactive.io/TaxNet",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ]
  },
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "openBookingPrepayment": "https://openactive.io/Required",
    "price": 17.112,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 2.852,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 201 on success

## P >> validation of P
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Simulate Seller Approval (Test Interface Action)

### Orders (order-proposals) Feed listen for &#x27;3c732dd4-6acf-4008-94ff-24513e5eeb0e&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/3c732dd4-6acf-4008-94ff-24513e5eeb0e


---
Response status code: 200 OK. Responded in 217.688681ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NjgsImV4cCI6MTYyNTE2ODA2OCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.YdM1LcUwkkEOuukb56f4IJmRootsC8gjcoBXN142rdjOgqkdMKO22KOwFEXF_SxuNjOKf-Mv3HWuK2bXnism_hi4Jc6-NIEnbRD4Jr-bpDBoJDvlu2IgcWYCIRJmP4LuToGLNnAI0JLSvZ0wfT31URNRlWPwqlgM2JBHkiiehENupfrsKXoAKsX4HWcSOQMWlsEGm1h2mBb4BOSMfHqiO3ISe-8ZZoX-2Ihl3bNbq7E3hiaek9MVNIvQED-pFIkh0PIkSemBzQUZoNx4PffAC1VW8VYY4axDuWq74lOYO06AWzb96iCQnmBrUCd0TM00xJFhPq056naRMSswRGkYDA"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607621593506091&afterId=b7bfa23b-98a3-4e9b-b4bb-43f1f3e7f1da",
  "message": "Listening for UUID: '3c732dd4-6acf-4008-94ff-24513e5eeb0e' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
}
```

### Call TestInterface Action of type: test:SellerAcceptOrderProposalSimulateAction Request
POST https://localhost:5001/api/openbooking/test-interface/actions

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAyIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMiIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.lsKkGZJj_rJ8iLIRQzzoY9xSYzJ4KOmMbIDIhIS4dMpzjpYtwwVs4We0edzAxVYWOhtim02lEpWnzpZMjjHFZ2ddn5cj4NZLP2Fsnf_-xvXB9h0uLGocenrneRmfwjtSCf9IAYTcUqyi0hsHYRYXUhTTogJderw0z0HNjxG3c1OQHnXNB9L3jhhb90XHre7SykQAO9QxBf6l81uBB76efqyOHqwbd1VrFLgBalUAUnIsL88da6nb3kRy0qVMRFxNzM3n_MLLY1qiCdm4n6QchzXuKi_9stl0MY2NYjVfU6n_Zt1X8jWWgVy9EWiWEFtRUIy8O7rNDRD5cBXQLzpC3Q"`

```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "@type": "test:SellerAcceptOrderProposalSimulateAction",
  "object": {
    "@type": "OrderProposal",
    "@id": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e"
  }
}
```

---
Response status code: 204 No Content. Responded in 239.242629ms.
### Specs
* ✅ should return 204 on success

## OrderProposal Feed Update (after Simulate Seller Approval)

### Orders (order-proposals) Feed collect for &#x27;3c732dd4-6acf-4008-94ff-24513e5eeb0e&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/3c732dd4-6acf-4008-94ff-24513e5eeb0e


---
Response status code: 200 OK. Responded in 1895.207083ms.
```json
{
  "state": "updated",
  "kind": "Order",
  "id": "3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "modified": 637607621672515800,
  "data": {
    "@context": "https://openactive.io/",
    "@type": "OrderProposal",
    "@id": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e",
    "identifier": "3c732dd4-6acf-4008-94ff-24513e5eeb0e",
    "orderProposalStatus": "https://openactive.io/SellerAccepted",
    "orderedItem": [
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/3c732dd4-6acf-4008-94ff-24513e5eeb0e#/orderedItems/2333",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
          "price": 14.26,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977"
      }
    ],
    "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e/versions/7d97bac9-19bb-4d7d-a56f-28720868ffd3",
    "totalPaymentDue": {
      "@type": "PriceSpecification",
      "openBookingPrepayment": "https://openactive.io/Required",
      "price": 17.112,
      "priceCurrency": "GBP"
    }
  }
}
```
### Specs
* ✅ should return 200 on success

## OrderProposal Feed Update (after Simulate Seller Approval) >> validation of OrderFeed
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.

## B

### Orders (order-proposals) Feed listen for &#x27;3c732dd4-6acf-4008-94ff-24513e5eeb0e&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/3c732dd4-6acf-4008-94ff-24513e5eeb0e


---
Response status code: 200 OK. Responded in 223.640176ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NjgsImV4cCI6MTYyNTE2ODA2OCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.YdM1LcUwkkEOuukb56f4IJmRootsC8gjcoBXN142rdjOgqkdMKO22KOwFEXF_SxuNjOKf-Mv3HWuK2bXnism_hi4Jc6-NIEnbRD4Jr-bpDBoJDvlu2IgcWYCIRJmP4LuToGLNnAI0JLSvZ0wfT31URNRlWPwqlgM2JBHkiiehENupfrsKXoAKsX4HWcSOQMWlsEGm1h2mBb4BOSMfHqiO3ISe-8ZZoX-2Ihl3bNbq7E3hiaek9MVNIvQED-pFIkh0PIkSemBzQUZoNx4PffAC1VW8VYY4axDuWq74lOYO06AWzb96iCQnmBrUCd0TM00xJFhPq056naRMSswRGkYDA"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607621593506091&afterId=b7bfa23b-98a3-4e9b-b4bb-43f1f3e7f1da",
  "message": "Listening for UUID: '3c732dd4-6acf-4008-94ff-24513e5eeb0e' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
}
```

### B Request
PUT https://localhost:5001/api/openbooking/orders/3c732dd4-6acf-4008-94ff-24513e5eeb0e

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAyIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMiIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.lsKkGZJj_rJ8iLIRQzzoY9xSYzJ4KOmMbIDIhIS4dMpzjpYtwwVs4We0edzAxVYWOhtim02lEpWnzpZMjjHFZ2ddn5cj4NZLP2Fsnf_-xvXB9h0uLGocenrneRmfwjtSCf9IAYTcUqyi0hsHYRYXUhTTogJderw0z0HNjxG3c1OQHnXNB9L3jhhb90XHre7SykQAO9QxBf6l81uBB76efqyOHqwbd1VrFLgBalUAUnIsL88da6nb3kRy0qVMRFxNzM3n_MLLY1qiCdm4n6QchzXuKi_9stl0MY2NYjVfU6n_Zt1X8jWWgVy9EWiWEFtRUIy8O7rNDRD5cBXQLzpC3Q"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "Order",
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/3c732dd4-6acf-4008-94ff-24513e5eeb0e/versions/7d97bac9-19bb-4d7d-a56f-28720868ffd3",
  "payment": {
    "@type": "Payment",
    "identifier": "U-W-TBPK7",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 280.697003ms.
```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/ns-beta"
  ],
  "@type": "Order",
  "@id": "https://localhost:5001/api/openbooking/orders/3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "identifier": "3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "bookingService": {
    "@type": "BookingService",
    "name": "Acme booking system",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ],
    "url": "https://example.com"
  },
  "broker": {
    "@type": "Organization",
    "name": "MyFitnessApp",
    "url": "https://myfitnessapp.example.com/"
  },
  "brokerRole": "https://openactive.io/AgentBroker",
  "customer": {
    "@type": "Organization",
    "name": "SomeCorporateClient",
    "email": "mybooking@corporate-client.com"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/3c732dd4-6acf-4008-94ff-24513e5eeb0e#/orderedItems/2333",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Required",
        "price": 14.26,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P3DT15H2M"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "399242",
          "value": "defaultValue"
        }
      ],
      "accessPass": [
        {
          "@type": "ImageObject",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png"
        },
        {
          "@type": "Barcode",
          "text": "3629535593",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/1798/facility-use-slots/17977",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/1798",
          "name": "Metal Swimming Pool Hall",
          "activity": [
            {
              "@type": "Concept",
              "@id": "https://openactive.io/activity-list#6bdea630-ad22-4e58-98a3-bca26ee3f1da",
              "inScheme": "https://openactive.io/activity-list",
              "prefLabel": "Rave Fitness"
            }
          ],
          "location": {
            "@type": "Place",
            "name": "Fake fitness studio",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 0,
              "longitude": 0
            }
          },
          "url": "https://example.com/events/1798"
        },
        "maximumUses": 5,
        "remainingUses": 5,
        "startDate": "2021-07-04T16:07:10+00:00",
        "endDate": "2021-07-04T18:04:10+00:00"
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.852,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
  "payment": {
    "@type": "Payment",
    "identifier": "F9c2kOFVT",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  },
  "seller": {
    "@type": "Organization",
    "@id": "https://localhost:5001/api/identifiers/sellers/2",
    "name": "Road Runner Bookcamp Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Road Runner Bookcamp Ltd",
    "taxMode": "https://openactive.io/TaxNet",
    "termsOfService": [
      {
        "@type": "PrivacyPolicy",
        "name": "Privacy Policy",
        "requiresExplicitConsent": false,
        "url": "https://example.com/privacy.html"
      }
    ]
  },
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "openBookingPrepayment": "https://openactive.io/Required",
    "price": 17.112,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 2.852,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 201 on success

## B >> validation of B
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[0].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## OrderProposal Feed Deletion (after B)

### Orders (order-proposals) Feed collect for &#x27;3c732dd4-6acf-4008-94ff-24513e5eeb0e&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/3c732dd4-6acf-4008-94ff-24513e5eeb0e


---
Response status code: 200 OK. Responded in 1738.627297ms.
```json
{
  "state": "deleted",
  "kind": "Order",
  "id": "3c732dd4-6acf-4008-94ff-24513e5eeb0e",
  "modified": 637607621696916400
}
```
### Specs
* ✅ should return 200 on success
* ✅ should calculate net tax correctly

## OrderProposal Feed Deletion (after B) >> validation of OrderFeed
### Specs
* ✅ passes validation checks

### Validations


