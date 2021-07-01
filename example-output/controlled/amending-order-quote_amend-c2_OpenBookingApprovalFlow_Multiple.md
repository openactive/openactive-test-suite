[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:38:26 GMT+0000 (Coordinated Universal Time)

# amending-order-quote >> amend-c2 (OpenBookingApprovalFlow >> Multiple)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** Multiple

**Feature:** Core / Amending the OrderQuote before B (Implemented) 

**Test:**  Amend, at C2, an existing OrderQuote

Run C1,C2 with X opportunities, then - with the same Order UUID - run C2 with Y opportunities and different customer details, then runs B. The resulting Order should include confirmed bookings for only Y opportunities

### Running only this test

```bash
npm start -- --runInBand test/features/core/amending-order-quote/implemented/amend-c2-test.js
```

---

⚠️ 48 passed with 0 failures, 679 warnings and 180 suggestions 

---


## First Attempt - C1 -> C2 >> Fetch Opportunities

### Booking System Test Interface for OrderItem 0 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/remainingAttendeeCapacity",
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
Response status code: 200 OK. Responded in 126.204105ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030"
}
```

### Booking System Test Interface for OrderItem 2 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/remainingAttendeeCapacity",
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
Response status code: 200 OK. Responded in 78.80514ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029"
}
```

### Booking System Test Interface for OrderItem 3 Request
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
Response status code: 200 OK. Responded in 153.228655ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028"
}
```

### Booking System Test Interface for OrderItem 5 Request
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
Response status code: 200 OK. Responded in 145.869214ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2030%2Fevents%2F20030?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2035.811167ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
  "modified": 1625164776421,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
    "startDate": "2021-07-02T18:39:33+00:00",
    "endDate": "2021-07-02T19:39:33+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2030",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "latitude": 0.1,
          "longitude": 0.1
        }
      },
      "offers": [
        {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
          "allowCustomerCancellationFullRefund": true,
          "openBookingFlowRequirement": [
            "https://openactive.io/OpenBookingApproval"
          ],
          "price": 0,
          "priceCurrency": "GBP"
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
    "duration": "PT1H",
    "maximumAttendeeCapacity": 10,
    "remainingAttendeeCapacity": 10
  }
}
```

### Opportunity Feed extract for OrderItem 2 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2029%2Fevents%2F20029?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2034.336059ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029",
  "modified": 1625164776420,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029",
    "startDate": "2021-07-02T18:39:33+00:00",
    "endDate": "2021-07-02T19:39:33+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2029",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "latitude": 0.1,
          "longitude": 0.1
        }
      },
      "offers": [
        {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2029#/offers/0",
          "allowCustomerCancellationFullRefund": true,
          "openBookingFlowRequirement": [
            "https://openactive.io/OpenBookingApproval"
          ],
          "price": 0,
          "priceCurrency": "GBP"
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
    "duration": "PT1H",
    "maximumAttendeeCapacity": 10,
    "remainingAttendeeCapacity": 10
  }
}
```

### Opportunity Feed extract for OrderItem 3 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2028%2Ffacility-use-slots%2F20028?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1726.163339ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
  "modified": 1625164776113,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
    "identifier": 20028,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2028",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:39:33+00:00",
    "endDate": "2021-07-02T19:39:33+00:00"
  }
}
```

### Opportunity Feed extract for OrderItem 5 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2027%2Ffacility-use-slots%2F20027?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1724.219327ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027",
  "modified": 1625164776105,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027",
    "identifier": 20027,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2027",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 0,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:39:33+00:00",
    "endDate": "2021-07-02T19:39:33+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0
* ✅ should return 200 on success for request relevant to OrderItem 1
* ✅ should return 200 on success for request relevant to OrderItem 2
* ✅ should return 200 on success for request relevant to OrderItem 3
* ✅ should return 200 on success for request relevant to OrderItem 4
* ✅ should return 200 on success for request relevant to OrderItem 5

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

