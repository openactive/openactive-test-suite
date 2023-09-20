# openactive-broker-microservice

This "Broker Microservice" project is a component of the OpenActive Test Suite. Although it can be run stand-alone for some advanced use-cases, it is run automatically as part of the OpenActive Test Suite `npm start` command (or when the OpenActive Test Suite Docker container is started). For general information about running the OpenActive Test Suite, please see the [relevant documentation](https://developer.openactive.io/open-booking-api/test-suite).

## How it works

Broker Microservice sits in front of a [Booking System](#booking-system-under-test), which is an implementation of the [Open Booking API specification](https://openactive.io/open-booking-api/EditorsDraft/), and provides the following services, to support OpenActive Test Suite:

1. Fetch, parse and validate data from the Booking System's [Dataset Site](https://openactive.io/dataset-api-discovery/EditorsDraft/).
2. Set up and maintain [auth credentials](#auth) for access to the Booking System.
3. [Harvests](#initial-harvest) data from the Booking System's Opportunity and Order RPDE feeds.
    * This data is then [validated](#data-model-validation) and [cached](#opportunity-id-cache) and any [listeners](#two-phase-listeners) are notified.

It needs to be running, against a Booking System, in order for the [openactive-integration-tests](../openactive-integration-tests/) to run.

## Usage in separate terminal windows

To run `openactive-broker-microservice` in separate terminal window to `openactive-integration-tests`, from repository root:

1. Install dependencies: `npm install`
2. Specify Configuration file: `export NODE_ENV=dev`
    * This is the command to use if using the `dev.json` config file, which is the default behaviour. See [Configuration](../../README.md#configuration) for more details
3. Start Broker: `npm run start-broker`
4. Run [openactive-integration-tests](../openactive-integration-tests/) in another terminal window

## Configuration for `broker` within `./config/{NODE_ENV}.json`

The `broker` object within `./config/{NODE_ENV}.json` file of the repository configures access to the Open Booking API. This object includes the properties listed below.

### `datasetSiteUrl`

The URL of the dataset site of the Booking System under test. This dataset site is used to configure the test suite.

```json
  "datasetSiteUrl": "https://reference-implementation.openactive.io/openactive",
```

Please note the JSON within the dataset site must include the dataset site [Open Booking API extension](https://github.com/openactive/dataset-api-discovery/issues/2), as follows:

```json
{
  "@context": "http://schema.org/",
  "@type": "Dataset",
  ...
  "accessService": {
    "@type": "WebAPI",
    "name": "Open Booking API",
    "description": "API that allows for seamless booking experiences to be created for sessions and facilities available from Better",
    "conformsTo": [
      "https://www.openactive.io/open-booking-api/EditorsDraft/"
    ],
    "documentation": "https://developer.openactive.io/go/open-booking-api",
    "endpointDescription": "https://www.openactive.io/open-booking-api/EditorsDraft/swagger.json",
    "endpointUrl": "https://example.bookingsystem.com/api/openbooking/",
    "landingPage": "https://exampleforms.com/get-me-an-api-access-key",
    "termsOfService": "https://example.bookingsystem.com/terms"
  }
}
```

Note that the `endpointUrl` is most important, and must refer to your local Open Booking API [Base URI](https://openactive.io/open-booking-api/EditorsDraft/#dfn-base-uri).

### `requestLogging`

Makes the output in the terminal more verbose. Useful for debugging.

```json
  "requestLogging": false,
```


### `waitForHarvestCompletion`

If `true` will block the `openactive-integration-tests` starting until the last page of each harvested feed is reached. This is useful for continuous integration environments.
If `false` and `broker` and `openactive-integration-tests` are running in separate terminals, the tests will start without waiting for harvesting to finish. This is useful for tests that do not require a large amount of data, or, for example, authentication tests that are not data dependant.

```json
  "waitForHarvestCompletion": true,
```

### `loginPagesSelectors`

[CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) which are used to find, in the Booking System's login page the following HTML elements:

* Username text input
* Password text input
* Submit button

```json
  "loginPagesSelectors": {
    "username": "[name='username' i]",
    "password": "[name='password' i]",
    "button": ".btn-primary"
  },
```

These selectors would work for a login page whose HTML looks like:

```html
<input type="text" name="username" placeholder="Username" />
<input type="password" name="password" placeholder="Password" />
<input type="submit" class="btn-primary" value="Submit" />
```

**Context**: For Sellers which use OpenID Connect for authorization, Broker needs to acquire these Sellers' tokens in order to authenticate as each of these Sellers. Broker does this by going through [Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/), loading the Booking System's login page in a headless browser and entering username/password details therein.

### `opportunityFeedRequestHeaders`

For private test environments with opportunity feeds that require authentication, headers may be configured. Note that in order to be considered "OpenActive Enabled" and to conform to the Open Booking API, such headers must not be required in production.

```json
  "opportunityFeedRequestHeaders": {
    "X-Api-Key": "example-api-key"
  }
```

### `datasetDistributionOverride`

For test environments that do not yet include a Dataset Site, data feeds may be manually configured. Note that in order to be considered "OpenActive Enabled" and to conform to the Open Booking API, a Dataset Site must be made available in production.

```json
  "datasetDistributionOverride": [
    {
      "@type": "DataDownload",
      "additionalType": "https://openactive.io/ScheduledSession",
      "contentUrl": "https://api.example.com/feeds/scheduled-sessions"
    },
    {
      "@type": "DataDownload",
      "additionalType": "https://openactive.io/SessionSeries",
      "contentUrl": "https://api.example.com/feeds/session-series"
    }
  ]
```

### `disableBucketAllocation`

When using the Broker Microservice as a tool to check validity of opportunity feeds that contain very large datasets, it can be desirable to limit memory usage by disabling bucket allocation. Note that bucket allocation must be enabled to run [Integration tests](../openactive-integration-tests/).

```json
  "disableBucketAllocation": true,
```

### `disableOrdersFeedHarvesting`

During development it may be desirable to temporarily disable harvesting of the Orders Feed. Note that tests that require the Orders Feed will fail when this is set to `true`.

```json
  "disableOrdersFeedHarvesting": true,
```

### `disableBrokerMicroserviceTimeout`

Opportunities are sorted into test-interface-criteria buckets based on the startDate of the opportunity when it is harvested. The means that the broker microservice must be restarted periodically to ensure its buckets allocation does not get stale. If bucket allocation becomes stale, tests will start to fail randomly.

This property must be set to allow the openactive-broker-microservice to run for more than 1 hour.

```json
  "disableBrokerMicroserviceTimeout": true,
```

### `logAuthConfig`

While debugging authentication it can be useful to log the configuration that the broker microservice is supplying the integration tests to use for authentication.

```json
  "logAuthConfig": true,
```

### `headlessAuth`

When debugging authentication, it can be useful to see the browser window in which the OpenID Connect authentication tests take place. This setting configures [Puppeteer's `headless` option](https://github.com/puppeteer/puppeteer#default-runtime-settings), which can be set to `false` to show the browser window. By default, this is set to `true`, so that the browser window is hidden.

```json
  "headlessAuth": true,
```

### `bookingPartners`

Config for [Booking Partners](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-booking-partner) that the Test Suite will use to connect to your Booking System.

When running Broker Microservice with [Integration Tests](../openactive-integration-tests/) (which is the primary usage of Broker Microservice), you must define two Booking Partners, named `primary` and `secondary`.

```json
  "bookingPartners": {
    "primary": {
      "authentication": {
        "initialAccessToken": "openactive_test_suite_client_12345xaq"
      }
    },
    "secondary": {
      "authentication": {
        "clientCredentials": {
          "clientId": "clientid_800",
          "clientSecret": "secret"
        }
      }
    }
  }
```

When running Broker Microservice as a standalone app, any number of Booking Partners may be defined e.g. `acme1`, `acme2` and `acme3` instead of `primary` and `secondary`. Note that these will _not_ work with the [Integration Tests](../openactive-integration-tests/), which expect only `primary` and `secondary`.

The `authentication` field can contain one of several different authentication strategies for authenticating as the Booking Partner for Order and Order Proposal RPDE Feed requests. Set only one of these strategies. The different authentication strategies are documented in the below subsections.

#### `bookingPartners[bookingPartnerIdentifier].authentication.ordersFeedRequestHeaders`

Use this authentication strategy when accessing the Orders Feed just requires a fixed set of HTTP Headers (e.g. `X-Api-Key: abcdef`).
These headers are used when accessing the Orders Feed. Note that such authentication [must not be specific to any particular seller](https://openactive.io/open-booking-api/EditorsDraft/#authentication).

```json
  "ordersFeedRequestHeaders": {
    "X-OpenActive-Test-Client-Id": "test"
  }
```

#### `bookingPartners[bookingPartnerIdentifier].authentication.clientCredentials`

Use this authentication strategy when using [Client Credentials Flow](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-client-credentials-flow) for accessing Order feeds.

```json
  "clientCredentials": {
    "clientId": "clientid_800",
    "clientSecret": "secret"
  }
```

#### `bookingPartners[bookingPartnerIdentifier].authentication.initialAccessToken`

Use this authentication strategy when using [Client Credentials Flow](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-client-credentials-flow) but, rather than using an existing client, Broker will register a new client with your Authorization Server using Dynamic Client Registration. For this, your Authorization Server must support [Dynamic Client Registration](https://openid.net/specs/openid-connect-registration-1_0.html).

`initialAccessToken` is the ["Initial Access Token"](https://openid.net/specs/openid-connect-registration-1_0.html#rfc.section.1.2) which can grant access to your Authorization Server's Client Registration Endpoint.

```json
  "initialAccessToken": "openactive_test_suite_client_12345xaq"
```

### `sellers`
Config for [Sellers](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-seller) whose opportunities are booked are booked through the Booking System when Test Suite is run.

#### Multi-Seller systems
In multi-seller systems, Broker can book opportunities from two Sellers, named `primary` and `secondary`.

```json
   "sellers": {
    "primary": {
      "@type": "Organization",
      "@id": "https://reference-implementation.openactive.io/api/identifiers/sellers/1",
      "authentication": {
        "loginCredentials": {
          "username": "test1",
          "password": "test1"
        }
      },
      "taxMode": "https://openactive.io/TaxGross",
      "paymentReconciliationDetails": {
        "name": "AcmeBroker Points",
        "accountId": "SN1593",
        "paymentProviderId": "STRIPE"
      }
    },
    "secondary": {
      "@type": "Organization",
      "@id": "https://reference-implementation.openactive.io/api/identifiers/sellers/2",
      "authentication": {
        "loginCredentials": {
          "username": "test2",
          "password": "test2"
        }
      },
      "taxMode": "https://openactive.io/TaxNet"
    }
  }
```

The `authentication` field can contain various authentication strategies: [Auth Code Flow](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-authorization-code-flow), Bearer credentials, or API headers. Auth Code Flow is [recommended](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#openid-connect-booking-partner-authentication-for-multiple-seller-systems) for Multi-Seller systems.
Examples of how to define Auth Code flow credentials for Multi-Seller systems are shown above.

#### Single-seller systems
For single-seller systems, Broker can book opportunities from the only seller.

```json
"sellers": {
    "primary": {
      "@type": "Organization",
      "@id": "https://localhost:5001/api/identifiers/seller",
      "authentication": {
        "loginCredentials": null,
        "requestHeaders": {
          "X-OpenActive-Test-Client-Id": "booking-partner-1",
          "X-OpenActive-Test-Seller-Id": "https://localhost:5001/api/identifiers/seller"
        }
      }
    },
    "secondary": null
  }
```

The `authentication` field can contain various authentication strategies: [Client Credentials](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-client-credentials-flow), Bearer credentials, or API headers. 

Clients credentials can be defined as follows:
```json
"sellers": {
    "primary": {
      "@type": "Organization",
      "@id": "https://localhost:5001/api/identifiers/seller",
      "authentication": {
        "loginCredentials": null,
          "clientCredentials": {
            "clientId": "clientid_XXX",
            "clientSecret": "example"
          }
      }
    },
    "secondary": null
  }
```

## Broker Microservice API

Broker Microservice exposes an API which is used by [Integration Tests](../openactive-integration-tests/) and can be used by users to debug potential issues with the [Booking System](#booking-system-under-test).

### User-facing endpoints

Endpoints which can be used by users to debug potential issues with the [Booking System](#booking-system-under-test).

####  `GET /`

**Response Type**: 🌐 HTML

A home page which shows links to other user-facing endpoints

#### `GET /status`

**Response Type**: 🤖 JSON

Shows the status of the Broker Microservice. Use this to check on the progress of Broker and to help diagnose any potential issues. An annotated example response:

```json
{
  // How long Broker has been running for
  "elapsedTime": "2:58",
  // Is Broker currently `harvesting` or is it `paused`?
  "harvestingStatus": "harvesting",
  // Status about each RPDE feed that Broker is harvesting
  "feeds": {
    "ScheduledSession": {
      // The last page that Broker harvested from the ScheduledSession feed
      "currentPage": "https://acme-fitness.org/api/feeds/scheduled-sessions?afterChangeNumber=3710544489",
      // The total number of pages that Broker has harvested from the ScheduledSession feed so far
      "pages": 8,
      // The total number of items that Broker has harvested from the ScheduledSession feed so far
      "items": 3992,
      /* The reponse times, in milliseconds, of the last 5 pages that Broker
      harvested from the ScheduledSession feed */
      "responseTimes": [
        476.496187210083,
        303.6146593093872,
        313.0219888687134,
        294.4364585876465,
        359.7757930755615
      ],
      // Number of items which are queued up for Data Model Validation
      "totalItemsQueuedForValidation": 8,
      // Number of items which have been validated by Data Model Validation
      "validatedItems": 1978,
      /* This feed is in `sleepMode` if the last page has been reached, at which point the feed
      is polled at a slower rate until more data appears in the feed. */
      "sleepMode": true,
      // Time taken for Broker to completely harvest this feed
      "timeToHarvestCompletion": "0:07"
    },
    "SessionSeries": {
      "currentPage": "https://acme-fitness.org/api/feeds/session-series?afterChangeNumber=3662021037",
      // ...
    },
    "FacilityUse": { /* ... */ },
    "Slot": { /* ... */ },
    /* The Orders feed for Booking Partner `primary`. This is the Booking Partner configured
    in the `bookingPartners` config object with the key `primary`. */
    "OrdersFeed (auth:primary)": {
      "currentPage": "https://acme-fitness.org/api/booking/orders-rpde?afterChangeNumber=23504",
      // ...
    },
    // The OrderProposals feed for the same Booking Partner, `primary`.
    "OrderProposalsFeed (auth:primary)": {
      "currentPage": "https://acme-fitness.org/api/booking/order-proposals-rpde?afterChangeNumber=23504",
      // ...
    },
    // The Orders and OrderProposals feeds for Booking Partner `secondary`
    "OrdersFeed (auth:secondary)": { /* ... */ },
    "OrderProposalsFeed (auth:secondary)": { /* ... */ },
  },
  "orphans": {
    // Tracks the number of Orphans, according to the data that Broker currently has.
    "children": "0 of 13042 (0.00%)"
  },
  "totalOpportunitiesHarvested": 13042,
  // A summarised view of the numbers of Opportunities in the Buckets
  "buckets": {
    "TestOpportunityBookable": {
      "OpenBookingSimpleFlow": {
        "ScheduledSession": {
          /* There are 129 ScheduledSessions with this Seller ID that support
          Simple Booking Flow and satisfy the criteria `TestOpportunityBookable` */
          "https://acme-fitness.org/api/sellers/1": 129,
          "https://acme-fitness.org/api/sellers/2": 27
        },
        "FacilityUseSlot": {
          // ...
        },
        "IndividualFacilityUseSlot": {
          // ...
        }
      },
      "OpenBookingApprovalFlow": {
        // ...
      }
    },
    "TestOpportunityBookableNonFreeTaxNet": {
      "OpenBookingSimpleFlow": {
        "ScheduledSession": {
          /* Unlike with TestOpporunityBookable, there were no ScheduledSessions
          that matched this criteria, `TestOpportunityBookableNonFreeTaxNet`, so
          instead of showing Opportunity numbers for each Seller, the status
          endpoint shows a summary of why no Opportunities were found.
          The key with the highest value is likely to be the reason that there are
          no items in this bucket. */
          "criteriaErrors": {
            /* There are 892 ScheduledSessions which support Simple Booking Flow
            and that do not satisfy the `TestOpportunityBookableNonFreeTaxNet`
            criteria because they fail this contraint. That is to say that they
            do not have seller `taxMode` of `TaxNet`. */
            "Seller must have taxMode of TaxNet": 892,
            "Must not require additional details": 88,
            "startDate must be 2hrs in advance for random tests to use": 236,
            "Only non-free bookable Offers": 496,
            // ...
          }
        },
        "FacilityUseSlot": {
          // ...
        },
        "IndividualFacilityUseSlot": {
          // ...
        }
      },
      "OpenBookingApprovalFlow": {
        // ...
      }
    },
    // ... so on for every other criteria ...
  }
}
```

#### `GET /validation-errors`

**Response Type**: 🌐 HTML

Shows any [validation](#data-model-validation) errors that have been found for Opportunities that have been harvested from the [Booking System](#booking-system-under-test).

#### `GET /orphans`

**Response Type**: 🤖 JSON

Data about any [Orphans](#orphans) that Broker Microservice has found. Useful for debugging issues with the [Booking System](#booking-system-under-test)'s data.

Example response:

```json
{
  "children": {
    // Number of child Opportunities whose parent has been found i.e. not orphaned
    "matched": 11946,
    // Number of orphaned child Opportunities
    "orphaned": 2,
    // Total number of child Opportunities
    "total": 11948,
    // List of the orphaned child Opportunities
    "orphanedList": [
      {
        "jsonLdType": "ScheduledSession",
        // The RPDE item ID of the Orphan
        "id": "https://acme-fitness.org/api/scheduled-sessions/1",
        "modified": 1234,
        // The JSON-LD data for the Orphan
        "jsonLd": {
          "@context": "https://openactive.io/",
          "@type": "ScheduledSession",
          "@id": "https://acme-fitness.org/api/scheduled-sessions/1",
          "name": "Yoga",
          "superEvent": "https://acme-fitness.org/api/session-series/1",
          // ...etc
        },
        // The JSON-LD ID of the Orphan
        "jsonLdId": "https://acme-fitness.org/api/scheduled-sessions/1",
        // The anticipated JSON-LD ID of the Orphan's parent
        "jsonLdParentId": "https://acme-fitness.org/api/session-series/1",
      },
      // ... More orphans
    ]
  }
}
```

#### `GET /opportunity-cache/:id`

**Request params**:

* `id`: The ID of the [Child Opportunity](#orphans).

**Response Type**: 🤖 JSON

Get an expanded* [Child Opportunity](#orphans) (e.g. a ScheduledSession or IndividualFacilityUseSlot) from Broker Microservice's cache, by its ID. Useful for debugging issues with the [Booking System](#booking-system-under-test)'s data.

- *expanded: The Opportunity will have been expanded to include its parent Opportunity, if it references one that exists.

#### `GET /sample-opportunities`

**Request body**: The shape of [Child Opportunity](#orphans) to fetch. This data has the same specification as the request body to [Test Interface](https://openactive.io/test-interface/)'s [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities) endpoint.

**Response Type**: 🤖 JSON

Return a random sample of Opportunities that match the Opportunity Criteria, Seller and Opportunity Type from the request body. This endpoint is very similar to [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](#post-test-interfacedatasetstestdatasetidentifieropportunities), but instead is intended for use outside of [Integration Tests](../openactive-integration-tests/).

The primary use of this endpoint is to use with something like the [Postman API Platform](https://www.postman.com/) to empower a user to run manual tests against the [Booking System](#booking-system-under-test).

### Internal endpoints

Endpoints used by [Integration Tests](../openactive-integration-tests/).

#### `GET /health-check`

**Response Type**: 📄 Plain Text

Returns a response when the [Initial Harvest](#initial-harvest) is complete. This is used by [Integration Tests](../openactive-integration-tests/) to check that Broker Microservice is up to date with the [Booking System](#booking-system-under-test)'s data.

This endpoint starts by setting Broker Microservice's [Harvesting Status](#harvesting-status) to `resumed`. So, if it was `paused` before, it will now resume harvesting.

#### `POST /pause`

**Response Type**: 🕳️ Empty

Set Broker Microservice's [Harvesting Status](#harvesting-status) to `paused`.

This is called by [Integration Tests](../openactive-integration-tests/) when they have finished running. This reduces the load on the [Booking System](#booking-system-under-test) and on the user's machine in between runs of Test Suite.

#### `GET /config`

**Response Type**: 🤖 JSON

Config, which [Integration Tests](../openactive-integration-tests/) uses to configure itself. It contains:

* Broker Microservice config
* Derived Broker Microservice config e.g. `bookingApiBaseUrl` is parsed from the [Dataset Site JSON](https://openactive.io/dataset-api-discovery/EditorsDraft/#embedded-json) that was loaded from the Dataset Site defined by the [`datasetSiteUrl` configuration property](#datasetsiteurl).
* Config from the `OpenActiveTestAuthKeyManager` that Broker Microservice sets up. See [openactive-openid-test-client](../openactive-openid-test-client/) for more info.

Here is an annotated example:

```json
{
  // When Broker Microservice started its Initial Harvest
  "harvestStartTime": "2023-09-12T10:03:28.452Z",
  // The base URL of the Booking System's Open Booking API interface
  "bookingApiBaseUrl": "https://acme-fitness.org/api/booking",
  // Derived from the `headlessAuth` config property.
  "headlessAuth": true,
  /* The rest of the config comes straight from calling `OpenActiveTestAuthKeyManager`'s
  `config` property */
  "sellersConfig": {
    "primary": {
      // ...
    },
    "secondary": {
      // ...
    }
  },
  "bookingPartnersConfig": {
    // ...
  },
  "authenticationFailure": false,
  "dynamicRegistrationFailure": false,
}
```

#### `GET /dataset-site`

**Response Type**: 🤖 JSON

The [Dataset Site JSON](https://openactive.io/dataset-api-discovery/EditorsDraft/#embedded-json) that was loaded from the Dataset Site defined by the [`datasetSiteUrl` configuration property](#datasetsiteurl).

Some of the tests in [Integration Tests](../openactive-integration-tests/) use this in order to run checks against the Dataset Site JSON.

Here is an example:

```json
{
  "@context": [
    "https://schema.org/",
    "https://openactive.io/"
  ],
  "@type": "Dataset",
  "@id": "https://acme-fitness.org/api/",
  "url": "https://acme-fitness.org/api/",
  "name": "Acme Fitness",
  "accessService": {
    "@type": "WebAPI",
    "name": "Open Booking API",
    // ...etc
  },
  // ...
}
```

#### `DELETE /opportunity-cache`

**Response Type**: 🕳️ Empty

Deletes all of Broker Microservice's cached data about harvested [Opportunities](https://openactive.io/open-booking-api/EditorsDraft/#dfn-opportunity).

This is used by [Integration Tests](../openactive-integration-tests/) to reset Broker Microservice's cache in between runs of Test Suite in [Controlled mode](../openactive-integration-tests/README.md#userandomopportunities).
This is necessary as the [Booking System](#booking-system-under-test) deletes the entire Test Dataset in between runs of Test Suite in Controlled mode ([Test Interface docs](https://openactive.io/test-interface/#delete-test-interfacedatasetstestdatasetidentifier)).

#### `POST /opportunity-listeners/:id`

**Request params**:

* `id`: The ID of the [Child Opportunity](#orphans) to listen for.

**Response Type**: 🕳️ Empty

Create an [Opportunity Listener](#two-phase-listeners) to listen for updates to the specified Child Opportunity.

#### `GET /opportunity-listeners/:id`

**Request params**:

* `id`: The ID of the [Child Opportunity](#orphans) that is already being listened for.

**Response Type**: 🤖 JSON

Must be called after [`POST /opportunity-listeners/:id`](#post-opportunity-listenersid).

If and when the specified Child Opportunity is updated, this will return the updated Opportunity. This invokes the **Get** phase of the [Opportunity Listener](#two-phase-listeners).

Either this endpoint will:

* If an update was found:
    * return the updated Opportunity.
* If no update is found:
    * eventually timeout.

### `POST /order-listeners/:type/:bookingPartnerIdentifier/:uuid`

**Request params**:

* `type`: `orders` or `order-proposals`.
* `bookingPartnerIdentifier`: Identifier of the Booking Partner whose [Orders Feed](https://openactive.io/open-booking-api/EditorsDraft/#dfn-orders-feed) or OrderProposals Feed to listen to. This is the key of the Booking Partner in the [`bookingPartners` configuration property](#bookingpartners) e.g. `primary`.
* `uuid`: UUID of the Order or OrderProposal to listen for.

**Response Type**: 🤖 JSON

Create an [Order Listener](#two-phase-listeners) to listen for updates to the specified Order or Order Proposal.

The response contains info that may be useful to a user for debugging. Example:

```json
{
  // The page of the feed that Broker Microservice will start listening from.
  "startingFeedPage": "https://acme-fitness.org/api/booking/orders-rpde?afterChangeNumber=23504",
}
```

### `GET /order-listeners/:type/:bookingPartnerIdentifier/:uuid`

**Request params**:

* `type`: `orders` or `order-proposals`.
* `bookingPartnerIdentifier`: Identifier of the Booking Partner whose [Orders Feed](https://openactive.io/open-booking-api/EditorsDraft/#dfn-orders-feed) or OrderProposals Feed is being listened for. This is the key of the Booking Partner in the [`bookingPartners` configuration property](#bookingpartners) e.g. `primary`.
* `uuid`: UUID of the Order or OrderProposal that is being listened for.

**Response Type**: 🤖 JSON

Must be called after [`POST /order-listeners/:type/:bookingPartnerIdentifier/:uuid`](#post-order-listenerstypebookingpartneridentifieruuid).

If and when the specified Order or OrderProposal is updated, this will return its updated data. This invokes the **Get** phase of the [Order Listener](#two-phase-listeners).

Either this endpoint will:

* If an update was found:
    * return the updated Order or OrderProposal.
* If no update is found:
    * eventually timeout.

### `GET /is-order-uuid-present/:type/:bookingPartnerIdentifier/:uuid`

**Request params**:

* `type`: `orders` or `order-proposals`.
* `bookingPartnerIdentifier`: Identifier of the Booking Partner whose [Orders Feed](https://openactive.io/open-booking-api/EditorsDraft/#dfn-orders-feed) or OrderProposals Feed is being checked. This is the key of the Booking Partner in the [`bookingPartners` configuration property](#bookingpartners) e.g. `primary`.
* `uuid`: UUID of the Order or OrderProposal that is being checked.

**Response Type**: 🤖 JSON

Check whether or not the specified Order or OrderProposal is present in the [Booking System](#booking-system-under-test)'s feeds.

This endpoint will do one of the following:

1. If the Order or OrderProposal has been seen in the feeds already:
    * return `true`
2. If the Order or OrderProposal has not been seen in the feeds yet and the feeds have been fully harvested:
    * return `false`
3. If the Order or OrderProposal has not been seen in the feeds yet but the feeds have not been fully harvested yet:
    * wait until either of conditions #1 or #2 are met, then return the appropriate result.

### `GET /opportunity/:id`

**Request params**:

* `id`: The ID of the [Child Opportunity](#orphans).

**Request query params**:

* `useCacheIfAvailable` (OPTIONAL): If `true`, the Opportunity will be retrieved from Broker Microservice's [caches](#opportunity-id-cache) if available. If `false`, Broker Microservice will not look at its existing caches and will await an update to the Opportunity in the [Booking System](#booking-system-under-test)'s feeds. Defaults to `false`.
* `expectedCapacity` (OPTIONAL): If included, the Opportunity will only be returned if its capacity is equal to the specified value. Any updates which have a different value for capacity will be ignored. This is useful for [Integration Tests](../openactive-integration-tests/) tests which need to check that an Opportunity's capacity has been updated to a certain value e.g. it should go down after a successful booking.

**Response Type**: 🤖 JSON

Get the specified [Child Opportunity](#orphans) from either Broker Microservice's caches or from updates to the [Booking System](#booking-system-under-test)'s feeds that happen after this call is made.

This endpoint will do one of the following:

1. If the Opportunity is found:
    * return the Opportunity.
2. If the Opportunity is never found:
    * eventually timeout

### `POST /test-interface/datasets/:testDatasetIdentifier/opportunities`

**Request params**:

* `testDatasetIdentifier`: The identifier of the [Test Dataset](https://openactive.io/test-interface/#datasets-endpoints)

**Request body**: The shape of [Child Opportunity](#orphans) to fetch. This data has the same specification as the request body to [Test Interface](https://openactive.io/test-interface/)'s [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities) endpoint.

**Response type**: 🤖 JSON

This endpoint mirrors the [Test Interface](https://openactive.io/test-interface/)'s [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities) endpoint exactly. But, instead of creating a new Opportunity when called, it fetches an existing Opportunity from Broker Microservice's caches.

In this way, it can be used by [Integration Tests](../openactive-integration-tests/) when it is running in [Random mode](../openactive-integration-tests/README.md#userandomopportunities).

If an Opportunity matching the Opportunity Criteria, Seller and Opportunity Type from the request body is found, it will be returned. Otherwise, the response will be a 404.

Any Opportunity returned from this endpoint will be [locked](#opportunity-locks) and so will not be available for subsequent calls until locks are released.

### `DELETE /test-interface/datasets/:testDatasetIdentifier`

**Request params**:

* `testDatasetIdentifier`: The identifier of the [Test Dataset](https://openactive.io/test-interface/#datasets-endpoints)

**Response type**: 🕳️ Empty

This endpoint mirrors the [Test Interface](https://openactive.io/test-interface/)'s [`DELETE /test-interface/datasets/:testDatasetIdentifier`](https://openactive.io/test-interface/#delete-test-interfacedatasetstestdatasetidentifier) endpoint exactly. But, instead of deleting Opportunities, it releases all [Opportunity Locks](#opportunity-locks) created for the specified `testDatasetIdentifier`.

In this way, it can be used by [Integration Tests](../openactive-integration-tests/) when it is running in [Random mode](../openactive-integration-tests/README.md#userandomopportunities) to get ready for a new test run.

### `POST /assert-unmatched-criteria`

**Request body**: The shape of [Child Opportunity](#orphans) to check. This data has the same specification as the request body to [Test Interface](https://openactive.io/test-interface/)'s [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities) endpoint.

**Response type**: 🤖 JSON

Assert that an Opportunity matching the Opportunity Criteria, Seller and Opportunity Type from the request body is **not** found in the [Booking System](#booking-system-under-test)'s data. If such an Opportunity is found, the response will be a `404`. Otherwise, the response will be a `204`.

This is used by some [Non-Implemented tests](../openactive-integration-tests/README.md#structure) to ensure that a test feature MUST be implemented if a certain criteria of Opportunity is found in the Booking System's data. e.g. the [`cancellation-window` feature](../openactive-integration-tests/test/features/cancellation/cancellation-window) has a non-implemented test that asserts that there are no Opportunities with cancellation windows defined.

## Browser Automation for Auth Endpoints

Broker Microservice also exposes endpoints created from the `setupBrowserAutomationRoutes(..)` function from [openactive-openid-test-client](../openactive-openid-test-client/).
These endpoints are used by [Integration Tests](../openactive-integration-tests/) for tests which check the [OpenID Connect](https://openid.net/developers/how-connect-works/) authentication flow.

## Concepts

### Auth

Broker Microservice sets up and maintains auth credentials for access to the [Booking System](#booking-system-under-test).

[Integration Tests](../openactive-integration-tests/) can also obtain these credentials from [`GET /config`](#get-config) and use them to access the Booking System.

These credentials are set up according to the auth strategy defined in the [`bookingPartners` configuration property](#bookingpartners).

To do this, Broker Microservice uses the [openactive-openid-test-client](../openactive-openid-test-client/) library.

### Booking System under Test

An implementation of the [Open Booking API specification](https://openactive.io/open-booking-api/EditorsDraft/), which is being tested by [Integration Tests](../openactive-integration-tests/).

Broker Microservice connects to this Booking System in order to fetch metadata, harvest its Opportunity and Order RPDE feeds and acquire auth credentials. All of these then empower [Integration Tests](../openactive-integration-tests/) to run a suite of tests against this same Booking System.

### Data Model Validation

For a [Booking System](#booking-system-under-test) to be considered valid, all of the data in its Opportunity and Order RPDE feeds must conform to the specifications for [Opportunity Data](https://openactive.io/modelling-opportunity-data/) and the [Open Booking API](https://openactive.io/open-booking-api/EditorsDraft/).

Broker Microservice automatically runs validation on all of the data that it harvests from the Booking System's feeds, using the [Data Model Validator library](https://github.com/openactive/data-model-validator).

### Initial Harvest

Broker Microservice starts by performing an **Initial Harvest** of the [Booking System](#booking-system-under-test)'s RPDE feeds. It rapidly pages through all the feeds, caching the data that it finds into [Buckets](#buckets) until it reaches the last page of each feed.

When this Initial Harvest is complete, Broker Microservice's caches are up to date with all of the Booking System's data, and so it can be considered ready for various uses, including running [Integration Tests](../openactive-integration-tests/). A user can manually check whether or not the Initial Harvest is complete by calling the [Health Check endpoint](#get-health-check).

Broker Microservice will continue to poll the feeds after the Initial Harvest and harvest any new data that it finds. This is essential, as many [Integration Tests](../openactive-integration-tests/) require data to be created in the Booking System after the tests have started.

### Harvesting Status

Broker Microservice can have one of two **Harvesting Statuses**:

* `harvesting`: Broker Microservice is harvesting or polling the [Booking System](#booking-system-under-test)'s RPDE feeds, which means that it is either in its [Initial Harvest](#initial-harvest) phase or it is polling the feeds to keep up to date.
* `paused`: Broker Microservice is **not** harvesting or polling the [Booking System](#booking-system-under-test)'s RPDE feeds. This means that its data is not up to date with the Booking System's data, and so it is not available for use by [Integration Tests](../openactive-integration-tests/).

### Opportunity ID Cache

Broker Microservice keeps a cache of all the [Opportunities](https://openactive.io/open-booking-api/EditorsDraft/#dfn-opportunity) that it has harvested from the [Booking System](#booking-system-under-test)'s feeds.

This cache is stored in various structures. For the purposes of interfacing with Broker Microservice, the most important one to know about is **Buckets**:

#### Buckets

A **Bucket** is a cache of Opportunity IDs that match a given [Opportunity Criteria](../test-interface-criteria/README.md). During harvesting, each Opportunity found in the feeds is added to the buckets whose criteria it matches. When Integration Tests sends a request to get a random Opportunity matching a given criteria, the Opportunity is fetched from these buckets.

### Opportunity Locks

When running tests in [Random mode](../openactive-integration-tests/README.md#userandomopportunities), it is important that any Opportunity is only used in one test. This increases test coverage by ensuring that tests use a variety of different Opportunities and, crucially, it prevents unexpected behaviours when tests are run in parallel.

Broker Microservice uses **Opportunity Locks** to ensure that an Opportunity is only used in one test. When an Opportunity is retrieved in Random mode, using [`POST /test-interface/datasets/:testDatasetIdentifier/opportunities`](#post-test-interfacedatasetstestdatasetidentifieropportunities), it is **locked**. Subsequent calls to get a random Opportunity with the same critera will not return the same Opportunity, as it is locked.

In between runs of the tests in [Integration Tests](../openactive-integration-tests/), these locks are **released**, to ensure that all Opportunities are available for subsequent test runs.

These locks are contained within each [Test Dataset](https://openactive.io/test-interface/#datasets-endpoints), so that an Opportunity that is locked in one Test Dataset will be avaiable to another.

### Orphans

There is a parent-child relationship between some types of [Opportunity](https://openactive.io/open-booking-api/EditorsDraft/#dfn-opportunity) Feeds. Some examples:

* Parent: **FacilityUse** feed
    * Child: **Slot** feed or **IndividualFacilityUseSlot** feed
* Parent: **SessionSeries** feed
    * Child: **ScheduledSession** feed

An **Orphan** is an Opportunity from a child feed (e.g. a ScheduledSession) whose corresponding parent Opportunity (e.g. a SessionSeries) does not exist.

Broker Microservice keeps track of the number of Orphans that it has found. Before its [Initial Harvest](#initial-harvest), it may erroneously identify Orphans because it has not yet seen all the data from the parent feeds. However, after all feeds have been harvested, if there are still Orphans, this indicates that there may be a problem with the Booking System's data.

For more info about the different configurations of Opportunity feeds available, see [Types of RPDE feed](https://developer.openactive.io/publishing-data/data-feeds/types-of-feed).


### Two-Phase Listeners

A **Two-Phase Listener** can be created in Broker Miroservice to listen to updates to some object (e.g. [Opportunity](https://openactive.io/open-booking-api/EditorsDraft/#dfn-opportunity) or Order) in the [Booking System](#booking-system-under-test). These are used by [Integration Tests](../openactive-integration-tests/) to ensure that certain actions lead to updates to data e.g. cancellation should lead to the Order's cancelled OrderItems updating their status.

The two phases for these listeners are:

1. **Listen**: Start listening for the object. Any updates to the object prior to this point will be ignored.
2. **Get**: Get the update if there is one. If there isn't one, wait for one to arrive.

Types of Two-Phase Listeners in Broker Microservice:

* **Opportunity Listeners**: Listen for updates to a given [Child Opportunity](#orphans).
* **Order Listeners**: Listen for updates to a given Order.
