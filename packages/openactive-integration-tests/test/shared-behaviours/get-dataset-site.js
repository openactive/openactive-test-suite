const {expect} = require("chakram");
const sharedValidationTests = require("./validation");

class GetDatasetSite {
  constructor ({state, flow, logger}) {
    this.state = state;
    this.flow = flow;
    this.logger = logger;
  }

  validationTests () {
    sharedValidationTests.shouldBeValidResponse(
      () => this.state.datasetSite,
      "Dataset Site",
      this.logger,
      {
        validationMode: "DatasetSite",
      },
    );
    return this;
  }

  beforeSetup () {
    beforeAll(async () => {
      await this.flow.getDatasetSite();
    });
    return this;
  }

  successChecks () {
    // The validator will not yet fail on an object of incorrect type in DatasetSite mode,
    // so check that the base type is correct
    it("should contain JSON-LD representing the Dataset", () => {
      expect(this.state.datasetSite).to.have.json(
        "@type",
        "Dataset",
      );
    });

    return this;
  }
}

module.exports = {
  GetDatasetSite
};