### Validations
 * ⚠️ $.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.leader: Recommended property `leader` is missing from `ScheduledSession`.
 * ⚠️ $.url: Recommended property `url` is missing from `ScheduledSession`.
 * ⚠️ $.isAccessibleForFree: Where a `ScheduledSession` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
 * ⚠️ $.superEvent.description: Recommended property `description` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.image: Recommended property `image` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.leader: Recommended property `leader` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.level: Recommended property `level` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.isAccessibleForFree: Where a `SessionSeries` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
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

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 1
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

### Validations
 * ⚠️ $.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.leader: Recommended property `leader` is missing from `ScheduledSession`.
 * ⚠️ $.url: Recommended property `url` is missing from `ScheduledSession`.
 * ⚠️ $.isAccessibleForFree: Where a `ScheduledSession` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
 * ⚠️ $.superEvent.description: Recommended property `description` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.image: Recommended property `image` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.leader: Recommended property `leader` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.level: Recommended property `level` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.isAccessibleForFree: Where a `SessionSeries` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
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

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 2
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

### Validations
 * ⚠️ $.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.leader: Recommended property `leader` is missing from `ScheduledSession`.
 * ⚠️ $.url: Recommended property `url` is missing from `ScheduledSession`.
 * ⚠️ $.isAccessibleForFree: Where a `ScheduledSession` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
 * ⚠️ $.superEvent.description: Recommended property `description` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.image: Recommended property `image` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.leader: Recommended property `leader` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.level: Recommended property `level` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.isAccessibleForFree: Where a `SessionSeries` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
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

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 3
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

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 4
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

## First Attempt - C1 -> C2 >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 5
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

## First Attempt - C1 -> C2 >> C1

### C1 Request
PUT https://localhost:5001/api/openbooking/order-quote-templates/2dd02f20-3988-43e3-98d4-978b2fef3f37

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2029#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027"
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
Response status code: 200 OK. Responded in 640.480388ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:44:36+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2030",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2030"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
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
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2030",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2030"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2029#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2029",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2029"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2028",
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
          "url": "https://example.com/events/2028"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2028",
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
          "url": "https://example.com/events/2028"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2027",
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
          "url": "https://example.com/events/2027"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 5,
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
    "price": 29.98,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 5.996,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## First Attempt - C1 -> C2 >> C1 >> validation of C1
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
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
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
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## First Attempt - C1 -> C2 >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/2dd02f20-3988-43e3-98d4-978b2fef3f37

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
    "email": "Lonie.Howell@gmail.com",
    "telephone": "748.212.0932",
    "givenName": "McDermott",
    "familyName": "Hester",
    "identifier": "8279a363-3750-4b13-9ea4-a842112646e1"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2029#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027"
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
Response status code: 200 OK. Responded in 212.367496ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:44:38+00:00"
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
    "identifier": "8279a363-3750-4b13-9ea4-a842112646e1",
    "email": "Lonie.Howell@gmail.com",
    "familyName": "Hester",
    "givenName": "McDermott",
    "telephone": "748.212.0932"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2030",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2030"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
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
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2030#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2030/events/20030",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2030",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2030"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2029#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2029/events/20029",
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2029",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2029"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2028",
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
          "url": "https://example.com/events/2028"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2028/facility-use-slots/20028",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2028",
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
          "url": "https://example.com/events/2028"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2027/facility-use-slots/20027",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2027",
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
          "url": "https://example.com/events/2027"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:33+00:00",
        "endDate": "2021-07-02T19:39:33+00:00"
      },
      "position": 5,
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
    "price": 29.98,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 5.996,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## First Attempt - C1 -> C2 >> C2 >> validation of C2
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
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
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
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Second Attempt - C2 -> B >> Fetch Opportunities

### Booking System Test Interface for OrderItem 0 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/remainingAttendeeCapacity",
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
Response status code: 200 OK. Responded in 198.661019ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
}
```

### Booking System Test Interface for OrderItem 2 Request
POST https://localhost:5001/api/openbooking/test-interface/datasets/uat-ci/opportunities

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
  "test:testOpenBookingFlow": "https://openactive.io/test-interface#OpenBookingApprovalFlow",
  "test:testOpportunityDataShapeExpression": [
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://schema.org/remainingAttendeeCapacity",
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
Response status code: 200 OK. Responded in 227.957884ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034"
}
```

