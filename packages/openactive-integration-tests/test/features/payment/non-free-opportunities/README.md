[< Return to Overview](../../README.md)
# Opportunities with a non-zero price (non-free-opportunities)

The most simple form of booking with payment. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description

Coverage Status: **partial**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/non-free-opportunities/
```





## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "non-free-opportunities": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [no-paid-bookable-sessions](./not-implemented/no-paid-bookable-sessions-test.js) | No paid bookable session | Check that the feed does not include any bookable sessions with a non-zero price. |  |
