const { default: axios } = require('axios');
const { extractJSONLDfromHTML } = require('@openactive/dataset-utils');
const { DATASET_DISTRIBUTION_OVERRIDE } = require('../broker-config');
const { log, logError } = require('./log');

/**
 * Download the Dataset Site and extract the embedded JSON from it.
 *
 * @param {string} url
 */
async function extractJSONLDfromDatasetSiteUrl(url) {
  try {
    log(`Downloading Dataset Site JSON-LD from "${url}"...`);
    const response = await axios.get(url);
    const jsonld = extractJSONLDfromHTML(url, response.data);
    if (DATASET_DISTRIBUTION_OVERRIDE.length > 0) {
      log('Simulating Dataset Site based on datasetDistributionOverride config setting...');
      return {
        ...jsonld, 
        distribution: DATASET_DISTRIBUTION_OVERRIDE,
      };
    }

    return jsonld;
  } catch (error) {
    if (!error.response) {
      logError(`\nError while extracting JSON-LD from datasetSiteUrl "${url}"\n`);
      throw error;
    } else {
      throw new Error(`Error ${error.response.status} for datasetSiteUrl "${url}": ${error.message}. Response: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data}`);
    }
  }
}

module.exports = {
  extractJSONLDfromDatasetSiteUrl,
};
