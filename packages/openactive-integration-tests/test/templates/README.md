# Request Templates

When running tests, the requests that are actually made to the Booking System endpoints C1, C2, B, etc. are generated from the Request Templates in this folder.

The Request Templates are therefore an important part of the definition of a test, as they determine what kind of response is expected from the Booking System e.g. an error response will be expected if the request is purposefully erroneous.

Each Request Template is just a function which takes some input and returns the request JSON to use for the Booking System endpoint.

## Usage

Most [Flow Stages](../helpers/flow-stages/README.md) take a `templateRef` parameter, which is the [Template Ref](#setup-template-refs) used to select the Request Template to use for the API call made by that Flow Stage.

In this example, the C2 Flow Stage is being configured to use the C2 Request Template with ref `standard`:

```js
const c2 = new C2FlowStage({
  templateRef: 'standard',
```

## Structure

Each module in this folder (e.g. `./c2-req.js`) defines the collectino of Request Templates for a particular Booking System endpoint (e.g. C2). Each of these modules is split into three parts:

### Template Data Definition

Defines the type of data that is used as an input to the templates. e.g. `sellerId` is part of the Template Data Definition for C2, as it is needed to generate the request JSON. Example:

```js
/**
 * @typedef {{
 *   sellerId: string,
 *   ...
 * }} C2ReqTemplateData
 */
```

### Request Templates

Collection of Request Template functions, each of which takes input shaped by the Template Data Definition and returns the request JSON. Example:

```js
/**
 * @param {C2ReqTemplateData} data
 */
function createStandardC2Req(data) {
  return {
    '@context': 'https://openactive.io/',
    '@type': 'OrderQuote',
    brokerRole: data.brokerRole || 'https://openactive.io/AgentBroker',
```

### Setup Template Refs

Each Request Template is given a reference, which is used to select the template to use when running a test.

In this example, the `createStandardC2Req` Request Template is given the reference `standard`:

```js
const c2ReqTemplates = {
  standard: createStandardC2Req,
  ...
};

/**
 * @typedef {keyof typeof c2ReqTemplates} C2ReqTemplateRef Reference to a particular C2 Request template
 */
```

This can then be referred to later. In this example, the C2 [Flow Stage](../helpers/flow-stages/README.md) is being configured to use the C2 Request Template with ref `standard`:

```js
const c2 = new C2FlowStage({
  templateRef: 'standard',
```
