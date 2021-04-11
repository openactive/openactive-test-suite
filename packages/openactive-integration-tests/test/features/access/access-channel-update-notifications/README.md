[< Return to Overview](../../README.md)
# accessChannel update notifications (access-channel-update-notifications)

When accessChannel changes, make sure this change is supplied back to the Broker via the Orders feed

Required if an online opportunity's accessChannel can change

https://github.com/openactive/open-booking-api/issues/176

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOnlineBookable](https://openactive.io/test-interface#TestOpportunityOnlineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-channel-update-notifications/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-channel-update-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-channel-update-notifications](./implemented/access-channel-update-notifications-test.js) | Access channel updated after B request. | Access channel, when updated after B request, is reflected in Orders feed. | [TestOpportunityOnlineBookable](https://openactive.io/test-interface#TestOpportunityOnlineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


