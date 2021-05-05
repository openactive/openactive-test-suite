# Development

## Architecture

The testing architecture is documented in [ARCHITECTURE.md](./architecture.md). This is fairly in depth so is only necessary if making changes to the core testing framework.

## Structure

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

## Implemented / non-implemented

Implemented and non-implemented tests are the test modes, these are configured within the test suite by the user and this defines whether their implementation implements a feature or not. Some features are purely optional, in this case these may simply have tests to simply ensure that the service is not advertising as supporting a feature.

## FeatureHelper

This is a class that abstracts away much of the above. This implements the `describe` blocks and initiates the logger. This allows describing the current test, along with the criteria required for it.

## Approach

For each feature, implement the following `feature.json`:

```json
{
  "category": "payment",
  "identifier": "simple-book-with-payment",
  "name": "Simple Booking of paid opportunities",
  "description": "The most simple form of booking with payment. Does not check for leases.",
  "explainer": "",
  "specificationReference": "https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description",
  "required": false,
  "coverageStatus": "partial",
  "links": [
    {
      "name": ".NET Tutorial",
      "href": "https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order"
    }
  ]
}
```

Check the [`test-interface-criteria`](../test-interface-criteria/) package includes any Criteria that are needed for a new test, and add any based on the [Test Interface specification](https://openactive.io/test-interface/) as necessary.


In each test file within that feature, implement the following (as a simple example):

```js
FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Successful booking with payment property',
  testDescription: 'A successful end to end booking with the `payment` property included.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableNonFreePrepaymentRequired',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
}, (configuration, orderItemCriteria, featureIsImplemented, logger) => {
  // # Set-up Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
```

For each Stage of the test (e.g. C1, or C2, or ..etc), a `describe(..)` block should be created. The `FlowStageUtils.describeRun..` functions will do this automatically e.g.:

```js
  // # Test flow stages
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    it('should return `totalPaymentDue.openBookingPrepayment` "Required"', () => {
      expect(c1.getOutput().httpResponse.body).to.have.nested.property('totalPaymentDue.openBookingPrepayment', 'https://openactive.io/Required');
    });
  });
```

## TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

Type checking is performed by running:

```sh
npx tsc
```

This is included in the test script so that this check is performed by CI.
