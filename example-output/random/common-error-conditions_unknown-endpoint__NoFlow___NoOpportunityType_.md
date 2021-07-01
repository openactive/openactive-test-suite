[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:44:25 GMT+0000 (Coordinated Universal Time)

# common-error-conditions >> unknown-endpoint

**Booking Flow:** 

**Opportunity Type:** 

**Feature:** Core / Common error conditions (Implemented) 

**Test:**  Expect an UnknownOrIncorrectEndpointError for requests to unknown endpoints

Send a request to an endpoint that does not exist, and expect an UnknownOrIncorrectEndpointError to be returned

### Running only this test

```bash
npm start -- --runInBand test/features/core/common-error-conditions/implemented/unknown-endpoint-test.js
```

---

✅ 2 passed with 0 failures, 0 warnings and 0 suggestions 

---


## Unknown Endpoint - JSON PUT

### UnknownEndpoint Request
PUT https://localhost:5001/api/openbooking/ordeeeeers/abc

* **Content-Type:** `"application/vnd.openactive.booking+json; version=1"`
* **Authorization:** `"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjQ0NzEsImV4cCI6MTYyNTE2ODA3MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic3ViIjoiMTAwIiwiYXV0aF90aW1lIjoxNjI1MTY0NDcwLCJpZHAiOiJsb2NhbCIsImh0dHBzOi8vb3BlbmFjdGl2ZS5pby9zZWxsZXJJZCI6Imh0dHBzOi8vbG9jYWxob3N0OjUwMDEvYXBpL2lkZW50aWZpZXJzL3NlbGxlcnMvMSIsInNjb3BlIjpbIm9wZW5pZCIsIm9wZW5hY3RpdmUtaWRlbnRpdHkiLCJvcGVuYWN0aXZlLW9wZW5ib29raW5nIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.mPvoqm7aAVdo-8aOS4SmSFEqCcAQKJj7cAFUt9wWyfuMsAXRV_ntJ05gyar1fc_WodEc3OoARdczKQaDcaZfRJzpkeyhewAIsYzfQXQiCkYQ6RkMb5tw0f3fHdO7Z6ns0Rxr6AHoWQuFCx-gFhEUx85E2LZeyO7nkhA_RVr-AKjIzwVzydDYxNeIBO2q8UsJ_ush8saz9i5rMT-mZUc8o_5lsDEIyMgHs48M9XQScCPRMldsgfU-4x-4sEWE1Nu2c7pSh03TmHHu1lukB27k84le9qSxh9ZkQbqwJbqHx1Pg5_yTp9St4vM4Nsz3b-0bTEEm5Pv_6H89mO1rcVKKmg"`

```json
{
  "hi": "there"
}
```

---
Response status code: 404 Not Found. Responded in 209.866382ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "UnknownOrIncorrectEndpointError",
  "name": "The Booking System has no endpoint matching the one requested.",
  "statusCode": 404
}
```
### Specs
* ✅ should return a response containing `"@type": "UnknownOrIncorrectEndpointError"` with status code `404`

## Unknown Endpoint - GET

### UnknownEndpoint Request
GET https://localhost:5001/api/openbooking/ordeeeeers/abc


---
Response status code: 404 Not Found. Responded in 115.685515ms.
```json
{
  "@context": "https://openactive.io/",
  "@type": "UnknownOrIncorrectEndpointError",
  "name": "The Booking System has no endpoint matching the one requested.",
  "statusCode": 404
}
```
### Specs
* ✅ should return a response containing `"@type": "UnknownOrIncorrectEndpointError"` with status code `404`