### Booking System Test Interface for OrderItem 3 Request
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
Response status code: 200 OK. Responded in 180.664518ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
}
```

### Booking System Test Interface for OrderItem 5 Request
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
Response status code: 200 OK. Responded in 217.548126ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2033%2Fevents%2F20033?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1439.40701ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
  "modified": 1625164781958,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
    "startDate": "2021-07-02T18:39:39+00:00",
    "endDate": "2021-07-02T19:39:39+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2033",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "latitude": 0.1,
          "longitude": 0.1
        }
      },
      "offers": [
        {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
          "allowCustomerCancellationFullRefund": true,
          "openBookingFlowRequirement": [
            "https://openactive.io/OpenBookingApproval"
          ],
          "price": 14.99,
          "priceCurrency": "GBP"
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
    "duration": "PT1H",
    "maximumAttendeeCapacity": 10,
    "remainingAttendeeCapacity": 10
  }
}
```

### Opportunity Feed extract for OrderItem 2 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2034%2Fevents%2F20034?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1439.118509ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034",
  "modified": 1625164781959,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034",
    "startDate": "2021-07-02T18:39:39+00:00",
    "endDate": "2021-07-02T19:39:39+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2034",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "latitude": 0.1,
          "longitude": 0.1
        }
      },
      "offers": [
        {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
          "allowCustomerCancellationFullRefund": true,
          "openBookingFlowRequirement": [
            "https://openactive.io/OpenBookingApproval"
          ],
          "price": 0,
          "priceCurrency": "GBP"
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
    "duration": "PT1H",
    "maximumAttendeeCapacity": 10,
    "remainingAttendeeCapacity": 10
  }
}
```

### Opportunity Feed extract for OrderItem 3 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2031%2Ffacility-use-slots%2F20031?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2918.247342ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
  "modified": 1625164783439,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
    "identifier": 20031,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 0,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:39:39+00:00",
    "endDate": "2021-07-02T19:39:39+00:00"
  }
}
```

