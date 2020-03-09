const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class B {
  constructor ({state, flow, logger, dataItem}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.dataItem = dataItem;
  }

  get testEvent () {
    return this.dataItem.event;
  }

  get eventName () {
    return this.dataItem.name;
  }

  get price () {
    return this.dataItem.price;
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
      this._expectSuccessful();

      expect(this.state.bResponse).to.have.status(200);
    });

    if (typeof this.price !== "undefined") {
      it("should have price of " + this.price, () => {
        this._expectSuccessful();

        expect(this.state.bResponse).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          this.price
        );
      });

      it("OrderQuote.totalPaymentDue equal to " + this.price, () => {
        this._expectSuccessful();

        expect(this.state.bResponse).
          to.
          have.
          json("totalPaymentDue.price", this.price);
      });
    }

    it("B Order or OrderQuote should have one orderedItem", () => {
      this._expectSuccessful();

      expect(this.state.bResponse).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    it("Result from B should OrderItemConfirmed orderItemStatus", () => {
      this._expectSuccessful();

      expect(this.state.bResponse).to.have.json(
        "orderedItem[0].orderItemStatus",
        "https://openactive.io/OrderItemConfirmed"
      );
    });

    return this;
  }

  _expectSuccessful() {
    if (!this.state.BResponseSucceeded) throw new Error('Expected B request to be successful.');
  }
}

module.exports = {
  B
};
