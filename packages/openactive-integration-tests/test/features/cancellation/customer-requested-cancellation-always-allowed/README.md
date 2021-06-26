[< Return to Overview](../../README.md)
# Customer Requested Cancellation is available for all opportunities (customer-requested-cancellation-always-allowed)

This feature should be enabled if Customer Requested Cancellation cannot be disabled by the Seller


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **complete**



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/customer-requested-cancellation-always-allowed/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-requested-cancellation-always-allowed": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [all-opportunities-allow-cancellation](./implemented/all-opportunities-allow-cancellation-test.js) | All opportunities in the feeds allow cancellation | Check that the feed does not include any bookable sessions that have cancellation restricted. |  |


