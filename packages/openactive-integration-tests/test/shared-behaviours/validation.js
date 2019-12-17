const assert = require("assert");
const { validate } = require("@openactive/data-model-validator");

function shouldBeValidResponse(getter, name, options = {}) {
  let results = null;
  let doValidate = async () => {
    if (results) return results;

    let value = getter();
    results = await validate(value, options);
    return results;
  };

  describe("validation of " + name, function() {
    it("passes validation checks", async function() {
      let results = await doValidate();

      let errors = results
        .filter(result => result.severity === "failure")
        .map(result => {
          return `${result.path}: ${result.message.split("\n")[0]}`;
        });

      let warnings = results
        .filter(result => result.severity === "warning")
        .map(result => {
          return `${result.path}: ${result.message.split("\n")[0]}`;
        });

      console.warn(warnings.join("\n"));

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }
    });
  });
}

module.exports = {
  shouldBeValidResponse
};
