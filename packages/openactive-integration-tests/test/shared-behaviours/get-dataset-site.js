const { expect } = require('chakram');
const RequestHelper = require('../helpers/request-helper');
const sharedValidationTests = require('./validation');

/**
 * @typedef {import('../helpers/logger').BaseLoggerType} BaseLoggerType
 */

class GetDatasetSite {
  /**
   * @param {object} args
   * @param {BaseLoggerType} args.logger
   */
  constructor({ logger }) {
    this.logger = logger;
    this.requestHelper = new RequestHelper(logger);
  }

  validationTests() {
    sharedValidationTests.shouldBeValidResponse(
      () => this.datasetSite,
      'Dataset Site',
      this.logger,
      {
        validationMode: 'DatasetSite',
      },
    );
    return this;
  }

  beforeSetup() {
    beforeAll(async () => {
      this.datasetSite = await this.requestHelper.getDatasetSite();
    });
    return this;
  }

  successChecks() {
    // The validator will not yet fail on an object of incorrect type in DatasetSite mode,
    // so check that the base type is correct
    it('should contain JSON-LD representing the Dataset', () => {
      expect(this.datasetSite).to.have.json(
        '@type',
        'Dataset',
      );
    });

    return this;
  }
}

module.exports = {
  GetDatasetSite,
};
