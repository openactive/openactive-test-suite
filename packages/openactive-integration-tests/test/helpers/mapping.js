// Human-readable category names are configured here
const names = {
  "core": "Core",
  "payment": "Payment",
  "restrictions": "Restrictions",
  "cancellation": "Cancellation",
  "leasing": "Leasing",
  "details-capture": "Details Capture",
  "access": "Access",
  "broker-role": "Broker Role",
  "tax": "Tax",
  "advanced-payment": "Advanced Payment",
  "notifications": "Notifications",
  "terms": "Terms",
  "authentication": "Authentication",
}

const identifiers = {};

const fg = require('fast-glob');
var rootDirectory = require("path").join(__dirname, "../../");

// Load feature.json files
var featureMetadata = fg.sync('**/test/features/**/feature.json', { cwd: rootDirectory }).map(file => require(`${rootDirectory}${file}`));

featureMetadata.forEach(f => {
  names[`${f.category}|${f.identifier}`] = f.name;
  identifiers[f.identifier] = f.name;
});

function lookup(name) {
  let val = names[name];
  if (val) return val;

  return `!!!${name}!!!`
}

function lookupIdentifier(identifier) {
  return identifiers[identifier];
}

module.exports = {
  lookup,
  lookupIdentifier
}
