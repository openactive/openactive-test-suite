const { validate } = require('@openactive/data-model-validator');
const { criteriaMap, testMatch } = require('@openactive/test-interface-criteria');

const { HARVEST_START_TIME } = global;

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../helpers/logger').BaseLoggerType} BaseLoggerType
 */

function priorityOfSeverity(severity) {
  switch (severity) {
    case 'failure':
      return 1;
    case 'warning':
      return 2;
    case 'suggestion':
      return 3;
    default:
      return 4;
  }
}

/**
 * @typedef {'C1Response' | 'C2Response' | 'BResponse' | 'PResponse' | 'BookableRPDEFeed' | 'DatasetSite' | 'OrdersFeed' | 'OrderProposalsFeed'} ValidationMode
 */

/**
 * Use OpenActive validator to validate the response from a flow request (e.g. C2).
 *
 * Note: This creates a describe() and it() blocks in which the validation tests run.
 *
 * @param {() => ChakramResponse} getter Thunk which returns the HTTP response
 *   from calling the flow endpoint (e.g. C2)
 * @param {string} name Used to log the results and describe the test
 * @param {BaseLoggerType} logger
 * @param {object} options
 * @param {ValidationMode} options.validationMode
 *   What type of response is being validated. Some modes have special handling behaviours.
 * @param {string} [opportunityCriteria] If included, this will check that the opportunity
 *   matches the criteria.
 */
function shouldBeValidResponse(getter, name, logger, options, opportunityCriteria) {
  let results = null;

  const doCriteriaMatch = (criteriaName) => {
    const response = getter();

    if (!response) {
      throw new Error('No response to match against criteria');
    }

    const body = response.body.data;

    if (!criteriaMap.has(criteriaName)) {
      throw new Error(`Criteria '${criteriaName}' not supported by the @openactive/test-interface-criteria library`);
    }

    const { matchesCriteria, unmetCriteriaDetails } = testMatch(criteriaMap.get(criteriaName), body, { harvestStartTime: HARVEST_START_TIME });

    if (!matchesCriteria) {
      throw new Error(`Does not match criteria https://openactive.io/test-interface#${criteriaName}: ${unmetCriteriaDetails.join(', ')}`);
    }
  };

  const doValidate = async () => {
    if (results) return results;

    /**
     * @type {{
     *   loadRemoteJson: boolean,
     *   remoteJsonCachePath: string,
     *   remoteJsonCacheTimeToLive: number,
     *   validationMode?: string,
     * }} & typeof options
     */
    const optionsWithRemoteJson = Object.assign({
      loadRemoteJson: true,
      remoteJsonCachePath: './tmp',
      remoteJsonCacheTimeToLive: 3600,
    }, options);

    const response = getter();

    if (!response) {
      throw new Error('No response to validate');
    }

    let { body } = response;

    if (['OrdersFeed', 'OrderProposalsFeed', 'BookableRPDEFeed'].includes(options.validationMode)) {
      // If this is an deleted RPDE item, there's nothing to validate.
      if (body.state === 'deleted') {
        return [];
      }
      body = body.data;
    }

    const statusCode = response.response && response.response.statusCode;
    const statusMessage = response.response && response.response.statusMessage;

    // Note C1Response and C2Response are permitted to return 409 errors of type `OrderQuote`, instead of `OpenBookingError`
    if ((statusCode < 200 || statusCode >= 300) && !(statusCode === 409 && (options.validationMode === 'C1Response' || options.validationMode === 'C2Response'))) {
      optionsWithRemoteJson.validationMode = 'OpenBookingError';

      // little nicer error message for completely failed responses.
      if (!body) {
        return [
          {
            severity: 'failure',
            message: `Server returned an error ${statusCode} (${statusMessage}) with an empty body.`,
          },
        ];
      }
    }

    results = await validate(body, optionsWithRemoteJson);

    results = results.sort((a, b) => priorityOfSeverity(a.severity) - priorityOfSeverity(b.severity));

    return results;
  };

  describe(`validation of ${name}`, function () {
    it('passes validation checks', async function () {
      const results = await doValidate();

      logger.recordResponseValidations(name, results);

      const errors = results
        .filter(result => result.severity === 'failure')
        .map(result => `FAILURE: ${result.path}: ${result.message.split('\n')[0]}`);

      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    });

    if (opportunityCriteria) {
      it(`matches the criteria '${opportunityCriteria}' required for this test`, async function () {
        doCriteriaMatch(opportunityCriteria);
      });
    }
  });
}

module.exports = {
  shouldBeValidResponse,
};
