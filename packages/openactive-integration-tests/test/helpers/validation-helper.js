const assert = require("assert");
const { validate: validateData } = require("@openactive/data-model-validator");

// we use a getter method as we aren't able to get the test scope from here
function validate(getter, name, options = {}) {
  let results = null;
  let doValidate = async () => {
    if (results) return results;

    let value = getter();
    results = await validateData(value, options);
    return results;
  };

  describe("validation of " + name, function() {
    it("passes validation checks", async function() {
      let results = await doValidate();

      results = results.filter(result => result.severity == "failure");

      results = results.map(result => {
        return `${result.path}: ${result.message.split("\n")[0]}`;
      });

      if (results.length === 0) return;

      throw new Error(results.join("\n"));
    });

    it("passes optional validation checks (warnings)", async function() {
      let results = await doValidate();

      results = results.filter(result => result.severity == "warning");

      results = results.map(result => {
        return `${result.path}: ${result.message.split("\n")[0]}`;
      });

      if (results.length === 0) return;

      this.skip();
      throw new Error(results.join("\n"));
    });
  });
}

module.exports = {
  validate
};
