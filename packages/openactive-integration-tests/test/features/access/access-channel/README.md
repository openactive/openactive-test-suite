[< Return to Overview](../../README.md)
# accessChannel - Seller provided remote access (access-channel)

For online opportunities, an accessChannel (or a customerNotice indicating that an accessChannel will be sent soon) is provided upon booking with B

Required if there are any online opportunities whose virtual location cannot be shared publicly (e.g. to avoid zoombombing) and must be shared privately to confirmed attendees

https://github.com/openactive/open-booking-api/issues/176

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOnlineBookable](https://openactive.io/test-interface#TestOpportunityOnlineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-channel/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-channel": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [includes-access-channel-or-customer-notice](./implemented/includes-access-channel-or-customer-notice-test.js) | Details about virtual location included in B response. | Online opportunities include, in the B response, either: (1). The virtual location or (2). a `customerNotice` informing that the virtual location will be shared before the booked opportunity starts. | [TestOpportunityOnlineBookable](https://openactive.io/test-interface#TestOpportunityOnlineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


