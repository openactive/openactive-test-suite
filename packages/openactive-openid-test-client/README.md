# openactive-openid-test-client

This Node.js library provides an OpenID Connect test client. It caches tokens retrieved to allow them to be reused across tests, as well as providing endpoints that exercise a target OpenID Connect Server implementation according to the specific OpenID Connect profile defined within the Open Booking API.

## Usage
1. `npm install`
2. `npm start`

## Command-line usage
The test client can be run stand-alone, to aid debugging of an OpenID Connect implementation.

`npm start -- --help`
