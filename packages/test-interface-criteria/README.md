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
const { criteriaMap } = require("@openactive/test-interface-criteria");
let { matchesCriteria, unmetCriteriaDetails } = criteriaMap.get('TestOpportunityBookable').testMatch(opportunity);
```

## Developing

### TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

In order for these types to be used by other projects, they must be saved to [TypeScript Declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html). This is enabled by our tsconfig.json, which specifies that declaration files are to be generated and saved to `built-types/` (As an aside, the reason that the package's types must be saved to .d.ts files is due to TypeScript not automatically using JS defined types from libraries. There is a good reason for this and proposals to allow it to work at least for certain packages. See some of the discussion here: https://github.com/microsoft/TypeScript/issues/33136).

For this reason, TypeScript types should be generated after code changes to make sure that test-interface-criteria consumers can use the new types. The openactive-test-suite project does this automatically in its pre-commit hook.
