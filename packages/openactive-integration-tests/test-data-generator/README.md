# test-data-generator

Command line tool to generate a distribution definition of test data based on the configured features.

Test data is outputted to `./test-data/test-data.json` by default.

The data outputted by this tool can be used by a script to add sufficient test data into your [Open Booking API](https://openactive.io/open-booking-api/EditorsDraft/) implementation's database for testing when using [random mode](../README.md#userandomopportunities).

## Usage

```bash
npm run test-data-generator # all active features specified in the current config

npm run test-data-generator -- common-error-conditions # only enough data for the common-error-conditions feature

npm run test-data-generator -- --output ./test-data.json # output to ./test-data.json
```

## Test data file format

The `item` within the file format is identical to the Controlled Opportunity Creation endpoint defined within the [OpenActive Test Interface](https://openactive.io/test-interface/). This allows an implementation to use the same logic to generate data from the test data file and from the test interface.

```json
{
  "@context": [
    "https://openactive.io/",
    "https://openactive.io/test-interface"
  ],
  "@type": "ItemList",
  "numberOfItems": 123,
  "itemListElement": [
    {
      "@type": "ListItem",
      "item": {
        "@type": "ScheduledSession",
        "superEvent": {
          "@type": "SessionSeries",
          "organizer": {
            "@type": "Organization",
            "@id": "https://id.booking-system.example.com/organizer/3"
          }
        },
        "test:testOpportunityCriteria": "https://openactive.io/test-interface#TestOpportunityBookable",
        "test:testOpportunityDataShapeExpression": [
          {
            "@type": "test:TripleConstraint",
            "predicate": "https://schema.org/remainingAttendeeCapacity",
            "valueExpr": {
              "@type": "NumericNodeConstraint",
              "mininclusive": 2
            }
          }
        ],
        "test:testOfferDataShapeExpression": [
          {
            "@type": "test:TripleConstraint",
            "predicate": "https://openactive.io/openBookingFlowRequirement",
            "valueExpr": {
              "@type": "test:ArrayConstraint",
              "datatype": "oa:OpenBookingFlowRequirement",
              "excludesAll": [
                "https://openactive.io/OpenBookingApproval"
              ]
            }
          }
        ]
      },
      "test:numberOfInstancesInDistribution": 32
    }
  ]
}
```

## Use with reference implementation in development

Run the generator:
```bash
$ npm run test-data-generator

Test data file created containing a distribution with 482 items:
/example/path/test-data/test-data.json
```

Take the output path, and set the environment variable `OpenActiveTestDataFile` in `AppSettings.Development.json`:
```json
"OpenActiveTestDataFile": "/example/path/test-data/test-data.json"
```

```
dotnet run
```

## Use with reference implementation in CI

```bash
npm run test-data-generator
export OpenActiveTestDataFile=/example/path/test-data/test-data.json
dotnet run
```
