[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:57:50 GMT+0000 (Coordinated Universal Time)

# order-deletion >> unknown-order

**Booking Flow:** 

**Opportunity Type:** 

**Feature:** Core / Order Deletion Endpoint (Implemented) 

**Test:**  Expect a UnknownOrderError for an Order that does not exist

Runs Order Deletion for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned

### Running only this test

```bash
npm start -- --runInBand test/features/core/order-deletion/implemented/unknown-order-test.js
```

---

✅ 1 passed with 0 failures, 0 warnings and 0 suggestions 

---


## Order Deletion

### delete-order Request
DELETE https://localhost:5001/api/openbooking/orders/9119670c-9dbb-4ff9-9f73-d1b8fb4fc867

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ1MDEsImV4cCI6MTYyNTE2ODEwMSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiNjY0NTYyNTctODc3Yi00ZDE3LTk3YmMtMGJmYWM3YTUyMWQ3Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDk4LCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.FLgNZHppwWeamh3JqIRYV2DMC8DBC_qrC154dOv29vWuZuE1yNNwplVX40kFU7wSo1utqbVunHhcLINt-vdqUFwx1zDQY3Jay7fy208NHv5-imopLYIoPz8gUFggsGrnLs4nlRVyMvb1oKH7Wky70mDNDhWJ4vX_0phSXHGeIKavu4Vq2F0GpOGUL8qn5Dje9Ts53RfeV2N9ScUH0CzWjBGcBN_LNQIIwCqLa6lNhvK2ABKK0vju3ChfgjS0vetx3wxqtMi0I_pN4IzKtTjyr1reeHfEDrWFhtUVd5FQIIqPir7EwtViI5l9rYXBQRm4Z0s-pATmYA4EC-BXbYFXKw"`


---
Response status code: 404 Not Found. Responded in 158.73329ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "UnknownOrderError",
  "name": "The Booking System has no 'Order' matching the one requested.",
  "statusCode": 404
}
```
### Specs
* ✅ should return a response containing `"@type": "UnknownOrderError"` with status code `404`