### Opportunity Feed extract for OrderItem 5 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2032%2Ffacility-use-slots%2F20032?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 2930.704012ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032",
  "modified": 1625164783452,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032",
    "identifier": 20032,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2032",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:39:39+00:00",
    "endDate": "2021-07-02T19:39:39+00:00"
  }
}
```
### Specs
* ✅ should return 200 on success for request relevant to OrderItem 0
* ✅ should return 200 on success for request relevant to OrderItem 1
* ✅ should return 200 on success for request relevant to OrderItem 2
* ✅ should return 200 on success for request relevant to OrderItem 3
* ✅ should return 200 on success for request relevant to OrderItem 4
* ✅ should return 200 on success for request relevant to OrderItem 5

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

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

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 1
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

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

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 2
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookable' required for this test

### Validations
 * ⚠️ $.eventStatus: Recommended property `eventStatus` is missing from `ScheduledSession`.
 * ⚠️ $.leader: Recommended property `leader` is missing from `ScheduledSession`.
 * ⚠️ $.url: Recommended property `url` is missing from `ScheduledSession`.
 * ⚠️ $.isAccessibleForFree: Where a `ScheduledSession` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
 * ⚠️ $.superEvent.description: Recommended property `description` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.image: Recommended property `image` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.ageRange: Recommended property `ageRange` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.genderRestriction: Recommended property `genderRestriction` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.leader: Recommended property `leader` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.level: Recommended property `level` is missing from `SessionSeries`.
 * ⚠️ $.superEvent.isAccessibleForFree: Where a `SessionSeries` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.
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

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 3
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

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 4
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

## Second Attempt - C2 -> B >> Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 5
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

## Second Attempt - C2 -> B >> C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/2dd02f20-3988-43e3-98d4-978b2fef3f37

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
    "email": "Tess.Barton57@hotmail.com",
    "telephone": "(341) 496-9424",
    "givenName": "Considine",
    "familyName": "Timmy",
    "identifier": "050b59f2-0651-4022-925f-c27f56c6a12c"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032"
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
Response status code: 200 OK. Responded in 295.190163ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:44:43+00:00"
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
    "identifier": "050b59f2-0651-4022-925f-c27f56c6a12c",
    "email": "Tess.Barton57@hotmail.com",
    "familyName": "Timmy",
    "givenName": "Considine",
    "telephone": "(341) 496-9424"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
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
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2034",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2034"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2032",
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
          "url": "https://example.com/events/2032"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 5,
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
    "price": 44.97,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 8.994,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 1 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 2 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 3 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 4 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 5 - ID should match the one specified in the open data feed
* ✅ should include expected email address

## Second Attempt - C2 -> B >> C2 >> validation of C2
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
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
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
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Second Attempt - C2 -> B >> P

### P Request
PUT https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37

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
    "email": "Tess.Barton57@hotmail.com",
    "telephone": "(341) 496-9424",
    "givenName": "Considine",
    "familyName": "Timmy",
    "identifier": "050b59f2-0651-4022-925f-c27f56c6a12c"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032"
    }
  ],
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 44.97,
    "priceCurrency": "GBP"
  },
  "payment": {
    "@type": "Payment",
    "identifier": "GHSXwe5f7",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 431.957434ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderProposal",
  "@id": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37",
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
    "@type": "Person",
    "identifier": "050b59f2-0651-4022-925f-c27f56c6a12c",
    "email": "Tess.Barton57@hotmail.com",
    "familyName": "Timmy",
    "givenName": "Considine",
    "telephone": "(341) 496-9424"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/190",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
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
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/191",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 1,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/192",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2034",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2034"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "position": 2,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/193",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 3,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/194",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 4,
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/195",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2032",
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
          "url": "https://example.com/events/2032"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "position": 5,
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
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37/versions/69ad585b-3afe-4f03-a29d-314f57d6f0b7",
  "payment": {
    "@type": "Payment",
    "identifier": "GHSXwe5f7",
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
    "price": 44.97,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 8.994,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 201 on success

## Second Attempt - C2 -> B >> P >> validation of P
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
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
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
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Second Attempt - C2 -> B >> Simulate Seller Approval (Test Interface Action)

### Orders (order-proposals) Feed listen for &#x27;2dd02f20-3988-43e3-98d4-978b2fef3f37&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/2dd02f20-3988-43e3-98d4-978b2fef3f37


---
Response status code: 200 OK. Responded in 569.113425ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0OTcsImV4cCI6MTYyNTE2ODA5NywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.WRbISCijn3MA0gqbYQ9xEhcDqdVFqhFOov5tVVAYKHkgrswge8pTfS8NcVARO7zoYWdlrjTpT2hvDsOyYg_B2gV8EIlKKkS8A1CZCZ5Lm1kmPw-FlCQ-ouNnrhelzxXs13O2AxoMi_Cdy9EIlO5FCWYcLYP30eFBzyTgRS7AOHaRKJLrFk49znGqZJlnfss7mgLlwlGWf-FKTgzrhoUICDNZPmFfiygNFNG-SsSk9S6FKJQByq9ERlWjA1qN_0XPrkdAlHUmeMEsNnD1ZKychnyvjKA7IlWfARHQJNBwS668C8wvLuOdGkDvz0G1BG72WKOcycVEGKxW_CWV3IVR1Q"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607615807004344&afterId=569e78ac-cff2-44f6-a4ac-49fcf432cc8c",
  "message": "Listening for UUID: '2dd02f20-3988-43e3-98d4-978b2fef3f37' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
}
```

