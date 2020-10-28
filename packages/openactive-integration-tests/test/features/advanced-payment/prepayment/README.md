[< Return to Overview](../../README.md)
# prepayment not specified (prepayment)

Support for booking without payment (reservation only)


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFreePrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified) x4, [TestOpportunityBookablePaidPrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-free-integrity](./implemented/opportunity-free-integrity-test.js) | Free opportunities must not have a `prepayment` value of either Optional or Required | Assert that no opportunities that match criteria 'TestOpportunityBookableFreePrepaymentOptional' or 'TestOpportunityBookableFreePrepaymentRequired' are available in the opportunity feeds. |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-free](./not-implemented/opportunity-free-test.js) | Opportunity free | Opportunity free, prepayment unspecified | [TestOpportunityBookableFreePrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified) x2 |
| [opportunity-free-unnecessary-payment-error](./not-implemented/opportunity-free-unnecessary-payment-error-test.js) | Opportunity free (unnecessary payment error) | Opportunity free, prepayment unspecified, unnecessary payment (error) | [TestOpportunityBookableFreePrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified) x2 |
| [opportunity-paid-no-payment-error](./not-implemented/opportunity-paid-no-payment-error-test.js) | Opportunity paid (no payment error) | Opportunity paid, prepayment unspecified, no payment (error) | [TestOpportunityBookablePaidPrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified) x2 |
| [opportunity-paid](./not-implemented/opportunity-paid-test.js) | Opportunity paid | Opportunity paid, prepayment unspecified | [TestOpportunityBookablePaidPrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified) x2 |
| [prepayment-not-in-use](./not-implemented/prepayment-not-in-use-test.js) | The `prepayment` property must not be in use | Assert that no opportunities that match criteria 'TestOpportunityBookableFreePrepaymentOptional' or 'TestOpportunityBookablePaidPrepaymentOptional' or 'TestOpportunityBookableFreePrepaymentUnavailable' or 'TestOpportunityBookablePaidPrepaymentUnavailable' or 'TestOpportunityBookableFreePrepaymentRequired' or 'TestOpportunityBookablePaidPrepaymentRequired' are available in the opportunity feeds. |  |
