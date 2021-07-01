[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:41:05 GMT+0000 (Coordinated Universal Time)

# common-error-conditions >> incomplete-broker-details (OpenBookingApprovalFlow >> FacilityUseSlot)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** FacilityUseSlot

**Feature:** Core / Common error conditions (Implemented) 

**Test:**  Expect an IncompleteBrokerDetailsError when broker details are missing name

Run each of C1, C2 and B for a valid opportunity, with broker details incomplete (missing name), expecting an IncompleteBrokerDetailsError to be returned

### Running only this test

```bash
npm start -- --runInBand test/features/core/common-error-conditions/implemented/incomplete-broker-details-test.js
```

---

⚠️ 12 passed with 0 failures, 108 warnings and 12 suggestions 

---


## Incomplete Broker Details at C1 >> Fetch Opportunities

### Booking System Test Interface for OrderItem 0 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
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
        "minDate": "2021-07-01T20:34:54.209+00:00"
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
        "maxDate": "2021-07-01T18:34:54.209+00:00",
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
Response status code: 200 OK. Responded in 34.452044ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2089%2Ffacility-use-slots%2F20089?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2462.294732ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089",
  "modified": 1625164902035,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089",
    "identifier": 20089,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2089",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
          "latitude": 0.1,
          "longitude": 0.1
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
    "maximumUses": 10,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:41:38+00:00",
    "endDate": "2021-07-02T19:41:38+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Incomplete Broker Details at C1 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
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

## Incomplete Broker Details at C1 >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/be93ac2f-5522-4af4-9998-bcbd29dc8cc0

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
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
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2089/facility-use-slots/20089"
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
Response status code: 400 Bad Request. Responded in 53.410373ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "IncompleteBrokerDetailsError",
  "name": "The 'name' property is not supplied within the 'Organisation' object describing the Broker; or the 'broker' property supplied is not a valid 'Organisation' object.",
  "statusCode": 400
}
```
### Specs
* ✅ should return a response containing `"@type": "IncompleteBrokerDetailsError"` with status code `400`

## Incomplete Broker Details at C1 >> C1 >> validation of C1
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.description: Recommended property `description` is missing from `IncompleteBrokerDetailsError`.
 * ⚠️ $.instance: Recommended property `instance` is missing from `IncompleteBrokerDetailsError`.

## Incomplete Broker Details at C2 >> Fetch Opportunities

### Booking System Test Interface for OrderItem 0 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
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
        "minDate": "2021-07-01T20:34:54.209+00:00"
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
        "maxDate": "2021-07-01T18:34:54.209+00:00",
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
Response status code: 200 OK. Responded in 28.091633ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2094%2Ffacility-use-slots%2F20094?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1532.076109ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094",
  "modified": 1625164903803,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094",
    "identifier": 20094,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2094",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
          "latitude": 0.1,
          "longitude": 0.1
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
    "maximumUses": 10,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:41:41+00:00",
    "endDate": "2021-07-02T19:41:41+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Incomplete Broker Details at C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
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

## Incomplete Broker Details at C2 >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/e2154c1f-1e14-417d-8f68-7993e9015407

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094"
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
Response status code: 200 OK. Responded in 264.341773ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/e2154c1f-1e14-417d-8f68-7993e9015407",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:46:43+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2094",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
              "latitude": 0.1,
              "longitude": 0.1
            }
          },
          "url": "https://example.com/events/2094"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:41:41+00:00",
        "endDate": "2021-07-02T19:41:41+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
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
    "price": 14.99,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 2.998,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## Incomplete Broker Details at C2 >> C1 >> validation of C1
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

## Incomplete Broker Details at C2 >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/e2154c1f-1e14-417d-8f68-7993e9015407

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
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
    "email": "Elaina31@hotmail.com",
    "telephone": "1-863-619-5843 x004",
    "givenName": "Hane",
    "familyName": "Ahmed",
    "identifier": "82a8f5a8-7b67-4b09-9a42-7504bde22945"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2094/facility-use-slots/20094"
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
Response status code: 400 Bad Request. Responded in 26.123506ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "IncompleteBrokerDetailsError",
  "name": "The 'name' property is not supplied within the 'Organisation' object describing the Broker; or the 'broker' property supplied is not a valid 'Organisation' object.",
  "statusCode": 400
}
```
### Specs
* ✅ should return a response containing `"@type": "IncompleteBrokerDetailsError"` with status code `400`

