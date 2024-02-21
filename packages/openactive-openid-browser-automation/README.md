# openactive-openid-browser-automation

This package forms part of the suite of [OpenID Connect](https://openid.net/developers/how-connect-works/) helper libraries and tools used within the Test Suite. The other packages are:

* [openactive-openid-client](../openactive-openid-client/)
* [openactive-openid-test-cli](../openactive-openid-test-cli/)

OpenID Connect is one of the authentication and authorization strategies facilitated by the Open Booking API (spec: [OpenID Connect Booking Partner Authentication for Multiple Seller Systems](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems)).

## What it does

This Node.js library automates the process of going to an authorization page on a booking system's OpenID Provider, filling in login details, navigating through the flow, and capturing screenshots along the way to track and report the process. It is used to exercise the booking system' OpenID Provider implementation according to the [spec](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems).

### `setupBrowserAutomationRoutes(expressApp, buttonSelectors)`

Sets up Browser Auth Automation.

It creates the following route on the provided express app:

#### `POST /browser-automation-for-auth`

Perform a complete [Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/) against the booking system's OpenID Provider using a headless browser.

It opens the OpenID Provider's login page and logs in using the provided username and password, then captures screenshots at various stages of the process, which can be used to debug any issues.

##### Request body (JSON)

Example:

```json
{
  "authorizationUrl": "https://auth.reference-implementation.openactive.io/connect/authorize?client_id=abc&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcb&response_type=code&scope=openid%20openactive-openbooking%20offline_access%20openactive-identity&...",
  "headless": true,
  "username": "acme-user-1",
  "password": "acme-password-1"
}
```

Fields:

- `authorizationUrl` (required): The URL to the OpenID Provider's authorization (login) page.

  This MUST include the necessary query params including the redirect_uri set to the `/cb` endpoint
- `headless` (optional): Whether to run the browser in headless mode. Defaults to `false`.
- `username` (required): The username to use to log in to the OpenID Provider.
- `password` (required): The password to use to log in to the OpenID Provider.

#### `buttonSelectors` param

`buttonSelectors` is an object of [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) which are used to find, in the booking system's OpenID Provider login page, the following HTML elements:

* Username text input
* Password text input
* Submit button

An example of `buttonSelectors` is:

```json
{
  "username": "[name='username' i]",
  "password": "[name='password' i]",
  "button": ".btn-primary"
}
```

These selectors would work for a login page whose HTML looks like:

```html
<input type="text" name="username" placeholder="Username" />
<input type="password" name="password" placeholder="Password" />
<input type="submit" class="btn-primary" value="Submit" />
```

## How to use it

1. Call `setupBrowserAutomationRoutes(expressApp, buttonSelectors)` to set up the `POST /browser-automation-for-auth` route as well as some other internal routes which enable the full Auth Code Flow.
    - This only needs to be called once
2. Make a `POST` request to `/browser-automation-for-auth` with the necessary data to perform an Auth Code Flow.
    - This can be called multiple times

## Redirect URI

The OAuth Redirect URI defaults to `http://localhost:3000/cb`, so make sure that your OpenID Connect Server is configured to allow this Redirect URI.

## Developing

### TypeScript

The code is written in native JS, but uses TypeScript to check for type errors. TypeScript uses JSDoc annotations to determine types (See: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)) from our native .js files.

In order for these types to be used by other projects, they must be saved to [TypeScript Declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html). This is enabled by our tsconfig.json, which specifies that declaration files are to be generated and saved to `built-types/` (As an aside, the reason that the package's types must be saved to .d.ts files is due to TypeScript not automatically using JS defined types from libraries. There is a good reason for this and proposals to allow it to work at least for certain packages. See some of the discussion here: https://github.com/microsoft/TypeScript/issues/33136).

For this reason, TypeScript types should be generated after code changes to make sure that consumers of this library can use the new types. The openactive-test-suite project does this automatically in its pre-commit hook, which calls `npm run gen-types`

TypeScript-related scripts:

- `check-types`: This uses the `tsconfig.check.json` config, which does not emit any TS declaration files - all it does is check that there are no type errors. This is used for code tests.
- `gen-types`: This uses the `tsconfig.gen.json` config, which emits TS declaration files into `built-types/`.

  Additionally, it copies programmer-created `.d.ts` files from our source code (e.g. `src/types/Criteria.d.ts`) into `built-types/`. This is because our code references these types, so they must be in the `built-types/` directory so that the relative paths match (e.g. so that `import('../types/Criteria').Criteria` works).

