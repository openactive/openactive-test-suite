[< Return to Overview](../../README.md)
# Dataset Site (dataset-site)

Discoverable open data


https://www.openactive.io/open-booking-api/EditorsDraft/#endpoints

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-2-open-data-feeds)



### Running tests for only this feature

```bash
npm test --runInBand -- test/features/core/dataset-site/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` within `test.json`:

```json
"implementedFeatures": {
  ...
  "dataset-site": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [dataset-site-jsonld-valid](./implemented/dataset-site-jsonld-valid-test.js) | Dataset Site JSON-LD valid | Validates the JSON-LD within the dataset site, using the microservice as a caching proxy. If you make changes to the dataset site, you must restart the microservice. |  |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
