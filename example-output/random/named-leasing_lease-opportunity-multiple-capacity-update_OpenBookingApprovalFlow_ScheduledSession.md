[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:49:31 GMT+0000 (Coordinated Universal Time)

# named-leasing >> lease-opportunity-multiple-capacity-update (OpenBookingApprovalFlow >> ScheduledSession)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** ScheduledSession

**Feature:** Leasing / Named leasing, including leaseExpires (Implemented) 

**Test:**  Multiple named leased spaces are unavailable for purchase by other users

For an opportunity with 2 spaces: Check the opportunity has 2 spaces in the feed. Run C1 and C2 to book one item (creating an named lease) - during this run call C2 twice, and check that both times there are still 2 remaining spaces from this UUID's perspective. Check the opportunity has 1 space in the feed. Run C1 and C2 again for a new Order UUID for the same opportunity attempting to book 3 spaces, expecting OrderItems to be returned with 1 having no errors, 1 having an OpportunityCapacityIsReservedByLeaseError, and 1 having an OpportunityHasInsufficientCapacityError.

### Running only this test

```bash
npm start -- --runInBand test/features/leasing/named-leasing/implemented/lease-opportunity-multiple-capacity-update-test.js
```

---

⚠️ 34 passed with 0 failures, 548 warnings and 218 suggestions 

---


## Fetch Opportunities

### Local Microservice Test Interface for OrderItem 0 Request
POST http://localhost:3000/test-interface/datasets/uat-ci/opportunities

```json
{
  "@type": "ScheduledSession",
  "superEvent": {
    "@type": "SessionSeries",
    "organizer": {
      "@type": "Organization",
      "@id": "https://localhost:5001/api/identifiers/sellers/1"
    }
  },
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/remainingAttendeeCapacity",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 2,
        "maxinclusive": 5
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
Response status code: 200 OK. Responded in 250.467104ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F1526%2Fevents%2F15254?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 138.8977ms.
```json
{
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
    "startDate": "2021-07-04T16:40:09+00:00",
    "endDate": "2021-07-04T21:24:09+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/1526",
      "name": "Cotton Running",
      "activity": [
        {
          "@type": "Concept",
          "@id": "https://openactive.io/activity-list#c07d63a0-8eb9-4602-8bcc-23be6deb8f83",
          "inScheme": "https://openactive.io/activity-list",
          "prefLabel": "Jet Skiing"
        }
      ],
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
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
      "offers": [
        {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
          "allowCustomerCancellationFullRefund": true,
          "openBookingFlowRequirement": [
            "https://openactive.io/OpenBookingApproval"
          ],
          "price": 0.2,
          "priceCurrency": "GBP",
          "validFromBeforeStartDate": "P14DT14H7M"
        }
      ],
      "organizer": {
        "@type": "Organization",
        "@id": "https://localhost:5001/api/identifiers/sellers/1",
        "name": "Acme Fitness Ltd",
        "isOpenBookingAllowed": true,
        "taxMode": "https://openactive.io/TaxGross",
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
    "duration": "PT4H44M",
    "maximumAttendeeCapacity": 5,
    "remainingAttendeeCapacity": 5
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableFiveSpaces' required for this test

### Validations
 * ⚠️ $.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.leader: Recommended property `leader` is missing from `ScheduledSession`.
 * ⚠️ $.url: Recommended property `url` is missing from `ScheduledSession`.
 * ⚠️ $.superEvent.description: Recommended property `description` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.image: Recommended property `image` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.leader: Recommended property `leader` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.level: Recommended property `level` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.superEvent.offers[0].name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.superEvent.offers[0].ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.superEvent.organizer.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.superEvent.organizer.telephone: Recommended property `telephone` is missing from `Organization`.
 * ⚠️ $.superEvent.organizer.sameAs: Recommended property `sameAs` is missing from `Organization`.
 * 📝 $.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.superEvent.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.superEvent.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Lease 3 item(s) (success) >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/6d70586e-3b40-42b9-8e97-5eed22884dcf

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 200 OK. Responded in 640.342557ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/6d70586e-3b40-42b9-8e97-5eed22884dcf",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:20+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.6,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.12,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## Lease 3 item(s) (success) >> C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[2].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[2].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 3 item(s) (success) >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/6d70586e-3b40-42b9-8e97-5eed22884dcf

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Taryn77@gmail.com",
    "telephone": "1-675-749-2849 x1974",
    "givenName": "Bradtke",
    "familyName": "Mazie",
    "identifier": "d36c27af-c8a2-462d-8705-b4b73f26d5fe"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 200 OK. Responded in 478.697794ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/6d70586e-3b40-42b9-8e97-5eed22884dcf",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:21+00:00"
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
    "@type": "Person",
    "identifier": "d36c27af-c8a2-462d-8705-b4b73f26d5fe",
    "email": "Taryn77@gmail.com",
    "familyName": "Mazie",
    "givenName": "Bradtke",
    "telephone": "1-675-749-2849 x1974"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.6,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.12,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - should decrement remaining slots
* ✅ OrderItem at position 1 - should decrement remaining slots
* ✅ OrderItem at position 2 - should decrement remaining slots

## Lease 3 item(s) (success) >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[2].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[2].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 3 item(s) (success) >> Same C2 Again (test idempotency) >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/6d70586e-3b40-42b9-8e97-5eed22884dcf

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Taryn77@gmail.com",
    "telephone": "1-675-749-2849 x1974",
    "givenName": "Bradtke",
    "familyName": "Mazie",
    "identifier": "d36c27af-c8a2-462d-8705-b4b73f26d5fe"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 200 OK. Responded in 1062.594985ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/6d70586e-3b40-42b9-8e97-5eed22884dcf",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:23+00:00"
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
    "@type": "Person",
    "identifier": "d36c27af-c8a2-462d-8705-b4b73f26d5fe",
    "email": "Taryn77@gmail.com",
    "familyName": "Mazie",
    "givenName": "Bradtke",
    "telephone": "1-675-749-2849 x1974"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 5
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.6,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.12,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - should decrement remaining slots
* ✅ OrderItem at position 1 - should decrement remaining slots
* ✅ OrderItem at position 2 - should decrement remaining slots

## Lease 3 item(s) (success) >> Same C2 Again (test idempotency) >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[2].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[2].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 10 item(s) (fail) >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/4839d730-9333-4da1-b480-6dabae26e709

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 6,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 7,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 8,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 9,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 409 Conflict. Responded in 488.03868ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/4839d730-9333-4da1-b480-6dabae26e709",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:24+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 5,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 6,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 7,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 8,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 9,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 2,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.4,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```

## Lease 10 item(s) (fail) >> C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[2].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[2].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[3].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[3].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[4].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[4].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[5].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[5].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[6].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[6].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[6].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[6].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[6].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[7].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[7].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[7].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[7].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[7].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[8].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[8].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[8].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[8].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[8].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[9].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[9].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[9].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[9].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[9].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[2].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[2].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[3].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[3].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[3].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[3].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[3].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[3].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[4].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[4].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[4].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[4].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[4].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[4].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[5].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[5].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[5].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[5].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[5].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[5].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[6].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[6].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[6].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[6].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[6].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[6].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[7].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[7].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[7].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[7].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[7].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[7].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[8].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[8].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[8].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[8].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[8].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[8].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[9].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[9].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[9].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[9].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[9].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[9].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 10 item(s) (fail) >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/4839d730-9333-4da1-b480-6dabae26e709

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Alexandrine_Nicolas30@hotmail.com",
    "telephone": "1-310-416-9502",
    "givenName": "Lindgren",
    "familyName": "Jayce",
    "identifier": "b793f369-b96c-43b7-9763-24c1a370a635"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 6,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 7,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 8,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 9,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 409 Conflict. Responded in 1720.466802ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/4839d730-9333-4da1-b480-6dabae26e709",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:28+00:00"
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
    "@type": "Person",
    "identifier": "b793f369-b96c-43b7-9763-24c1a370a635",
    "email": "Alexandrine_Nicolas30@hotmail.com",
    "familyName": "Jayce",
    "givenName": "Lindgren",
    "telephone": "1-310-416-9502"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 5,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 6,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 7,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 8,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityHasInsufficientCapacityError",
          "name": "There are not enough available spaces in the Opportunity contained in the 'orderedItem' property of the 'OrderItem' to fulfil the number of repeated 'OrderItem's.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 9,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 2,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.4,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - should decrement remaining slots
* ✅ OrderItem at position 1 - should decrement remaining slots
* ✅ OrderItem at position 2 - should decrement remaining slots
* ✅ OrderItem at position 3 - should decrement remaining slots
* ✅ OrderItem at position 4 - should decrement remaining slots
* ✅ OrderItem at position 5 - should decrement remaining slots
* ✅ OrderItem at position 6 - should decrement remaining slots
* ✅ OrderItem at position 7 - should decrement remaining slots
* ✅ OrderItem at position 8 - should decrement remaining slots
* ✅ OrderItem at position 9 - should decrement remaining slots
* ✅ should return HTTP 409
* ✅ should include correct numbers of OpportunityCapacityIsReservedByLeaseError and OpportunityHasInsufficientCapacityError in the OrderItems

## Lease 10 item(s) (fail) >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[2].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[2].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[2].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[3].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[3].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[4].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[4].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[5].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[5].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[6].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[6].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[6].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[6].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[6].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[6].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[7].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[7].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[7].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[7].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[7].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[7].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[8].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[8].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[8].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[8].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[8].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[8].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[9].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[9].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[9].error[0].description: Recommended property `description` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[9].error[0].instance: Recommended property `instance` is missing from `OpportunityHasInsufficientCapacityError`.
 * ⚠️ $.orderedItem[9].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[9].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[2].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[2].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[2].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[2].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[3].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[3].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[3].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[3].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[3].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[3].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[4].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[4].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[4].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[4].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[4].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[4].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[5].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[5].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[5].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[5].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[5].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[5].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[6].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[6].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[6].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[6].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[6].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[6].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[7].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[7].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[7].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[7].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[7].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[7].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[8].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[8].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[8].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[8].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[8].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[8].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[9].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[9].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[9].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[9].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[9].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[9].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 2 item(s) (success) >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/dd81c43c-0b2a-426b-8b3b-c9aa3d5b0b8f

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 200 OK. Responded in 1090.045891ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/dd81c43c-0b2a-426b-8b3b-c9aa3d5b0b8f",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:29+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.4,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.08,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## Lease 2 item(s) (success) >> C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 2 item(s) (success) >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/dd81c43c-0b2a-426b-8b3b-c9aa3d5b0b8f

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Flo.Murray@hotmail.com",
    "telephone": "453-685-7956 x9230",
    "givenName": "Hane",
    "familyName": "Zackery",
    "identifier": "51337701-3cad-4f5a-b7d3-92db51b46e6d"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 200 OK. Responded in 377.286455ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/dd81c43c-0b2a-426b-8b3b-c9aa3d5b0b8f",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:30+00:00"
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
    "@type": "Person",
    "identifier": "51337701-3cad-4f5a-b7d3-92db51b46e6d",
    "email": "Flo.Murray@hotmail.com",
    "familyName": "Zackery",
    "givenName": "Hane",
    "telephone": "453-685-7956 x9230"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 2
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.4,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.08,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - should decrement remaining slots
* ✅ OrderItem at position 1 - should decrement remaining slots

## Lease 2 item(s) (success) >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[1].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[1].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[1].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[1].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[1].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 1 item(s) (fail) >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/03280d7c-b75f-4593-8a0d-0f75cc7e5ad9

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 409 Conflict. Responded in 1254.322093ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/03280d7c-b75f-4593-8a0d-0f75cc7e5ad9",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:32+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 0
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.2,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.04,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```

## Lease 1 item(s) (fail) >> C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[0].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.

## Lease 1 item(s) (fail) >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/03280d7c-b75f-4593-8a0d-0f75cc7e5ad9

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Litzy_Ullrich@hotmail.com",
    "telephone": "926.710.4519 x513",
    "givenName": "Dickens",
    "familyName": "Kamryn",
    "identifier": "62130035-e9e6-46eb-a2ac-a0a16e398320"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254"
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
Response status code: 409 Conflict. Responded in 103.211216ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/03280d7c-b75f-4593-8a0d-0f75cc7e5ad9",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:55:33+00:00"
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
    "@type": "Person",
    "identifier": "62130035-e9e6-46eb-a2ac-a0a16e398320",
    "email": "Litzy_Ullrich@hotmail.com",
    "familyName": "Kamryn",
    "givenName": "Dickens",
    "telephone": "926.710.4519 x513"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/1526#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0.2,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT14H7M"
      },
      "error": [
        {
          "@type": "OpportunityCapacityIsReservedByLeaseError",
          "name": "The available capacity required to book a specific Opportunity is reserved by a lease held by another Customer.",
          "statusCode": 409
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/1526/events/15254",
        "startDate": "2021-07-04T16:40:09+00:00",
        "endDate": "2021-07-04T21:24:09+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/1526",
          "name": "Cotton Running",
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
              "latitude": 51.6201,
              "longitude": 0.302396
            }
          },
          "url": "https://example.com/events/1526"
        },
        "maximumAttendeeCapacity": 5,
        "remainingAttendeeCapacity": 0
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0.04,
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
    "@id": "https://localhost:5001/api/identifiers/sellers/1",
    "name": "Acme Fitness Ltd",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressLocality": "Another town",
      "addressRegion": "Oxfordshire",
      "postalCode": "OX1 1AA",
      "streetAddress": "1 Hidden Gem"
    },
    "isOpenBookingAllowed": true,
    "legalName": "Acme Fitness Ltd",
    "taxMode": "https://openactive.io/TaxGross",
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
    "price": 0.2,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0.04,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - should decrement remaining slots
* ✅ should return HTTP 409

## Lease 1 item(s) (fail) >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].error[0].description: Recommended property `description` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[0].error[0].instance: Recommended property `instance` is missing from `OpportunityCapacityIsReservedByLeaseError`.
 * ⚠️ $.orderedItem[0].orderedItem.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.eventStatus: Recommended property `eventStatus` is missing from `SessionSeries`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[0].orderedItem.superEvent.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.seller.email: Recommended property `email` is missing from `Organization`.
 * ⚠️ $.seller.url: Recommended property `url` is missing from `Organization`.
 * ⚠️ $.seller.logo: Recommended property `logo` is missing from `Organization`.
 * ⚠️ $.seller.vatID: Recommended property `vatID` is missing from `Organization`.
 * 📝 $.orderedItem[0].orderedItem.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `ScheduledSession`.
 * 📝 $.orderedItem[0].orderedItem.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.
 * 📝 $.orderedItem[0].orderedItem.superEvent.genderRestriction: Data consumers will assume that there is no gender restriction when no valid `genderRestriction` is supplied on a `SessionSeries`.
 * 📝 $.orderedItem[0].orderedItem.superEvent.ageRange: Data consumers will assume that the `ageRange` is 18+ when not specified.
 * 📝 $.orderedItem[0].orderedItem.superEvent.eventStatus: Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.


