/*!
 * test-interface-criteria
 * MIT Licensed
 */
const criteria = require("./criteria").criteria.map(x => new x());

function createCriteria() {
  const criteriaMap = new Map(criteria.map(i => [i.name, i]));

  const root = {
    criteria,
    criteriaMap
  };
  return root;
}

module.exports = createCriteria();