## Incomplete Broker Details at C2 >> C2 >> validation of C2
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.description: Recommended property `description` is missing from `IncompleteBrokerDetailsError`.
 * ⚠️ $.instance: Recommended property `instance` is missing from `IncompleteBrokerDetailsError`.

## Incomplete Broker Details at B >> Fetch Opportunities

### Booking System Test Interface for OrderItem 0 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
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
        "minDate": "2021-07-01T20:34:54.209+00:00"
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
        "maxDate": "2021-07-01T18:34:54.209+00:00",
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
Response status code: 200 OK. Responded in 33.855938ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2095%2Ffacility-use-slots%2F20095?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2855.165504ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095",
  "modified": 1625164907398,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095",
    "identifier": 20095,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2095",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
          "latitude": 0.1,
          "longitude": 0.1
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
    "maximumUses": 10,
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 0,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:41:43+00:00",
    "endDate": "2021-07-02T19:41:43+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Incomplete Broker Details at B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
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

## Incomplete Broker Details at B >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/3d03b34e-de20-484a-a20b-828b76cf7a30

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095"
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
Response status code: 200 OK. Responded in 202.033297ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/3d03b34e-de20-484a-a20b-828b76cf7a30",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:46:46+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2095",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
              "latitude": 0.1,
              "longitude": 0.1
            }
          },
          "url": "https://example.com/events/2095"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:41:43+00:00",
        "endDate": "2021-07-02T19:41:43+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
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
    "openBookingPrepayment": "https://openactive.io/Unavailable",
    "price": 0,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## Incomplete Broker Details at B >> C1 >> validation of C1
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

## Incomplete Broker Details at B >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/3d03b34e-de20-484a-a20b-828b76cf7a30

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
    "email": "Juana23@hotmail.com",
    "telephone": "706-235-0615 x3170",
    "givenName": "Terry",
    "familyName": "Anastasia",
    "identifier": "e5f92dd8-7108-4815-a9f7-9ff65877a80a"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095"
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
Response status code: 200 OK. Responded in 66.244448ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/3d03b34e-de20-484a-a20b-828b76cf7a30",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:46:46+00:00"
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
    "identifier": "e5f92dd8-7108-4815-a9f7-9ff65877a80a",
    "email": "Juana23@hotmail.com",
    "familyName": "Anastasia",
    "givenName": "Terry",
    "telephone": "706-235-0615 x3170"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2095",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Facility",
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
              "latitude": 0.1,
              "longitude": 0.1
            }
          },
          "url": "https://example.com/events/2095"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:41:43+00:00",
        "endDate": "2021-07-02T19:41:43+00:00"
      },
      "position": 0,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    }
  ],
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
    "openBookingPrepayment": "https://openactive.io/Unavailable",
    "price": 0,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 0,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## Incomplete Broker Details at B >> C2 >> validation of C2
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

## Incomplete Broker Details at B >> P

### P Request
PUT https://localhost:5001/api/openbooking/order-proposals/3d03b34e-de20-484a-a20b-828b76cf7a30

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderProposal",
  "brokerRole": "https://openactive.io/AgentBroker",
  "broker": {
    "@type": "Organization",
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
    "email": "Juana23@hotmail.com",
    "telephone": "706-235-0615 x3170",
    "givenName": "Terry",
    "familyName": "Anastasia",
    "identifier": "e5f92dd8-7108-4815-a9f7-9ff65877a80a"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2095/facility-use-slots/20095"
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
Response status code: 400 Bad Request. Responded in 30.503283ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "IncompleteBrokerDetailsError",
  "name": "The 'name' property is not supplied within the 'Organisation' object describing the Broker; or the 'broker' property supplied is not a valid 'Organisation' object.",
  "statusCode": 400
}
```
### Specs
* ✅ should return a response containing `"@type": "IncompleteBrokerDetailsError"` with status code `400`

## Incomplete Broker Details at B >> P >> validation of P
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.description: Recommended property `description` is missing from `IncompleteBrokerDetailsError`.
 * ⚠️ $.instance: Recommended property `instance` is missing from `IncompleteBrokerDetailsError`.


