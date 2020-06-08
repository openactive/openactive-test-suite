# Development

## Architecture

The testing architecture is documented in [ARCHITECTURE.md](http://architecture.md). This is fairly in depth so is only necessary if making changes to the core testing framework.

## Structure

Tests are namespaced by Category, Integration Test, Feature and finally implemented/non-implemented.

i.e. features/payment/simple-book-with-payment/implemented/with-payment-property-test.js

## Implemented / non-implemented

Implemented and non-implemented tests are the test modes, these are configured within the test suite by the user and this defines whether their implementation implements a feature or not. Some features are purely optional, in this case these may simply have tests to simply ensure that the service is not advertising as supporting a feature.

## FeatureHelper

This is a class that abstracts away much of the above. This implements the `describe` blocks, initiates the state tracker, flow and logger. This allows describing the current test, along with the criteria required for it.

## Approach

In each test file implement the following:

```jsx
* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature({
  testCategory: 'payment',
  testFeature: 'simple-book-with-payment',
  testFeatureImplemented: true,
  testName: 'with-payment-property',
  testDescription: 'A successful end to end booking with the `payment` property included.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  beforeAll(async function () {
    await state.createOpportunity(orderItemCriteria);

    return chakram.wait();
  });

  afterAll(async function () {
    await state.deleteOrder();
    return chakram.wait();
  });
```

For each phase of the test, implement a describe block, i.e.

```jsx
describe('C1', function () {
    const c1 = (new C1({
      state, flow, logger, configuration,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('availability should match open data feed', () => {
      c1.expectSuccessful();

      expect(state.c1Response).to.have.json(
        'orderedItem[0].orderedItem.remainingAttendeeCapacity',
        state.apiResponse.body.data.remainingAttendeeCapacity,
      );
    });
  });
```