### Call TestInterface Action of type: test:SellerAcceptOrderProposalSimulateAction Request
POST https://localhost:5001/api/openbooking/test-interface/actions

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "@type": "test:SellerAcceptOrderProposalSimulateAction",
  "object": {
    "@type": "OrderProposal",
    "@id": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37"
  }
}
```

---
Response status code: 204 No Content. Responded in 329.769769ms.
### Specs
* ✅ should return 204 on success

## Second Attempt - C2 -> B >> OrderProposal Feed Update (after Simulate Seller Approval)

### Orders (order-proposals) Feed collect for &#x27;2dd02f20-3988-43e3-98d4-978b2fef3f37&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/2dd02f20-3988-43e3-98d4-978b2fef3f37


---
Response status code: 200 OK. Responded in 2698.759496ms.
```json
{
  "state": "updated",
  "kind": "Order",
  "id": "2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "modified": 637607615865921800,
  "data": {
    "@context": "https://openactive.io/",
    "@type": "OrderProposal",
    "@id": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37",
    "identifier": "2dd02f20-3988-43e3-98d4-978b2fef3f37",
    "orderProposalStatus": "https://openactive.io/SellerAccepted",
    "orderedItem": [
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/193",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
          "price": 0,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/194",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
          "price": 0,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/195",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/191",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/190",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/192",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
          "price": 0,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034"
      }
    ],
    "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37/versions/69ad585b-3afe-4f03-a29d-314f57d6f0b7",
    "totalPaymentDue": {
      "@type": "PriceSpecification",
      "openBookingPrepayment": "https://openactive.io/Required",
      "price": 44.97,
      "priceCurrency": "GBP"
    }
  }
}
```
### Specs
* ✅ should return 200 on success

## Second Attempt - C2 -> B >> OrderProposal Feed Update (after Simulate Seller Approval) >> validation of OrderFeed
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[0].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[1].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[2].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.allowCustomerCancellationFullRefund: Recommended property `allowCustomerCancellationFullRefund` is missing from `Offer`.

## Second Attempt - C2 -> B >> B

### Orders (order-proposals) Feed listen for &#x27;2dd02f20-3988-43e3-98d4-978b2fef3f37&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/2dd02f20-3988-43e3-98d4-978b2fef3f37


---
Response status code: 200 OK. Responded in 255.367947ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0OTcsImV4cCI6MTYyNTE2ODA5NywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.WRbISCijn3MA0gqbYQ9xEhcDqdVFqhFOov5tVVAYKHkgrswge8pTfS8NcVARO7zoYWdlrjTpT2hvDsOyYg_B2gV8EIlKKkS8A1CZCZ5Lm1kmPw-FlCQ-ouNnrhelzxXs13O2AxoMi_Cdy9EIlO5FCWYcLYP30eFBzyTgRS7AOHaRKJLrFk49znGqZJlnfss7mgLlwlGWf-FKTgzrhoUICDNZPmFfiygNFNG-SsSk9S6FKJQByq9ERlWjA1qN_0XPrkdAlHUmeMEsNnD1ZKychnyvjKA7IlWfARHQJNBwS668C8wvLuOdGkDvz0G1BG72WKOcycVEGKxW_CWV3IVR1Q"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607615853850584&afterId=569e78ac-cff2-44f6-a4ac-49fcf432cc8c",
  "message": "Listening for UUID: '2dd02f20-3988-43e3-98d4-978b2fef3f37' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
}
```

