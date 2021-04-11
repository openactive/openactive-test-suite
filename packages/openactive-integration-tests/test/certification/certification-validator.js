const fs = require('fs');
const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');
const JSZip = require('jszip');
const assert = require('assert');
const path = require('path');
const { Worker } = require('worker_threads');

const INDEX_TESTS_IMPLEMENTED_JSON_FILE = path.join(__dirname, '..', 'features', 'tests-implemented.json');

const TESTS_IMPLEMENTED_METADATA = JSON.parse(fs.readFileSync(INDEX_TESTS_IMPLEMENTED_JSON_FILE)).features;

/* (async function() {
  const certHtml = fs.readFileSync('./certification/certification.html');
  let result = await validateCertificateHtml(certHtml, 'https://example.com/opendata/conformance.html', 'Acme Org', true);
  console.log(result ? 'Validation passed' : 'Validation failed');
})(); */

async function validateCertificateHtml(certificateHtml, certificateUrl, holderName) {
  const certificateJson = extractJSONLDfromHTML(certificateHtml);

  return await validateCertificate(certificateJson, certificateUrl, holderName);

  function extractJSONLDfromHTML(html) {
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
        url: '', // The HTML pages URL is used to resolve relative URLs. TODO: Remove this
      },
    );

    // Create a HTML parser with the handler.
    const parser = new Parser(handler, { decodeEntities: true });
    parser.write(html);
    parser.done();

    return jsonld;
  }
}

async function validateCertificate(certificateJson, certificateUrl, holderName) {
  // Derive intended config from certificate
  const implementedFeatures = getFeatureConfig(certificateJson);
  const opportunityTypesInScope = getOpportunityTypesInScope(certificateJson);

  // Run stubbed test suite using this config, to simulate which tests would be run
  const scaffoldedSuites = await getScaffoldedSuites(implementedFeatures, opportunityTypesInScope);

  /*
  fs.writeFile('./test/certification/debug.json', JSON.stringify(Object.fromEntries(scaffoldedSuites), null, 2), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("FILE SAVED: ./test/certification/debug.json");
  }); */

  // Extract evidence files to inspect
  const evidenceJsonFiles = await extractCertificateEvidenceFilesFromJson(certificateJson);

  try {
    assertCertificateIntegrity(certificateJson, scaffoldedSuites, evidenceJsonFiles);
  } catch (err) {
    console.warn(`\n\nError generating conformance certificate:\n\n${err}\n\n`);
    return {
      valid: false,
    };
  }

  // Only error for public URLs
  if (certificateUrl.indexOf('//localhost') === -1 && certificateUrl.indexOf('file://') === -1 && certificateJson['@id'] != certificateUrl) {
    return {
      valid: false,
      message: `Certificate was valid, but was not exposed at the correct URL "${certificateJson['@id']}".`,
    };
  }

  if (holderName !== null && certificateJson.awardedTo.name != holderName) {
    return {
      valid: false,
      message: `Certificate was valid, but was not related to the correct organisation "${certificateJson.awardedTo.name}".`,
    };
  }

  return {
    valid: true,
    holder: certificateJson.awardedTo.name,
  };
}

function getFeatureConfig(certificateJson) {
  const featureIdentifier = feature => feature['@id'].substring(feature['@id'].indexOf('#') + 1);
  const featureConfig = {};
  (certificateJson.featureImplemented || []).forEach((feature) => {
    featureConfig[featureIdentifier(feature)] = true;
  });
  (certificateJson.featureNotImplemented || []).forEach((feature) => {
    featureConfig[featureIdentifier(feature)] = false;
  });
  return featureConfig;
}

function getOpportunityTypesInScope(certificateJson) {
  const opportunityTypeConfig = {};
  (certificateJson.opportunityTypeImplemented || []).forEach((opportunityType) => {
    opportunityTypeConfig[opportunityType] = true;
  });
  return opportunityTypeConfig;
}

