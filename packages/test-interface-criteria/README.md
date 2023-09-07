# test-interface-criteria

A library that matches opportunities provided in the [OpenActive Modelling Opportunity Data 2.0](https://openactive.io/modelling-opportunity-data/) format against the [OpenActive Test Interface](https://openactive.io/test-interface/) Criteria.

## Usage

`criteria` is available as an array of `Criteria`.

`criteriaMap` is available as a map of `Criteria`, keyed by their name.

The `testMatch(opportunity)` method is available on each `Criteria`, and returns:
- `matchesCriteria`: a boolean indicating whether or not the specified opportunity matches the criteria
- `unmetCriteriaDetails`: an array of strings that each indicate a reason why the opportunity did not match

## Example

```javascript
const TestInterfaceCriteria = require('@openactive/test-interface-criteria');

const TestOpportunityBookableCriteria = TestInterfaceCriteria.criteriaMap.get('TestOpportunityBookable');
const { matchesCriteria, unmetCriteriaDetails } = TestInterfaceCriteria.testMatch(TestOpportunityBookableCriteria, opportunity);
```

## Concepts

### Opportunity-Offer

An Opportunity-Offer is a combination of an [Opportunity](https://openactive.io/open-booking-api/EditorsDraft/#dfn-opportunity) and one of its [Offers](https://openactive.io/modelling-opportunity-data/#describing-offers-code-schema-offer-code-). This combination is selected by a customer in order to make a booking in real life. Similarly, Test Suite tests select an Opportunity-Offer before testing a booking flow.

### Criteria

A Criteria is a set of Constraints that an **Opportunity-Offer** may or may not satisfy. For example, the `TestOpportunityBookableNotCancellable` criteria is only satisfied for an Opportunity-Offer that can be booked but cannot be cancelled.

The Criteria are specified in the [Test Interface](https://openactive.io/test-interface) spec. Each of the "Enumeration Values" with type `test:TestOpportunityCriteriaEnumeration` is one of the supported Criteria.

This package, `test-interface-criteria`, provides, for each of the Criteria specified in the spec, the logic for determining whether or not an Opportunity-Offer satisfies that Criteria. In this package, this logic is split into composable **Constraints**.

### Constraints

Each **Criteria** is composed of multiple Opportunity Constraints and Offer Constraints. Each of these is a predicate function that returns true if the Opportunity or Offer satisfies the Constraint, and false otherwise. Here is an example Opportunity Constraint:

```js
/**
* @type {OpportunityConstraint}
*/
function endDateMustBeInThePast(opportunity) {
  return DateTime.fromISO(opportunity.endDate) < DateTime.now();
}
```

And, an example Offer Constraint:

```js
/**
* @type {OfferConstraint}
*/
function mustNotBeOpenBookingInAdvanceUnavailable(offer) {
  return offer.openBookingInAdvance !== 'https://openactive.io/Unavailable';
}
```

## Developing

### TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

In order for these types to be used by other projects, they must be saved to [TypeScript Declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html). This is enabled by our tsconfig.json, which specifies that declaration files are to be generated and saved to `built-types/` (As an aside, the reason that the package's types must be saved to .d.ts files is due to TypeScript not automatically using JS defined types from libraries. There is a good reason for this and proposals to allow it to work at least for certain packages. See some of the discussion here: https://github.com/microsoft/TypeScript/issues/33136).

For this reason, TypeScript types should be generated after code changes to make sure that test-interface-criteria consumers can use the new types. The openactive-test-suite project does this automatically in its pre-commit hook, which calls `npm run gen-types`

TypeScript-related scripts:

- `check-types`: This uses the `tsconfig.check.json` config, which does not emit any TS declaration files - all it does is check that there are no type errors. This is used for code tests.
- `gen-types`: This uses the `tsconfig.gen.json` config, which emits TS declaration files into `built-types/`.

  Additionally, it copies programmer-created `.d.ts` files from our source code (e.g. `src/types/Criteria.d.ts`) into `built-types/`. This is because our code references these types, so they must be in the `built-types/` directory so that the relative paths match (e.g. so that `import('../types/Criteria').Criteria` works).

### FAQs

#### Why Does ESLint sometimes downgrade its version?

Sometimes you'll notice ESLint erroring with "Error: invalid ecmaParser option" or changing its mind as to whether or not single-argument arrow functions should have parentheses around their arg. This is because NPM has for some reason installed an old version of ESLint. You can remedy this by running `npm install` again in the test-interface-criteria package.

This seems to happen as a result of running `npm install` in the Broker or Integration Tests packages. For more info: https://github.com/openactive/openactive-test-suite/pull/366#issuecomment-825951901.
