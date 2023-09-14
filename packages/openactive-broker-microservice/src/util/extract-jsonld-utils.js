// TODO: Both of these functions can be replaced by function in the dataset-utils package

const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');
const { default: axios } = require('axios');
const { DATASET_DISTRIBUTION_OVERRIDE } = require('../broker-config');
const { log, logError } = require('./log');

function extractJSONLDfromHTML(url, html) {
  let jsonld = null;

  const handler = new Handler(
    (err, result) => {
      if (!err && typeof result === 'object') {
        const jsonldArray = result.jsonld;
        // Use the first JSON-LD block on the page
        if (Array.isArray(jsonldArray) && jsonldArray.length > 0) {
          [jsonld] = jsonldArray;
        }
      }
    },
    {
      url, // The HTML pages URL is used to resolve relative URLs. TODO: Remove this
    },
  );

  // Create a HTML parser with the handler.
  const parser = new Parser(handler, {
    decodeEntities: true,
  });
  parser.write(html);
  parser.done();

  return jsonld;
}

async function extractJSONLDfromDatasetSiteUrl(url) {
  if (DATASET_DISTRIBUTION_OVERRIDE.length > 0) {
    log('Simulating Dataset Site based on datasetDistributionOverride config setting...');
    return {
      distribution: DATASET_DISTRIBUTION_OVERRIDE,
    };
  }
  try {
    log(`Downloading Dataset Site JSON-LD from "${url}"...`);
    const response = await axios.get(url);

    const jsonld = extractJSONLDfromHTML(url, response.data);
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
  extractJSONLDfromHTML,
  extractJSONLDfromDatasetSiteUrl,
};
