const assert = require("assert");
const { validate } = require("@openactive/data-model-validator");
const { criteriaMap } = require("@openactive/test-interface-criteria");

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

function shouldBeValidResponse(getter, name, logger, options = {}, opportunityCriteria) {
  let results = null;

  let doCriteriaMatch = (criteriaName) => {
      let response = getter();
  
      if (!response) {
        throw new Error('No response to match against criteria');
      }
  
      let body = response.body.data;
  
      if (!criteriaMap.has(criteriaName)) {
        throw new Error(`Criteria '${criteriaName}' not supported by the @openactive/test-interface-criteria library`);
      }

      let { matchesCriteria, unmetCriteriaDetails } = criteriaMap.get(criteriaName).testMatch(body);
  
      if (!matchesCriteria) {
        throw new Error(`Does not match criteria https://openactive.io/test-interface#${criteriaName}: ${unmetCriteriaDetails.join(', ')}`);
      }
  }

  let doValidate = async () => {
    if (results) return results;

    /**
     * @type {{
     *   loadRemoteJson: boolean,
     *   remoteJsonCachePath: string,
     *   remoteJsonCacheTimeToLive: number,
     *   validationMode?: string,
     * }} & typeof options
     */
    let optionsWithRemoteJson = Object.assign({
      loadRemoteJson: true,
      remoteJsonCachePath: './tmp',
      remoteJsonCacheTimeToLive: 3600
    }, options);

    let response = getter();

    if (!response) {
      throw new Error('No response to validate');
    }

    let body = response.body;

    if (["OrdersFeed", "BookableRPDEFeed"].includes(options.validationMode)) {
      body = body.data;
    }

    let statusCode = response.response && response.response.statusCode;
    let statusMessage = response.response && response.response.statusMessage;

    // Note C1Response and C2Response are permitted to return 409 errors of type `OrderQuote`, instead of `OpenBookingError`
    if ((statusCode < 200 || statusCode >= 300) && !( statusCode == 409 && ( options.validationMode == "C1Response" || options.validationMode == "C2Response") ) ) {
      optionsWithRemoteJson.validationMode = "OpenBookingError";

      // little nicer error message for completely failed responses.
      if (!body) {
        return [
          {
            severity: "failure",
            message: `Server returned an error ${statusCode} (${statusMessage}) with an empty body.`
          }
        ];
      }
    }

    results = await validate(body, optionsWithRemoteJson);

    results = results.sort((a, b) => priorityOfSeverity(a.severity) - priorityOfSeverity(b.severity));

    return results;
  };

  describe("validation of " + name, function() {
    it("passes validation checks", async function() {
      let results = await doValidate();

      logger.recordResponseValidations(name, results);

      let errors = results
        .filter(result => result.severity === "failure")
        .map(result => {
          return `FAILURE: ${result.path}: ${result.message.split("\n")[0]}`;
        });

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    });

    if (opportunityCriteria) {
      it(`matches the criteria '${opportunityCriteria}' required for this test`, async function() {
        doCriteriaMatch(opportunityCriteria);
      });
    }
  });
}

module.exports = {
  shouldBeValidResponse
};
