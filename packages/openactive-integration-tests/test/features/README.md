
# Open Booking API Test Suite Feature Coverage

The test coverage below is [automatically generated](../../documentation), and indicates which features of the Open Booking API are currently covered by the test suite.

Stub tests are provided in many cases, and test coverage should not be regarded as exhaustive unless specified.

## Complete Test Coverage

The tests for these features cover all known edge cases, including both happy and unhappy paths.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
| core | Availability Checking ([availability-check](./core/availability-check/README.md)) | [Required](https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description-0) | Runs only C1 and C2, to confirm availability checks work as expected | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x7, [TestOpportunityBookableNoSpaces](https://openactive.io/test-interface#TestOpportunityBookableNoSpaces) x3 |
| core | Dataset Site ([dataset-site](./core/dataset-site/README.md)) | [Required](https://www.openactive.io/open-booking-api/EditorsDraft/#endpoints) | Discoverable open data |  |
| core | Test interface ([test-interface](./core/test-interface/README.md)) | [Optional](https://openactive.io/test-interface/) | Open Booking API Test Interface implementation | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


## Partial Test Coverage

The tests for these features provide partial coverage but do not include all known edgecases, and do not exercise all code paths and error conditions.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
| cancellation | Customer Requested Cancellation ([customer-requested-cancellation](./cancellation/customer-requested-cancellation/README.md)) | [Optional](https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation) | Cancellation triggered by the Customer through the Broker | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |
| payment | Simple Booking of paid opportunities ([simple-book-with-payment](./payment/simple-book-with-payment/README.md)) | [Optional](https://openactive.io/test-interface/) | Open Booking API Test Interface implementation | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x4, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


## No Test Coverage

The tests for these features are fully stubbed, and are not yet implemented.

| Category | Feature | Specification | Description | Prerequisites |
|----------|---------|---------------|-------------|-------------------|
| payment | Payment reconciliation detail validation ([payment-reconciliation-detail-validation](./payment/payment-reconciliation-detail-validation/README.md)) | [Optional](https://www.openactive.io/open-booking-api/EditorsDraft/#payment-reconciliation-detail-validation) | Booking with valid, invalid, and missing Payment details |  |


  