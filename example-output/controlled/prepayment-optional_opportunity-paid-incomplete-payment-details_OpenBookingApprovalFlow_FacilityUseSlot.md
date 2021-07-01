[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:57:23 GMT+0000 (Coordinated Universal Time)

# prepayment-optional >> opportunity-paid-incomplete-payment-details (OpenBookingApprovalFlow >> FacilityUseSlot)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** FacilityUseSlot

**Feature:** Payment / prepayment optional (Implemented) 

**Test:**  IncompletePaymentDetailsError must be returned in the case that payment `identifier` is not supplied

An unsuccessful end to end booking, because `identifier` is missing in the `payment` property in B request.

### Running only this test

```bash
npm start -- --runInBand test/features/payment/prepayment-optional/implemented/opportunity-paid-incomplete-payment-details-test.js
```

---

⚠️ 7 passed with 0 failures, 53 warnings and 6 suggestions 

---


## Unnecessary payment property at B >> Fetch Opportunities

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional",
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
      "predicate": "https://schema.org/price",
      "valueExpr": {
        "@type": "NumericNodeConstraint",
        "mininclusive": 0.01
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/openBookingPrepayment",
      "valueExpr": {
        "@type": "test:OptionNodeConstraint",
        "datatype": "oa:RequiredStatusType",
        "allowlist": [
          "https://openactive.io/Optional"
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
Response status code: 200 OK. Responded in 344.52895ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2495%2Ffacility-use-slots%2F20495?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2171.094185ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495",
  "modified": 1625165862797,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495",
    "identifier": 20495,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2495",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility Prepayment Optional",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "openBookingPrepayment": "https://openactive.io/Optional",
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:57:39+00:00",
    "endDate": "2021-07-02T19:57:39+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0

## Unnecessary payment property at B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableNonFreePrepaymentOptional' required for this test

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

## Unnecessary payment property at B >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/2f66dc11-3493-4dad-888c-2f3139b92102

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495"
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
Response status code: 200 OK. Responded in 583.549402ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/2f66dc11-3493-4dad-888c-2f3139b92102",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T19:02:42+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Optional",
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2495",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility Prepayment Optional",
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
          "url": "https://example.com/events/2495"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:57:39+00:00",
        "endDate": "2021-07-02T19:57:39+00:00"
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
    "openBookingPrepayment": "https://openactive.io/Optional",
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
* ✅ should return `totalPaymentDue.openBookingPrepayment` '`https://openactive.io/Optional`'

## Unnecessary payment property at B >> C1 >> validation of C1
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

## Unnecessary payment property at B >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/2f66dc11-3493-4dad-888c-2f3139b92102

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
    "email": "Reilly_Herzog96@yahoo.com",
    "telephone": "1-386-893-5106 x387",
    "givenName": "Swift",
    "familyName": "Vinnie",
    "identifier": "32be4993-9d5d-4cf7-a3af-20d68b3fab51"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495"
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
Response status code: 200 OK. Responded in 196.711813ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/2f66dc11-3493-4dad-888c-2f3139b92102",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T19:02:42+00:00"
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
    "identifier": "32be4993-9d5d-4cf7-a3af-20d68b3fab51",
    "email": "Reilly_Herzog96@yahoo.com",
    "familyName": "Vinnie",
    "givenName": "Swift",
    "telephone": "1-386-893-5106 x387"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingPrepayment": "https://openactive.io/Optional",
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2495",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility Prepayment Optional",
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
          "url": "https://example.com/events/2495"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:57:39+00:00",
        "endDate": "2021-07-02T19:57:39+00:00"
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
    "openBookingPrepayment": "https://openactive.io/Optional",
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
* ✅ should return `totalPaymentDue.openBookingPrepayment` '`https://openactive.io/Optional`'

## Unnecessary payment property at B >> C2 >> validation of C2
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

## Unnecessary payment property at B >> P

### P Request
PUT https://localhost:5001/api/openbooking/order-proposals/2f66dc11-3493-4dad-888c-2f3139b92102

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "seller": "https://localhost:5001/api/identifiers/sellers/1",
  "customer": {
    "@type": "Person",
    "email": "Reilly_Herzog96@yahoo.com",
    "telephone": "1-386-893-5106 x387",
    "givenName": "Swift",
    "familyName": "Vinnie",
    "identifier": "32be4993-9d5d-4cf7-a3af-20d68b3fab51"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2495/facility-use-slots/20495"
    }
  ],
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 14.99,
    "priceCurrency": "GBP"
  },
  "payment": {
    "@type": "Payment",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 400 Bad Request. Responded in 38.741419ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "IncompletePaymentDetailsError",
  "name": "The 'payment' property of the 'Order' does not include 'identifier'.",
  "statusCode": 400,
  "description": "Payment must contain identifier for paid Order."
}
```
### Specs
* ✅ should return a response containing `"@type": "IncompletePaymentDetailsError"` with status code `400`

## Unnecessary payment property at B >> P >> validation of P
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.instance: Recommended property `instance` is missing from `IncompletePaymentDetailsError`.


