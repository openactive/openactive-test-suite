const assert = require("assert");
const { validate } = require("@openactive/data-model-validator");

function shouldBeValidResponse(getter, name, logger, options = {}) {
  let results = null;
  let doValidate = async () => {
    if (results) return results;

    let optionsWithRemoteJson = Object.assign({
      loadRemoteJson: true,
      remoteJsonCachePath: '/tmp',
      remoteJsonCacheTimeToLive: 3600
    }, options);

    let value = getter();
    results = await validate(value, optionsWithRemoteJson);
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

      let warnings = results
        .filter(result => result.severity === "warning")
        .map(result => {
          return `WARNING: ${result.path}: ${result.message.split("\n")[0]}`;
        });

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    });
  });
}

module.exports = {
  shouldBeValidResponse
};
