[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:48:42 GMT+0000 (Coordinated Universal Time)

# customer-requested-cancellation >> orderitem-id-invalid-error (OpenBookingApprovalFlow >> Multiple)

**Booking Flow:** OpenBookingApprovalFlow

**Opportunity Type:** Multiple

**Feature:** Cancellation / Customer Requested Cancellation (Implemented) 

**Test:**  Expect a OrderItemIdInvalidError for an Order that does not exist

Runs Order Cancellation for a non-existent invalid OrderItem, but real Order, expecting an OrderItemIdInvalidError error to be returned

### Running only this test

```bash
npm start -- --runInBand test/features/cancellation/customer-requested-cancellation/implemented/orderitem-id-invalid-error-test.js
```

---

⚠️ 20 passed with 0 failures, 477 warnings and 126 suggestions 

---


## Fetch Opportunities

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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookableCancellable",
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
      "predicate": "https://openactive.io/allowCustomerCancellationFullRefund",
      "valueExpr": {
        "@type": "test:BooleanNodeConstraint",
        "value": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/latestCancellationBeforeStartDate",
      "valueExpr": {
        "@type": "test:NullNodeConstraint"
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
Response status code: 200 OK. Responded in 312.097322ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
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
Response status code: 200 OK. Responded in 259.731283ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "ScheduledSession",
  "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350"
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
  "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookableCancellable",
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
      "predicate": "https://openactive.io/allowCustomerCancellationFullRefund",
      "valueExpr": {
        "@type": "test:BooleanNodeConstraint",
        "value": true
      }
    },
    {
      "@type": "test:TripleConstraint",
      "predicate": "https://openactive.io/latestCancellationBeforeStartDate",
      "valueExpr": {
        "@type": "test:NullNodeConstraint"
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
Response status code: 200 OK. Responded in 236.784634ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
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
Response status code: 200 OK. Responded in 300.869449ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "Slot",
  "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339"
}
```

### Opportunity Feed extract for OrderItem 0 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2351%2Fevents%2F20351?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1044.334167ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
  "modified": 1625165364641,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
    "startDate": "2021-07-02T18:49:22+00:00",
    "endDate": "2021-07-02T19:49:22+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2351",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
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
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Fscheduled-sessions%2F2350%2Fevents%2F20350?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1035.905011ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
  "modified": 1625165364633,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "ScheduledSession",
    "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
    "startDate": "2021-07-02T18:49:22+00:00",
    "endDate": "2021-07-02T19:49:22+00:00",
    "superEvent": {
      "@type": "SessionSeries",
      "@id": "https://localhost:5001/api/identifiers/session-series/2350",
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
          "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
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
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2338%2Ffacility-use-slots%2F20338?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1524.230775ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
  "modified": 1625165365122,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
    "identifier": 20338,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
      "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:49:22+00:00",
    "endDate": "2021-07-02T19:49:22+00:00"
  }
}
```

### Opportunity Feed extract for OrderItem 5 Request
GET http://localhost:3000/opportunity/https%3A%2F%2Flocalhost%3A5001%2Fapi%2Fidentifiers%2Ffacility-uses%2F2339%2Ffacility-use-slots%2F20339?useCacheIfAvailable=true


---
Response status code: 200 OK. Responded in 1535.311647ms.
```json
{
  "state": "updated",
  "id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
  "modified": 1625165365135,
  "data": {
    "@context": [
      "https://openactive.io/"
    ],
    "@type": "Slot",
    "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
    "identifier": 20339,
    "duration": "PT1H",
    "facilityUse": {
      "@type": "FacilityUse",
      "@id": "https://localhost:5001/api/identifiers/facility-uses/2339",
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "openBookingFlowRequirement": [
          "https://openactive.io/OpenBookingApproval"
        ],
        "price": 14.99,
        "priceCurrency": "GBP"
      }
    ],
    "remainingUses": 10,
    "startDate": "2021-07-02T18:49:22+00:00",
    "endDate": "2021-07-02T19:49:22+00:00"
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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 0
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableCancellable' required for this test

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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 1
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableCancellable' required for this test

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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 2
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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 3
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableCancellable' required for this test

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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 4
### Specs
* ✅ passes validation checks
* ✅ matches the criteria 'TestOpportunityBookableCancellable' required for this test

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

## Fetch Opportunities >> validation of Opportunity Feed extract for OrderItem 5
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
PUT https://localhost:5001/api/openbooking/order-quote-templates/789e4a14-494f-4314-92eb-c501699468fa

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
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339"
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
Response status code: 200 OK. Responded in 758.217113ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/789e4a14-494f-4314-92eb-c501699468fa",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:54:25+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2350",
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
          "url": "https://example.com/events/2350"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2339",
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
          "url": "https://example.com/events/2339"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
    "price": 74.95,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 14.99,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## C1 >> validation of C1
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

## C2

### C2 Request
PUT https://localhost:5001/api/openbooking/order-quotes/789e4a14-494f-4314-92eb-c501699468fa

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
    "email": "Thea73@hotmail.com",
    "telephone": "1-242-607-4720",
    "givenName": "Harvey",
    "familyName": "Demetrius",
    "identifier": "ec6a2ed1-883e-40b2-bae5-0129e7da1d66"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339"
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
Response status code: 200 OK. Responded in 673.463964ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderQuote",
  "@id": "https://localhost:5001/api/openbooking/order-quotes/789e4a14-494f-4314-92eb-c501699468fa",
  "lease": {
    "@type": "Lease",
    "leaseExpires": "2021-07-01T18:54:26+00:00"
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
    "identifier": "ec6a2ed1-883e-40b2-bae5-0129e7da1d66",
    "email": "Thea73@hotmail.com",
    "familyName": "Demetrius",
    "givenName": "Harvey",
    "telephone": "1-242-607-4720"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
        "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2350",
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
          "url": "https://example.com/events/2350"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2339",
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
          "url": "https://example.com/events/2339"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
    "price": 74.95,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 14.99,
      "priceCurrency": "GBP",
      "rate": 0.2
    }
  ]
}
```
### Specs
* ✅ should return 200 on success

## C2 >> validation of C2
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

## P

### P Request
PUT https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa

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
    "email": "Thea73@hotmail.com",
    "telephone": "1-242-607-4720",
    "givenName": "Harvey",
    "familyName": "Demetrius",
    "identifier": "ec6a2ed1-883e-40b2-bae5-0129e7da1d66"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "position": 0,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 1,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
    },
    {
      "@type": "OrderItem",
      "position": 2,
      "acceptedOffer": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350"
    },
    {
      "@type": "OrderItem",
      "position": 3,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 4,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
    },
    {
      "@type": "OrderItem",
      "position": 5,
      "acceptedOffer": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
      "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339"
    }
  ],
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 74.95,
    "priceCurrency": "GBP"
  },
  "payment": {
    "@type": "Payment",
    "identifier": "ApNaiKwnA",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 844.699406ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderProposal",
  "@id": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa",
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
    "identifier": "ec6a2ed1-883e-40b2-bae5-0129e7da1d66",
    "email": "Thea73@hotmail.com",
    "familyName": "Demetrius",
    "givenName": "Harvey",
    "telephone": "1-242-607-4720"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1681",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1682",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1683",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2350",
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
          "url": "https://example.com/events/2350"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1684",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1685",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1686",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2339",
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
          "url": "https://example.com/events/2339"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa/versions/4d62153d-0302-4ffb-90dd-76bc92df55ea",
  "payment": {
    "@type": "Payment",
    "identifier": "ApNaiKwnA",
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
    "price": 74.95,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 14.99,
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

## Simulate Seller Approval (Test Interface Action)

### Orders (order-proposals) Feed listen for &#x27;789e4a14-494f-4314-92eb-c501699468fa&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/789e4a14-494f-4314-92eb-c501699468fa


---
Response status code: 200 OK. Responded in 238.333909ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0OTcsImV4cCI6MTYyNTE2ODA5NywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.WRbISCijn3MA0gqbYQ9xEhcDqdVFqhFOov5tVVAYKHkgrswge8pTfS8NcVARO7zoYWdlrjTpT2hvDsOyYg_B2gV8EIlKKkS8A1CZCZ5Lm1kmPw-FlCQ-ouNnrhelzxXs13O2AxoMi_Cdy9EIlO5FCWYcLYP30eFBzyTgRS7AOHaRKJLrFk49znGqZJlnfss7mgLlwlGWf-FKTgzrhoUICDNZPmFfiygNFNG-SsSk9S6FKJQByq9ERlWjA1qN_0XPrkdAlHUmeMEsNnD1ZKychnyvjKA7IlWfARHQJNBwS668C8wvLuOdGkDvz0G1BG72WKOcycVEGKxW_CWV3IVR1Q"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607621661787228&afterId=05a353ae-2cc2-48ad-bfa1-07574dbcfdb1",
  "message": "Listening for UUID: '789e4a14-494f-4314-92eb-c501699468fa' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
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
    "@id": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa"
  }
}
```

---
Response status code: 204 No Content. Responded in 22.624334ms.
### Specs
* ✅ should return 204 on success

## OrderProposal Feed Update (after Simulate Seller Approval)

### Orders (order-proposals) Feed collect for &#x27;789e4a14-494f-4314-92eb-c501699468fa&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/789e4a14-494f-4314-92eb-c501699468fa


---
Response status code: 200 OK. Responded in 2192.279259ms.
```json
{
  "state": "updated",
  "kind": "Order",
  "id": "789e4a14-494f-4314-92eb-c501699468fa",
  "modified": 637607621699493000,
  "data": {
    "@context": "https://openactive.io/",
    "@type": "OrderProposal",
    "@id": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa",
    "identifier": "789e4a14-494f-4314-92eb-c501699468fa",
    "orderProposalStatus": "https://openactive.io/SellerAccepted",
    "orderedItem": [
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1684",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1685",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1686",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1683",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
          "price": 0,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1681",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
      },
      {
        "@type": "OrderItem",
        "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1682",
        "acceptedOffer": {
          "@type": "Offer",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
          "price": 14.99,
          "priceCurrency": "GBP"
        },
        "orderedItem": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351"
      }
    ],
    "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa/versions/4d62153d-0302-4ffb-90dd-76bc92df55ea",
    "totalPaymentDue": {
      "@type": "PriceSpecification",
      "openBookingPrepayment": "https://openactive.io/Required",
      "price": 74.95,
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

## B

### Orders (order-proposals) Feed listen for &#x27;789e4a14-494f-4314-92eb-c501699468fa&#x27; change (auth: primary) Request
POST http://localhost:3000/order-listeners/order-proposals/primary/789e4a14-494f-4314-92eb-c501699468fa


---
Response status code: 200 OK. Responded in 159.914645ms.
```json
{
  "headers": {
    "Accept": "application/json, application/vnd.openactive.booking+json; version=1",
    "Cache-Control": "max-age=0",
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0OTcsImV4cCI6MTYyNTE2ODA5NywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.WRbISCijn3MA0gqbYQ9xEhcDqdVFqhFOov5tVVAYKHkgrswge8pTfS8NcVARO7zoYWdlrjTpT2hvDsOyYg_B2gV8EIlKKkS8A1CZCZ5Lm1kmPw-FlCQ-ouNnrhelzxXs13O2AxoMi_Cdy9EIlO5FCWYcLYP30eFBzyTgRS7AOHaRKJLrFk49znGqZJlnfss7mgLlwlGWf-FKTgzrhoUICDNZPmFfiygNFNG-SsSk9S6FKJQByq9ERlWjA1qN_0XPrkdAlHUmeMEsNnD1ZKychnyvjKA7IlWfARHQJNBwS668C8wvLuOdGkDvz0G1BG72WKOcycVEGKxW_CWV3IVR1Q"
  },
  "startingFeedPage": "https://localhost:5001/api/openbooking/order-proposals-rpde?afterTimestamp=637607621675528411&afterId=4992e68a-f757-43a5-9cc7-277298e5446a",
  "message": "Listening for UUID: '789e4a14-494f-4314-92eb-c501699468fa' in feed: order-proposals, for Booking Partner: primary from startingFeedPage using headers"
}
```

### B Request
PUT https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "Order",
  "orderProposalVersion": "https://localhost:5001/api/openbooking/order-proposals/789e4a14-494f-4314-92eb-c501699468fa/versions/4d62153d-0302-4ffb-90dd-76bc92df55ea",
  "payment": {
    "@type": "Payment",
    "identifier": "om4wrua1O",
    "name": "AcmeBroker Points",
    "accountId": "SN1593",
    "paymentProviderId": "STRIPE"
  }
}
```

---
Response status code: 201 Created. Responded in 775.339783ms.
```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/ns-beta"
  ],
  "@type": "Order",
  "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa",
  "identifier": "789e4a14-494f-4314-92eb-c501699468fa",
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
    "identifier": "ec6a2ed1-883e-40b2-bae5-0129e7da1d66",
    "email": "Thea73@hotmail.com",
    "familyName": "Demetrius",
    "givenName": "Harvey",
    "telephone": "1-242-607-4720"
  },
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1681",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "681169",
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
          "text": "3446939679",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1682",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2351#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "681169",
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
          "text": "3446939679",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2351/events/20351",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2351",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Event",
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
          "url": "https://example.com/events/2351"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1683",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/session-series/2350#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 0,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "021670",
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
          "text": "2027679838",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "ScheduledSession",
        "@id": "https://localhost:5001/api/identifiers/scheduled-sessions/2350/events/20350",
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00",
        "superEvent": {
          "@type": "SessionSeries",
          "@id": "https://localhost:5001/api/identifiers/session-series/2350",
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
          "url": "https://example.com/events/2350"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1684",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "676712",
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
          "text": "1175110906",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1685",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "676712",
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
          "text": "1175110906",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2338/facility-use-slots/20338",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2338",
          "name": "[OPEN BOOKING API TEST INTERFACE] Bookable Paid Facility",
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
          "url": "https://example.com/events/2338"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1686",
      "acceptedOffer": {
        "@type": "Offer",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339#/offers/0",
        "allowCustomerCancellationFullRefund": true,
        "price": 14.99,
        "priceCurrency": "GBP"
      },
      "accessCode": [
        {
          "@type": "PropertyValue",
          "name": "Pin Code",
          "description": "098609",
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
          "text": "8819829193",
          "url": "https://via.placeholder.com/25x25/cccccc/9c9c9c.png",
          "beta:codeType": "code128"
        }
      ],
      "orderedItem": {
        "@type": "Slot",
        "@id": "https://localhost:5001/api/identifiers/facility-uses/2339/facility-use-slots/20339",
        "facilityUse": {
          "@type": "FacilityUse",
          "@id": "https://localhost:5001/api/identifiers/facility-uses/2339",
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
          "url": "https://example.com/events/2339"
        },
        "maximumUses": 10,
        "remainingUses": 10,
        "startDate": "2021-07-02T18:49:22+00:00",
        "endDate": "2021-07-02T19:49:22+00:00"
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
    "identifier": "ApNaiKwnA",
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
    "price": 74.95,
    "priceCurrency": "GBP"
  },
  "totalPaymentTax": [
    {
      "@type": "TaxChargeSpecification",
      "name": "VAT at 20%",
      "price": 14.99,
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

## OrderProposal Feed Deletion (after B)

### Orders (order-proposals) Feed collect for &#x27;789e4a14-494f-4314-92eb-c501699468fa&#x27; change (auth: primary) Request
GET http://localhost:3000/order-listeners/order-proposals/primary/789e4a14-494f-4314-92eb-c501699468fa


---
Response status code: 200 OK. Responded in 306.287312ms.
```json
{
  "state": "deleted",
  "kind": "Order",
  "id": "789e4a14-494f-4314-92eb-c501699468fa",
  "modified": 637607621725255600
}
```
### Specs
* ✅ should return 200 on success

## OrderProposal Feed Deletion (after B) >> validation of OrderFeed
### Specs
* ✅ passes validation checks

### Validations

## Attempt to Cancel OrderItem at Position 0 using invalid OrderItem @id

### U Request
PATCH https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`

```json
{
  "@context": "https://openactive.io/",
  "@type": "Order",
  "orderedItem": [
    {
      "@type": "OrderItem",
      "@id": "https://localhost:5001/api/openbooking/orders/789e4a14-494f-4314-92eb-c501699468fa#/orderedItems/1681-0-",
      "orderItemStatus": "https://openactive.io/CustomerCancelled"
    }
  ]
}
```

---
Response status code: 500 Internal Server Error. Responded in 31.319186ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "OrderItemIdInvalidError",
  "name": "The '@id' of at least one of the provided 'OrderItem's is invalid.",
  "statusCode": 500
}
```
### Specs
* ✅ should return a response containing `"@type": "OrderItemIdInvalidError"` with status code `500`


