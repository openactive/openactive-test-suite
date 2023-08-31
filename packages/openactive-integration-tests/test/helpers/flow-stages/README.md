# Flow Stages

A Flow is a sequence of API calls that are made by Test Suite, for a given test, against either the Booking System  or the Broker Microservice. A Flow Stage encapsulates the configuration and logic for one of those API calls. e.g. there is a FlowStage for C1 (which is in the Booking System), a FlowStage for Fetch Opportunities (which uses the Broker Microservice), etc.

As an example, for [`opportunity-free-test`](packages/openactive-integration-tests/test/features/payment/free-opportunities/implemented/opportunity-free-test.js), when running in [Simple Booking Flow](https://openactive.io/open-booking-api/EditorsDraft/#simple-booking-flow), the following Flow Stages are utilised:

1. Fetch Opportunities
2. C1
3. Assert Opportunity Capacity (after C1)
4. C2
5. Assert Opportunity Capacity (after C2)
6. B
7. Assert Opportunity Capacity (after B)

Each of these FlowStages does the following, when run in a test:

1. Receives some input from previous FlowStages (if applicable)
  - This input can be provided to each FlowStage via `getInput(..)`, which is provided in the constructor. e.g. to have a C1 FlowStage receive the output of a Fetch Opportunities FlowStage, use the following in the C1 FlowStage's constructor:
    ```js
    const fetchOpportunities = new FetchOpportunitiesFlowStage({ /* ... */ });
    const c1 = new C1FlowStage({
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
      // ... other args
    });
    ```
2. Performs an API call
  - Using `runFn(..)`, which is provided in the constructor
3. Transforms the output
  - This is also performed in `runFn(..)`, which is provided in the constructor
4. Sends (some of) this output to subsequent FlowStages
  - This output is automatically saved by the FlowStage as the output from `runFn(..)`, which is provided in the constructor, and can be retrieved by calling `getOutput(..)` on the FlowStage instance.

FlowStages can then be queried after they've run in order to:

1. Check that the FlowStage was successful
  - This is overridable per-FlowStage. For example, B's Flow Stage considers the run successful if the HTTP response has status 201
  - FlowStage method: `itSuccessChecks()`
2. Perform validation checks on the output
  - This is overridable per-FlowStage. In all cases, this is a case of calling [Validator](https://github.com/openactive/data-model-validator) on the HTTP output.
  - FlowStage method: `itValidationTests()`

## FlowStageRunnable

An abstraction that can be either a **Flow Stage**, [**Book Recipe**](./book-recipe.js) or a [**Flow Stage Run**](./flow-stage-run.js). This represents a single FlowStage or sequence of FlowStages that can be run.

This encapsulation allows us to, for example, more easily reason about tests in which the "book" stage could use either [Simple Booking Flow](https://openactive.io/open-booking-api/EditorsDraft/#simple-booking-flow) or [Booking Flow with Approval](https://openactive.io/open-booking-api/EditorsDraft/#booking-flow-with-approval), which involve different sets of API calls.

## Jest Tests

Flows, consisting of Flow Stages, run the underlying API calls which are being tested, via Jest in the various Test Suite tests.

Jest tests involve a custom course of execution, in which setup occurs in `beforeEach`/`beforeAll` hooks, tests are run in `it` hooks, etc. Flow Stages are designed to work with this.

Here is how Flow Stages slot into Jest's test execution lifecycle:

- (Outside of hooks): A `FlowStage` class instance is created. The configuration of this FlowStage defines what will happen when it is run.
- `describe` hook: Contains the execution and checking logic for a given test.
  - `beforeAll` hook: Runs the FlowStage.
  - `it` hooks: Run success, validation, and any additional tests on the output of the FlowStage.

## FlowStageUtils

[FlowStageUtils](./flow-stage-utils.js) is a collection of utility functions which simplify and standardise the process of using FlowStages to write Test Suite tests.

Of particular importance is the `describeRunAndRunChecks(..)` function, which creates a Jest `describe(..)` hook for a given **FlowStageRunnable** which performs the running and checking of the runnable as described in the **Jest Tests** section.

## FlowStageRecipes

Setting up a flow, consisting of multiple FlowStages where each feeds input into the next, can require a lot of boilerplate and repeated logic. In most cases, parts of these flows can be packaged up as they will be the same in lots of different tests.

These packaged up flows are stored in [FlowStageRecipes](./flow-stage-recipes.js).

An example is `initialiseSimpleC1C2BookFlow(..)`, which sets up a FetchOpportunities -> C1 -> C2 -> Book flow, which works with either [Simple Booking Flow](https://openactive.io/open-booking-api/EditorsDraft/#simple-booking-flow) or [Booking Flow with Approval](https://openactive.io/open-booking-api/EditorsDraft/#booking-flow-with-approval). This is used in many tests which simply make a booking with a certain configuration and simply check that it was successful or failed as expected.
