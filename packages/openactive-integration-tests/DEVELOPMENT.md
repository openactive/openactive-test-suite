# Development

## Stack
 - [Jest](https://jestjs.io/) - testing framework
 - [Chakram](http://dareid.github.io/chakram/) - a REST API testing framework, designed for Mocha (although differences are subtle enough to work for Jest also)
 
## Structure
 /[overall flow]/[situation]/[variation]-test.js
 
i.e. /book_cancel/success/free-test.js 

## Approach

The setup is a little unusual here. The test suites are flow orientated, this is to test a single flow from end to end and no other variations will be performed in this. The main goal is to execute this flow end to end, and then have many assertations about various aspects of the responses.

This would be rather wasteful to have it execute within each test, but there is also the risk that this may fail to fully run to the end (which prevents using a beforeAll here).

The approach that has been taken is utilising memoized promises to execute the necessary part of the flow, and if necessary everything before that.

i.e. 
```javascript
  const performC1 = pMemoize(async function performC1() {
    await performGetMatch();

    ({ c1Response, totalPaymentDue } = await testHelper.putOrderQuoteTemplate(
      uuid,
      {
        opportunityId,
        offerId,
        sellerId,
        uuid
      }
    ));
  });

  const performC2 = pMemoize(async function performC2() {
    await performC1();

    ({ c2Response, totalPaymentDue } = await testHelper.putOrderQuote(uuid, {
      opportunityId,
      offerId,
      sellerId,
      uuid
    }));
  });
```

These can then be utilised by individual tests as follows:

```javascript
  describe("C1", function() {
    beforeAll(async function() {
      await performC1();
    });

    it("should return 200 on success", async function() {
      expect(c1Response).to.have.status(200);
    });
  });

  describe("C2", function() {
    beforeAll(async function() {
      await performC2();
    });

    it("should return 200 on success", async function() {
      expect(c2Response).to.have.status(200);
    });
  });
```
