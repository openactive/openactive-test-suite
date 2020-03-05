const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class C1 {
  constructor ({state, flow, logger, dataItem}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
    this.dataItem = dataItem;
  }

  get testEvent () {
    return this.dataItem.event;
  }

  get eventType () {
    return this.dataItem.randomEvent || this.dataItem.event["@type"]
  }

  get eventName () {
    return this.dataItem.name;
  }

  get price () {
    return this.dataItem.price;
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

  beforeSetup () {
    beforeAll(async () => {
      await this.flow.C1();
    });
    return this;
  }

  successChecks () {
    it("should return 200 on success", () => {
      this._expectSuccessful();

      expect(this.state.c1Response).to.have.status(200);
    });

    it("should return the type '" + this.eventType + "'", () => {
      this._expectSuccessful();

      expect(this.state.c1Response).to.have.json(
        "orderedItem[0].orderedItem.@type",
        this.eventType,
      );
    });

    if (typeof this.eventName !== "undefined") {
      it("should return have the correct event 'name' of '" + this.eventName + "'", () => {
        this._expectSuccessful();

        expect(this.state.c1Response).to.have.json(
          "orderedItem[0].orderedItem.superEvent.name",
          this.eventName,
        );
      });
    }

    if (typeof this.price !== "undefined") {
      it("offer should have price of " + this.price, () => {
        this._expectSuccessful();

        expect(this.state.c1Response).to.have.json(
          "orderedItem[0].acceptedOffer.price",
          this.price,
        );
      });

      it("OrderQuote.totalPaymentDue equal to " + this.price, () => {
        this._expectSuccessful();

        expect(this.state.c1Response).
          to.
          have.
          json("totalPaymentDue.price", this.price);
      });
    }

    it("C1 Order or OrderQuote should have one orderedItem", () => {
      this._expectSuccessful();

      expect(this.state.c1Response).to.have.schema("orderedItem", {
        minItems: 1,
        maxItems: 1,
      });
    });

    return this;
  }

  _expectSuccessful() {
    if (!this.state.C1ResponseSucceeded) throw new Error('Expected C1 request to be successful');
  }
}

module.exports = {
  C1
};
