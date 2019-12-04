# openactive-broker-microservice

This Node.js microservice provides a service to harvest data and proxy calls to an Open Booking API

## How to run the generator outside of Visual Studio

1. `npm install`
2. `npm start`


## Design objectives

- Validate all input feeds using the validator

Input

Storage

- Table for each Class
- Accept all feeds and distribute objects accordingly across table structure
- Validate each fragment in place, with errors stored against the record itself
- Combined object feeds (high frequency) are constructed from tables
- Modified dates used for feeds in these tables are offset by twice the configurable poll frequency (which is must higher for internal test suites), to allow time for 

Output
- Set feeds for each type in a standard form, which could feed an indexed search such as ElasticSearch:
  - SessionSeries
  - FacilityUse
  - CourseInstance


- Store against each feed:
  - Current 

- Store against each of these feeds