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
