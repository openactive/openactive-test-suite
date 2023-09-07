# Contributing

## Architecture

The testing architecture is documented in [ARCHITECTURE.md](./architecture.md). This is fairly in depth so is only necessary if making changes to the core testing framework.

## Structure

The hierarchy for tests is:

* **Test**: A single test, that tests a given flow e.g. the happy path for a successful free booking.
* **Feature**: A collection of **Test**s that must all pass for a given feature to be considered successfully implemented. Features may be turned on or off in the [`integrationTests` configuration](./README.md#configuration-for-integrationtests-within-confignode_envjson).

    Example features:
    
    * `free-opportunities`: Booking of free Opportunities
    * `customer-requested-cancellation`: Customer-requested Cancellations
    * `proposal-amendment`: Ability to amend proposals in the Approval Flow

    A feature contains both **implemented** and **non-implemented** tests:

    * **Implemented** tests are tests that are expected to pass if the feature is turned on
    * **Non-implemented** tests are tests that are expected to pass if the feature is turned off.
    
        An example non-implemented test is `no-paid-bookable-sessions` within the `non-free-opportunities` feature. This test checks that the Booking System under test does contain any non-free bookable sessions, and therefore can validly skip testing for non-free opportunities.
* **Category**: A collection of **Features**. Categories are only used to group features together for documentation purposes.

    Example categories:
    
    * `payment`: Payment-related features
    * `cancellation`: Cancellation-related features

Tests exist in a path that includes identifiers for the Category, Feature, and Test, whether it is implemented or non-implemented, and a postfix of `-test.js`, as follows:

`test/features/<testCategory>/<testFeature>/<implemented|non-implemented>/<testIdentifier>-test.js`

### Example

The following test:

```javascript
FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: true,
  testIdentifier: 'with-payment-property',
```

Will exist in the path `test/features/payment/simple-book-with-payment/implemented/with-payment-property-test.js`.

### feature.json

For each feature, there also exists a `feature.json` file, which contains metadata about the feature. This is used by the [Documentation Generator](./ARCHITECTURE.md#documentation-generator) to automatically generate the documentation for that feature. It exists at the following path:

`test/features/<testCategory>/<testFeature>/feature.json`

Here is an example `feature.json` file:

```json
{
  "category": "payment",
  "identifier": "non-free-opportunities",
  "name": "Opportunities with a non-zero price",
  "description": "The most simple form of booking with payment. Does not check for leases.",
  "explainer": "",
  "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description",
  "required": false,
  "coverageStatus": "complete",
  "links": [
    {
      "name": ".NET Tutorial",
      "href": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order"
    }
  ],
  "requiresOneOfIfImplemented": ["prepayment-optional", "prepayment-required",  "prepayment-unavailable"]
}
```

## Anatomy of a test

Most tests are configured using `FeatureHelper.describeFeature(..)`. A simple example usage of this is:

```js
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'availability-confirmed',
  testName: 'Occupancy in C1 and C2 matches feed',
  testDescription: 'Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
```

An explanation of the main properties:

* `testCategory`, `testFeature`, `testIdentifier`: Identifiers for the **Category**, **Feature** and **Test** respectively. For info on what these are, see [Structure](#structure).
* `testFeatureImplemented`: Whether or not this test is **implemented** or **non-implemented**. For info on what this means, see [Structure](#structure).
* `testName`, `testDescription`: Short- and long-form human-readable descriptions of the text. These are used for automatic Documentation Generation and for the test report.
* `testOpportunityCriteria`: The **Opportunity Criteria** to use for the primary OrderItem under test. For info on criteria, see [Opportunity Criteria](#opportunity-criteria).
* `controlOpportunityCriteria`: The **Opportunity Criteria** to use for any "control" OrderItems.

    When the test is run with multiple opportunities, a "control" opportunity will be added. With this, one can test that the feature still works if combined with other opportunities.

    For example, if testing an error, set the controlOpportunityCriteria to TestOpportunityBookable to ensure that the correct error is returned even though one of the opportunities in the Order is valid.

    If a control isn't appropriate for a particular test, this can be set to the same value as `testOpportunityCriteria`.

This is not an exhaustive list of properties which `FeatureHelper.describeFeature(..)` accepts. See the code documentation for the full picture.

For more information on `FeatureHelper`, see [the ARCHITECTURE doc](./ARCHITECTURE.md#feature-helper).

### Opportunity Criteria

What a Criteria is is documented in [the test-interface-criteria docs](../test-interface-criteria/README.md#criteria).

Each test is configured to only run for Opportunities which conform to some criteria. This is primarily specified by the `testOpportunityCriteria` property of `FeatureHelper.describeFeature(..)`.

In this example, the test will only run for Opportunities which are bookable, cancellable, and where the current time falls within the cancellation window:

```js
FeatureHelper.describeFeature(module, {
  testName: 'Successful booking and cancellation within window.',
  testDescription: 'A successful end to end booking including cancellation within the cancellation window.',
  testOpportunityCriteria: 'TestOpportunityBookableCancellableWithinWindow',
```

This is particularly useful for this test, as it checks that these types of Opportunities can be successfully booked and cancelled. If the test were to run for Opportunities which are not cancellable, then the test would fail, but this would not be a valid failure.

## Writing a new test

### 1. New feature?

If creating a new feature, create a new folder within `test/features/` with the name of the feature. Within that folder, create a `feature.json` file as described in [feature.json](#featurejson).

If this new test is being added to an existing feature, then skip this step.

### 2. New Test Interface Criteria?

Each test has a set of Criteria configured (see [Opportunity Criteria](#opportunity-criteria)). Check whether or not this test can use a Criteria that already exists or if a new one is needed. If a new Criteria is needed, be sure to create it in the [Test Interface](https://openactive.io/test-interface/) spec, as well as in the [`test-interface-criteria`](../test-interface-criteria/) package.

### 3. Create the test

In most cases, the test should be configured using `FeatureHelper.describeFeature(..)` as described in [Anatomy of a test](#anatomy-of-a-test). Other `FeatureHelper` functions can be used for other cases – see the code documentation and usage of each for more info.

Here is an example of a simple test, split into annotated parts:

#### 3.1. Configure the test

Configure the test using `FeatureHelper.describeFeature(..)`, which helps generate documentation, test reports, and sets up the tests.

```js
const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../helpers/flow-stages');

// Configuration for the test, which helps generate documentation, test reports, and sets up the tests.
FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free',
  testName: 'Successful booking without payment property',
  testDescription: 'A successful end to end booking without the `payment` property included.',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  // This must also be TestOpportunityBookableFree as the payment property is only disallowed if ALL items are free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
```

#### 3.2. Set up Flow Stages

Flow Stages are explained in more detail in [their docs](./test/helpers/flow-stages/README.md).

Here, we're using a [FlowStageRecipes recipe](./test/helpers/flow-stages/README.md#flowstagerecipes) to initialise the following [Flow Stage Runnables](./test/helpers/flow-stages/README.md#FlowStageRunnable):

1. **Fetch Opportunities**: Fetches the Opportunities and Offers (with the given **Criteria**) from the [Broker Microservice](../openactive-broker-microservice/README.md) which are needed to run the test.
2. **C1-and-Assert-Capacity**: Calls C1 for the selected Opportunity-Offer combos. Additionaly, checks, via the Broker Microservice, that the capacity of the Opportunity is as expected after calling C1 (it should be unchanged unless anonymous leasing is supported).
3. **C2-and-Assert-Capacity**: Similar to C1 but for C2.
4. **Book-and-Assert-Capacity**: How this behaves depends on whether Simple Booking Flow or Approval Booking Flow is under test (See: [Test Matrix](./ARCHITECTURE.md#test-matrix)):
    * **Simple Booking Flow**: Similarly to C1 and C2, calls B and checks that the capacity is as expected.
    * **Approval Booking Flow**: Calls: P -> Order Proposal Feed Update -> B, and checks that the capacity is as expected after each of P and B.

If you need to test a different flow from this, there are many other Flow Stage Recipes available, and it's always possible to create custom flows from scratch.

Note that the Flow Stages are just initiated. None of the API calls are made yet.

```js
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(
    orderItemCriteriaList,
    logger,
    // Overridable options for the Flow Stages.
    {
      // Set the request template to 'standardFree' for the B (or P) request
      bookReqTemplateRef: 'standardFree'
    }
  );
```

In this example, we use the `standardFree` Book Request Template in order to ensure that the free booking is successful. Request templates are a useful way to configure the requests at each Flow Stage. For more info, see [Request Templates](./test/templates/README.md).

#### 3.3 Run Tests

Now that the Flow Stages have been set up, we use [FlowStageUtils](./test/helpers/flow-stages/README.md#flowstageutils) to create Jest test hooks (including `describe(..)`, etc) for each of the Flow Stages.

It is in these Jest hooks where the API calls are made, outputs from each Flow Stage input into the next one, and then the results are checked.

Except for `fetchOpportunities`, each invocation of `FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(..)` includes an additional callback, in which custom tests are included. Each of these custom tests must be run within `it(..)` hooks. See that `itShouldHavePrepayment(..)` is a function which creates an `it(..)` hook. If you are not familiar with Jest hooks, please see the [Jest docs](https://jestjs.io/docs/setup-teardown).

```js
  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  // This does the following:
  // - Runs the C1 FlowStage, which calls C1 in the Booking System under test
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldHavePrepayment('https://openactive.io/Unavailable', () => c1.getStage('c1').getOutput().httpResponse.body);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldHavePrepayment('https://openactive.io/Unavailable', () => c2.getStage('c2').getOutput().httpResponse.body);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    if (bookRecipe.isApproval()) {
      itShouldHavePrepayment('https://openactive.io/Unavailable', () => bookRecipe.p.getOutput().httpResponse.body);
    }
    itShouldHavePrepayment('https://openactive.io/Unavailable', () => bookRecipe.b.getOutput().httpResponse.body);
  });
});

/**
 * @param {string | null} expected
 * @param {() => unknown} getOrder
 */
function itShouldHavePrepayment(getOrder) {
  it(`should return \`totalPaymentDue.openBookingPrepayment\` \`https://openactive.io/Unavailable\``, () => {
    const order = getOrder();
    expect(order).to.have.nested.property('totalPaymentDue.openBookingPrepayment', expected);
  });
}
```

##### Error Scenarios

When testing error scenarios, we would instead use `FlowStageUtils.describeRunAndCheckIsValid(..)` on the Flow Stage Runnable which is expected to fail, which forgoes checking that the HTTP response is successful. Here's an example of that (note that this is NOT an extension of the previous example, but a snippet from a different hypothetical test):

```js
  FlowStageUtils.describeRunAndCheckIsValid(c2, () => {
    itShouldReturnAnOpenBookingError('IncompleteBrokerDetailsError', 400, () => c2.getOutput().httpResponse);
  });
```

This uses a helper function `itShouldReturnAnOpenBookingError(..)` which checks that the HTTP response is an [Open Booking Error](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#oa-openbookingerror) with the expected `@type` and `statusCode`.


## TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

Type checking is performed by running:

```sh
npx tsc
```

This is included in the test script so that this check is performed by CI.
