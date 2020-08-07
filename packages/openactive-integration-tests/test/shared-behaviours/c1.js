const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class C1 {
  constructor ({state, flow, logger}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
  }

  validationTests () {
    sharedValidationTests.shouldBeValidResponse(
      () => this.state.c1Response,
      "C1",
      this.logger,
      {
        validationMode: "C1Response",
      },
    );
    return this;
  }

  /**
   * Note: Generates a beforeAll() block. Therefore, this must be run within a describe() block.
   */
  beforeSetup () {
    beforeAll(async () => {
      await this.flow.C1();
    });
    return this;
  }

  successChecks () {
    it("should return 200 on success", () => {
      this.expectSuccessful();

      expect(this.state.c1Response).to.have.status(200);
    });

    /*

    it("should return the type '" + this.eventType + "'", () => {
      this.expectSuccessful();

      expect(this.state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        this.eventType,
      );
    });

    if (typeof this.eventName !== "undefined") {
      it("should return have the correct event 'name' of '" + this.eventName + "'", () => {
        this.expectSuccessful();

        expect(this.state.c1Response).to.have.json(
          "orderedItem[0].orderedItem.superEvent.name",
          this.eventName,
        );
      });
    }

    if (typeof this.price !== "undefined") {
      it("offer should have price of " + this.price, () => {
        this.expectSuccessful();

        expect(this.state.c1Response).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          this.price,
        );
      });

      it("OrderQuote.totalPaymentDue equal to " + this.price, () => {
        this.expectSuccessful();

        expect(this.state.c1Response).
          to.
          have.
          json("totalPaymentDue.price", this.price);
      });
    }

    it("C1 Order or OrderQuote should have one orderedItem", () => {
      this.expectSuccessful();

      expect(this.state.c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1,
      });
    });
    */

    return this;
  }

  expectSuccessful() {
    if (!this.state.C1ResponseSucceeded) throw new Error('Expected C1 request to be successful');
  }

  expectResponseReceived() {
    if (!this.state.C1ResponseReceived) throw new Error('Expected C1 request to return a response');
  }
}

module.exports = {
  C1
};
