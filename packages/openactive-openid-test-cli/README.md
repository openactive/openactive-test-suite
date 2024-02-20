# openactive-openid-test-cli

This package forms part of the suite of [OpenID Connect](https://openid.net/developers/how-connect-works/) helper libraries and tools used within the Test Suite. The other packages are:

* [openactive-openid-browser-automation](../packages/openactive-openid-browser-automation/)
* [openactive-openid-client](../openactive-openid-client/)

OpenID Connect is one of the authentication and authorization strategies facilitated by the Open Booking API (spec: [OpenID Connect Booking Partner Authentication for Multiple Seller Systems](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems)).

This Node.js script connects to an OpenID Provider using [openactive-openid-client](../openactive-openid-client/) and [openactive-openid-test-cli](../openactive-openid-test-cli/) and so tests that the OpenID Provider is correctly configured.

## Command-line usage

The script is run via a command-line interface, to aid debugging of an OpenID Connect implementation.

1. `npm install`
2. `npm start -- --help`

## Developing

### TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

In order for these types to be used by other projects, they must be saved to [TypeScript Declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html). This is enabled by our tsconfig.json, which specifies that declaration files are to be generated and saved to `built-types/` (As an aside, the reason that the package's types must be saved to .d.ts files is due to TypeScript not automatically using JS defined types from libraries. There is a good reason for this and proposals to allow it to work at least for certain packages. See some of the discussion here: https://github.com/microsoft/TypeScript/issues/33136).

For this reason, TypeScript types should be generated after code changes to make sure that consumers of this library can use the new types. The openactive-test-suite project does this automatically in its pre-commit hook, which calls `npm run gen-types`

TypeScript-related scripts:

- `check-types`: This uses the `tsconfig.check.json` config, which does not emit any TS declaration files - all it does is check that there are no type errors. This is used for code tests.
- `gen-types`: This uses the `tsconfig.gen.json` config, which emits TS declaration files into `built-types/`.

  Additionally, it copies programmer-created `.d.ts` files from our source code (e.g. `src/types/Criteria.d.ts`) into `built-types/`. This is because our code references these types, so they must be in the `built-types/` directory so that the relative paths match (e.g. so that `import('../types/Criteria').Criteria` works).
