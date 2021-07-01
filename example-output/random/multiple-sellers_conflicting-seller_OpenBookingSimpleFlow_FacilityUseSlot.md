[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:42:56 GMT+0000 (Coordinated Universal Time)

# multiple-sellers >> conflicting-seller (OpenBookingSimpleFlow >> FacilityUseSlot)

**Booking Flow:** OpenBookingSimpleFlow

**Opportunity Type:** FacilityUseSlot

**Feature:** Core / Multiple Sellers (Implemented) 

**Test:**  SellerMismatchError for inconsistent Sellers of OrderItems

Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases.

### Running only this test

```bash
npm start -- --runInBand test/features/core/multiple-sellers/implemented/conflicting-seller-test.js
```

---

⚠️ 7 passed with 0 failures, 35 warnings and 4 suggestions 

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
      "@id": "https://localhost:5001/api/identifiers/sellers/1"
    }
  },
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingSimpleFlow",
  "test:testOpportunityDataShapeExpression": [
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
        "excludesAll": [
          "https://openactive.io/OpenBookingAttendeeDetails",
          "https://openactive.io/OpenBookingIntakeForm",
          "https://openactive.io/OpenBookingApproval"
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
Response status code: 200 OK. Responded in 375.003852ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991"
}
```

### Local Microservice Test Interface for OrderItem 1 Request
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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingSimpleFlow",
  "test:testOpportunityDataShapeExpression": [
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
        "excludesAll": [
          "https://openactive.io/OpenBookingAttendeeDetails",
          "https://openactive.io/OpenBookingIntakeForm",
          "https://openactive.io/OpenBookingApproval"
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
Response status code: 200 OK. Responded in 383.81639ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F600%2Ffacility-use-slots%2F5991?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 284.756872ms.
```json
{
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991",
    "identifier": 5991,
    "duration": "PT5H53M",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/600",
      "name": "Plastic Swimming Pool Hall",
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
    "maximumUses": 5,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 3.57,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P11DT22H56M"
      }
    ],
    "remainingUses": 5,
    "startDate": "2021-07-03T08:59:10+00:00",
    "endDate": "2021-07-03T14:52:10+00:00"
  }
}
```

### Opportunity Feed extract for OrderItem 1 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F568%2Ffacility-use-slots%2F5678?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 285.125507ms.
```json
{
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678",
    "identifier": 5678,
    "duration": "PT5H5M",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/568",
      "name": "Wooden Running Hall",
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
    "maximumUses": 3,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "latestCancellationBeforeStartDate": "P1D",
        "price": 4.01,
        "priceCurrency": "GBP",
        "validFromBeforeStartDate": "P14DT17H44M"
      }
    ],
    "remainingUses": 3,
    "startDate": "2021-07-02T10:14:10+00:00",
    "endDate": "2021-07-02T15:19:10+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0
* ✅ should return 200 on success for request relevant to OrderItem 1

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 1
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

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
PUT https://localhost:5001/api/openbooking/order-quote-templates/4719abed-9e98-4b12-ad11-85624d4752e6

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678"
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
Response status code: 500 Internal Server Error. Responded in 131.307284ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "SellerMismatchError",
  "name": "At least one of the 'OrderItem's did not match the specified 'seller'.",
  "statusCode": 500,
  "description": "OrderItem at position 1 did not match the specified SellerId"
}
```
### Specs
* ✅ should return a response containing `"@type": "SellerMismatchError"` with status code `500`

## C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.instance: Recommended property `instance` is missing from `SellerMismatchError`.

## C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/4719abed-9e98-4b12-ad11-85624d4752e6

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
    "email": "Jacinto.Kiehn@yahoo.com",
    "telephone": "(927) 680-0416 x22170",
    "givenName": "Ritchie",
    "familyName": "Trenton",
    "identifier": "45b54afe-9c64-439e-bb23-f3eef447dea2"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678"
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
Response status code: 500 Internal Server Error. Responded in 80.04361ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "SellerMismatchError",
  "name": "At least one of the 'OrderItem's did not match the specified 'seller'.",
  "statusCode": 500,
  "description": "OrderItem at position 1 did not match the specified SellerId"
}
```
### Specs
* ✅ should return a response containing `"@type": "SellerMismatchError"` with status code `500`

## C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.instance: Recommended property `instance` is missing from `SellerMismatchError`.

## B

### B Request
PUT https://localhost:5001/api/openbooking/orders/4719abed-9e98-4b12-ad11-85624d4752e6

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "Order",
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
    "email": "Jacinto.Kiehn@yahoo.com",
    "telephone": "(927) 680-0416 x22170",
    "givenName": "Ritchie",
    "familyName": "Trenton",
    "identifier": "45b54afe-9c64-439e-bb23-f3eef447dea2"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/600/facility-use-slots/5991"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/568/facility-use-slots/5678"
    }
  ],
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 0,
    "priceCurrency": "GBP"
  }
}
```

---
Response status code: 500 Internal Server Error. Responded in 68.68673ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "SellerMismatchError",
  "name": "At least one of the 'OrderItem's did not match the specified 'seller'.",
  "statusCode": 500,
  "description": "OrderItem at position 1 did not match the specified SellerId"
}
```
### Specs
* ✅ should return a response containing `"@type": "SellerMismatchError"` with status code `500`

## B >> validation of B
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.instance: Recommended property `instance` is missing from `SellerMismatchError`.