function assertCertificateIntegrity(certificateJson, scaffoldedSuites, evidenceJsonFiles) {
  const indexJson = evidenceJsonFiles.get('index.json');

  // Check certificate ID integrity
  assert.strictEqual(certificateJson['@id'], indexJson.conformanceCertificateId);

  // Check awardedTo name integrity
  assert.strictEqual(certificateJson.awardedTo.name, bookingServiceName(indexJson.dataset));

  const implementedFeatures = getFeatureConfig(certificateJson);
  delete implementedFeatures['test-interface'];

  for (const [featureIdentifier, meta] of Object.entries(TESTS_IMPLEMENTED_METADATA)) {
    // Ignore the test interface from the comparison
    if (featureIdentifier === 'test-interface') continue;

    // Ensure that all features that have tests present are included in either a true or false state
    if (
      (meta.implementedTestFiles > 0 || meta.notImplementedTestFiles > 0)
      && !(implementedFeatures[featureIdentifier] === true || implementedFeatures[featureIdentifier] === false)
    ) {
      throw new Error(`The feature '${featureIdentifier}' is missing from the test suite configuration. All features must be included with either a true or false value to generate a valid conformance certificate.`);
    }
    // Remove all features that have no tests implemented from the comparison
    if (
      (implementedFeatures[featureIdentifier] === true && meta.implementedTestFiles === 0)
      || (implementedFeatures[featureIdentifier] === false && meta.notImplementedTestFiles === 0)
    ) {
      delete implementedFeatures[featureIdentifier];
    }
  }

  // Check list of implemented features match index.json
  assert.deepStrictEqual(indexJson.features.reduce(function (result, feature) {
    // Ignore test-interface feature
    if (feature.identifier === 'test-interface') return result;
    assert.ok(feature.identifier);
    if (result[feature.identifier] === undefined) {
      result[feature.identifier] = feature.implemented;
    } else {
      assert.strictEqual(result[feature.identifier], feature.implemented);
    }
    return result;
  }, {}), implementedFeatures);

  // Check list of implemented features match Zip contents
  assert.deepStrictEqual(Array.from(evidenceJsonFiles.entries()).reduce(function (result, [filename, contents]) {
    if (filename !== 'index.json') {
      assert.ok(contents.config, filename);
      // Ignore test-interface feature
      if (contents.config.testFeature === 'test-interface') return result;
      if (result[contents.config.testFeature] === undefined) {
        result[contents.config.testFeature] = contents.config.testFeatureImplemented;
      } else {
        assert.strictEqual(result[contents.config.testFeature], contents.config.testFeatureImplemented);
      }
    }
    return result;
  }, {}), implementedFeatures);

  // Check list of opportunityTypes index.json
  assert.deepStrictEqual(
    new Set(indexJson.features.map(x => x.opportunityTypeName).filter(x => x !== 'Generic' && x !== 'Multiple')),
    new Set(certificateJson.opportunityTypeImplemented),
  );

  // Check every test in the index file has passed
  assert.ok(indexJson.features.every(
    feature => feature.overallStatus === 'passed'
    || feature.tests.every(test => ['passed', 'warning'].includes(test.overallStatus)),
  ));

  // Check every referenced file in index (except for 'test-interface')
  const files = indexJson.features.filter(feature => feature.identifier !== 'test-interface').flatMap(feature => feature.tests.flatMap(test => test.metaLocalPath));

  // Check all files present are as expected in index.json
  assert.deepStrictEqual(new Set(files), new Set(scaffoldedSuites.keys()));

  // Check all files present are as expected in the Zip contents
  const evidenceFileList = new Set([...evidenceJsonFiles.keys()].filter(x => x.indexOf('test-interface') === -1 && x !== 'index.json'));
  assert.deepStrictEqual(new Set(files), evidenceFileList);

  files.forEach((file) => {
    const evidenceJson = evidenceJsonFiles.get(file);
    const scaffoldedJson = scaffoldedSuites.get(file);

    // Check every referenced file in index, has specs that match those that are expected
    assert.deepStrictEqual(evidenceJson.specs, scaffoldedJson);

    // Check every referenced file in index has spec log that matches, and that passed
    const logSpecs = new Map();
    evidenceJson.logs.filter(log => log.type === 'spec')
      .forEach((log) => {
        const suiteName = log.ancestorTitles.join(',');
        if (!logSpecs.has(suiteName)) logSpecs.set(suiteName, []);
        logSpecs.get(suiteName).push(log.title);
        assert.strictEqual(log.spec.status, 'passed', `${log.fullName} did not pass`);
      });
    assert.deepStrictEqual(Object.fromEntries(logSpecs), scaffoldedJson);
  });
}

async function extractCertificateEvidenceFilesFromJson(certificateJson) {
  // Extract certificate evidence
  const certEvidenceHref = certificateJson.associatedMedia.contentUrl;
  const certEvidenceBase64 = certEvidenceHref.substring(certEvidenceHref.indexOf(',') + 1);

  const zip = await JSZip.loadAsync(certEvidenceBase64, { base64: true });

  return new Map(
    await Promise.all(
      zip.file(/^json\//).map(
        async file => [file.name.substring('json/'.length), JSON.parse(await file.async('string'))],
      ),
    ),
  );
}

async function getScaffoldedSuites(implementedFeatures, opportunityTypesInScope) {
  const workerFile = path.join(__dirname, 'test-suite-scaffolder-worker.js');
  return new Promise((resolve, reject) => {
    // Note this runs in a worker as it manipulates the global object to run all tests using mocks, and determine which tests are run
    const worker = new Worker(workerFile, { workerData: { implementedFeatures, opportunityTypesInScope } });
    worker.on('message', (suiteRegistry) => { resolve(suiteRegistry); });
    worker.on('error', (err) => { reject(err); });
    worker.on('exit', () => { reject(new Error('Worker exited without calculating a response')); });
  });
}

function bookingServiceName(datasetJson) {
  return (datasetJson.bookingService && datasetJson.bookingService.name)
    || (datasetJson.publisher && datasetJson.publisher.name);
}

module.exports = {
  validateCertificateHtml,
  validateCertificate,
};
