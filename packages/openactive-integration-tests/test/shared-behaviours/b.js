const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class B {
  constructor ({state, flow, logger}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
  }

  validationTests () {
    sharedValidationTests.shouldBeValidResponse(
      () => this.state.bResponse,
      "B",
      this.logger,
      {
        validationMode: "BResponse",
      },
    );
    return this;
  }

  beforeSetup () {
    beforeAll(async () => {
      await this.flow.B();
    });

    return this;
  }

  successChecks () {
    it("should return 200 on success", () => {
      this.expectSuccessful();

      expect(this.state.bResponse).to.have.status(200);
    });

    /*

    if (typeof this.price !== "undefined") {
      it("should have price of " + this.price, () => {
        this.expectSuccessful();

        expect(this.state.bResponse).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          this.price
        );
      });

      it("OrderQuote.totalPaymentDue equal to " + this.price, () => {
        this.expectSuccessful();

        expect(this.state.bResponse).
          to.
          have.
          json("totalPaymentDue.price", this.price);
      });
    }

    it("B Order or OrderQuote should have one orderedItem", () => {
      this.expectSuccessful();

      expect(this.state.bResponse).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    it("Result from B should OrderItemConfirmed orderItemStatus", () => {
      this.expectSuccessful();

      expect(this.state.bResponse).to.have.json(
        "orderedItem[0].orderItemStatus",
        "https://openactive.io/OrderItemConfirmed"
      );
    });

    */

    return this;
  }

  /**
   * Note: This creates an `it()` block.
   */
  itResponseReceived() {
    it('should return something', () => {
      this.expectResponseReceived();
    });
    return this;
  }

  expectSuccessful() {
    if (!this.state.BResponseSucceeded) throw new Error('Expected B request to be successful.');
  }

  expectResponseReceived() {
    if (!this.state.BResponseReceived) throw new Error('Expected B request to return a response');
  }
}

module.exports = {
  B
};
