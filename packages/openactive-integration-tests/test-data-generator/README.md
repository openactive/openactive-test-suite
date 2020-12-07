# test-data-generator

Command line tool to generate a distribution definition of test data based on the configured features.

Test data is outputted to `./test-data/test-data.json` by default.

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
        "test:testOpportunityDataRequirements": {
          "@type": "test:OpportunityTestDataRequirements",
          "test:startDate": {
            "@type": "test:DateRange",
            "minDate": "2020-12-20",
            "maxDate": "2020-12-25",
          },
          "test:remainingCapacity": {
            "@type": "QuantitativeValue",
            "minValue": 1,
          }
        },
        "test:testOfferDataRequirements": {
          "@type": "test:OfferTestDataRequirements",
          "test:price": {
            "@type": "QuantitativeValue",
            "minValue": 0.01,
          },
          "test:prepayment": {
            "@type": "test:OptionRequirements",
            "valueType": "oa:RequiredStatusType",
            "blocklist": ["https://openactive.io/Unavailable"]
          }
        }
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
