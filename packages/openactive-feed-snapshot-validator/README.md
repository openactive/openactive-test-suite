# Feed Snapshot Validator

Feed Snapshot Validator takes two "Feed Snapshots" (a record of the state of a feed at a given time) which are taken at different times and compares them, looking for any errors in the RPDE implementation.

Examples of errors that Feed Snapshot Validator can find:

* An item is changed without increasing its `modified` timestamp or moving it to the front of the feed
* An existing item that wasn't set to `state=deleted` disappears from the feed
* A new item that wasn't in the feed before is added to a place earlier than the previous "last" position in the feed

## Usage

```sh
npm start <EARLIER SNAPSHOT DIRECTORY> <LATER SNAPSHOT DIRECTORY>
```

e.g.

```sh
npm start ../openactive-broker-microservice/feed_snapshots/https%3A%2F%2Freference-implementation.openactive.io%2Fopenactive/20221019_122804 ../openactive-broker-microservice/feed_snapshots/https%3A%2F%2Freference-implementation.openactive.io%2Fopenactive/20221020_173728
```

### Creating Snapshots

[Broker Microservice](../openactive-broker-microservice/) can be used to create feed snapshots