### B Request
PUT https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "Order",
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/2dd02f20-3988-43e3-98d4-978b2fef3f37/versions/69ad585b-3afe-4f03-a29d-314f57d6f0b7",
  "payment": {
    "@type": "Payment",
    "identifier": "ZHIcIzuJ0",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 295.552175ms.
```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/ns-beta"
  ],
  "@type": "Order",
  "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "identifier": "2dd02f20-3988-43e3-98d4-978b2fef3f37",
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
    "@type": "Person",
    "identifier": "050b59f2-0651-4022-925f-c27f56c6a12c",
    "email": "Tess.Barton57@hotmail.com",
    "familyName": "Timmy",
    "givenName": "Considine",
    "telephone": "(341) 496-9424"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/190",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "732045",
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
          "text": "9415345223",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/191",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2033#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "732045",
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
          "text": "9415345223",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2033/events/20033",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2033",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2033"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 2.998,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/192",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2034#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "939335",
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
          "text": "9594746554",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2034/events/20034",
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2034",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Event",
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
          "url": "https://example.com/events/2034"
        },
        "maximumAttendeeCapacity": 10,
        "remainingAttendeeCapacity": 10
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/193",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "220175",
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
          "text": "9547008489",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/194",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "220175",
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
          "text": "9547008489",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2031/facility-use-slots/20031",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2031",
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
          "url": "https://example.com/events/2031"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
      "unitTaxSpecification": [
        {
          "@type": "TaxChargeSpecification",
          "name": "VAT at 20%",
          "price": 0,
          "priceCurrency": "GBP",
          "rate": 0.2
        }
      ]
    },
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/2dd02f20-3988-43e3-98d4-978b2fef3f37#/orderedItems/195",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "822313",
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
          "text": "1333964875",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2032/facility-use-slots/20032",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2032",
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
          "url": "https://example.com/events/2032"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:39:39+00:00",
        "endDate": "2021-07-02T19:39:39+00:00"
      },
      "orderItemStatus": "https://openactive.io/OrderItemConfirmed",
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
    "identifier": "GHSXwe5f7",
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
    "price": 44.97,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 8.994,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 201 on success

## Second Attempt - C2 -> B >> B >> validation of B
### Specs
* ✅ passes validation checks

### Validations
 * ⚠️ $.orderedItem[0].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
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
 * ⚠️ $.orderedItem[1].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
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
 * ⚠️ $.orderedItem[2].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
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
 * ⚠️ $.orderedItem[3].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
 * ⚠️ $.orderedItem[3].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[3].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[3].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[4].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
 * ⚠️ $.orderedItem[4].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[4].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[4].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
 * ⚠️ $.orderedItem[5].accessChannel: Recommended property `accessChannel` is missing from `OrderItem`.
 * ⚠️ $.orderedItem[5].acceptedOffer.name: Recommended property `name` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].acceptedOffer.ageRestriction: Recommended property `ageRestriction` is missing from `Offer`.
 * ⚠️ $.orderedItem[5].orderedItem.duration: Recommended property `duration` is missing from `Slot`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.description: Recommended property `description` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.image: Recommended property `image` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.hoursAvailable: Recommended property `hoursAvailable` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.offers: Recommended property `offers` is missing from `FacilityUse`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.id: Recommended property `@id` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.url: Recommended property `url` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.description: Recommended property `description` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.image: Recommended property `image` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.telephone: Recommended property `telephone` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.openingHoursSpecification: Recommended property `openingHoursSpecification` is missing from `Place`.
 * ⚠️ $.orderedItem[5].orderedItem.facilityUse.location.amenityFeature: Recommended property `amenityFeature` is missing from `Place`.
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
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[3].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[4].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.latitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.
 * 📝 $.orderedItem[5].orderedItem.facilityUse.location.geo.longitude: The value of this property should have at least 3 decimal places. Note that this notice will also appear when trailing zeros have been truncated.

## Second Attempt - C2 -> B >> OrderProposal Feed Deletion (after B)

### Orders (order-proposals) Feed collect for &#x27;2dd02f20-3988-43e3-98d4-978b2fef3f37&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/2dd02f20-3988-43e3-98d4-978b2fef3f37


---
Response status code: 200 OK. Responded in 512.219298ms.
```json
{
  "state": "deleted",
  "kind": "Order",
  "id": "2dd02f20-3988-43e3-98d4-978b2fef3f37",
  "modified": 637607615897421600
}
```
### Specs
* ✅ should return 200 on success
* ✅ Should have the same number of OrderItems as criteria
* ✅ OrderItem at position 0 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 1 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 2 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 3 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 4 - ID should match the one specified in the open data feed
* ✅ OrderItem at position 5 - ID should match the one specified in the open data feed
* ✅ should include expected email address

## Second Attempt - C2 -> B >> OrderProposal Feed Deletion (after B) >> validation of OrderFeed
### Specs
* ✅ passes validation checks

### Validations


