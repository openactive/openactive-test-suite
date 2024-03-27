/**
 * Merge and sort JSON-LD `@context` from multiple Opportunities.
 *
 * @param  {...import('../models/core').Opportunity} opportunities
 */
function getMergedJsonLdContext(...opportunities) {
  return sortJsonLdContextWithOpenActiveOnTop([...new Set(opportunities.flatMap((x) => x && x['@context']).filter((x) => x))]);
}

/**
 * Does this Opportunity have a reference to a Parent Opportunity? (i.e. is it a Child Opportunity?)
 *
 * @param {import('../models/core').Opportunity} data
 */
function jsonLdHasReferencedParent(data) {
  return typeof data?.superEvent === 'string' || typeof data?.facilityUse === 'string';
}
/**
 * Sort JSON-LD `@context` so that `https://openactive.io/` and
 * `https://schema.org/` are at the top, which is useful for consistency
 * and required by validator.
 *
 * @param {string[]} context
 */
function sortJsonLdContextWithOpenActiveOnTop(context) {
  const firstList = [];
  if (context.includes('https://openactive.io/')) firstList.push('https://openactive.io/');
  if (context.includes('https://schema.org/')) firstList.push('https://schema.org/');
  const remainingList = context.filter((x) => x !== 'https://openactive.io/' && x !== 'https://schema.org/');
  return firstList.concat(remainingList.sort());
}

module.exports = {
  getMergedJsonLdContext,
  jsonLdHasReferencedParent,
};
