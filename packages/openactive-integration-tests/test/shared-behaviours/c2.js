const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class C2 {
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
      () => this.state.c2Response,
      "C2",
      this.logger,
      {
        validationMode: "C2Response",
      },
    );
    return this;
  }

  beforeSetup () {
    beforeAll(async () => {
      await this.flow.C2();
    });

    return this;
  }

  successChecks () {
    it("should return 200 on success", () => {
      expect(this.state.c2Response).to.have.status(200);
    });

    if (typeof this.price !== "undefined") {
      it("offer should have price of " + this.price, () => {
        expect(this.state.c2Response).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          this.price
        );
      });
    }

    it("Order or OrderQuote should have one orderedItem", () => {
      expect(this.state.c2Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1
      });
    });

    return this;
  }
}

module.exports = {
  C2
};
