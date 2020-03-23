## Testing scope

The test suite can be configured to test "optional" features, by indicating whether they are either:
- `implemented` - the tests will run to confirm proper implementation of the feature
- `not-implemented` - the tests will run to confirm the feature is correctly advertised as "not implemented"
- `disable-tests` - disable all tests for this feature (only recommended during development)

Additionally, an array of bookable opportunity types can be configured, to indicate which types the implementation is expected to support:
- `sessions` (dual feeds of `SessionSeries` and `ScheduledSession`)
- `facilities` (dual feeds of `FacilityUse` and `Slots`)
- `events` (feeds of `Event`)
- `headline-events` (feeds of `HeadlineEvent` with embedded `Event`)
- `courses` (feeds of `CourseInstance`)

Types of test:
- `random`
- `controlled`

All tests are run for the following:
- 1, 2 and 3 order items of each configured type. Duplicating the defined template in the test.
- Order items that mix pairs of different configured types. Mixing pairs of the defined templates in the test.

Each test needs to be set up with the following test data:
- One test event for each opportunity type to be tested


## Integration tests

The following integration tests are available, and can be configured using the configuration JSON file.


| Category     | Integration Tests                        | Feature                                               | Specification Status | Description                                                                                 |
|--------------|------------------------------------------|-------------------------------------------------------|----------------------|---------------------------------------------------------------------------------------------|
| core         | opportunity-feed                         | RPDE Opportunity Feed                                 | Required             | Real-time opportunity data                                                                  |
| core         | dataset-site                             | Dataset Site                                          | Required             | Discoverable open data                                                                      |
| core         | availability-check                       | Availability Checking                                 | Required             | Runs only C1 and C2, to confirm availability checks work as expected                        |
| core         | simple-book-without-payment              | Simple Book without Payment                           | Required             | The most simple form of booking without payment. Does not check for leases.                 |
| payment      | simple-book-with-payment                 | Simple Book with Payment                              | Optional             | The most simple form of booking with payment. Does not check for leases.                    |
| payment      | payment-reconciliation-detail-validation | Payment reconciliation detail validation              | Optional             |                                                                                             |
| restriction  | booking-window                           | validFromBeforeStartDate booking window               | Optional             | Duration of window before an opportunity where it is bookable                               |
| cancellation | customer-requested-cancellation          | Customer Requested Cancellation                       | Optional             | Cancellation triggered by the Customer through the Broker                                   |
| cancellation | seller-requested-cancellation            | Seller Requested Cancellation                         | Optional             | Cancellation triggered by the Seller through the Booking System                             |
| cancellation | seller-requested-cancellation-message    | cancellationMessage for Seller Requested Cancellation | Optional             | A message associated with a Cancellation triggered by the Seller through the Booking System |
| cancellation | cancellation-window                      | latestCancellationBeforeStartDate cancellation window | Optional             | A defined window before the event occurs where it can be cancelled without fees             |
| cancellation | seller-requested-replacement             | Seller Requested Replacement                          | Optional             | Replacement triggered by the Seller through the Booking System                              |
