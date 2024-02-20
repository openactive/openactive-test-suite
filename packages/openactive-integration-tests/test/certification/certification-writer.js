const moment = require('moment');
const Handlebars = require('handlebars');
const JSZip = require('jszip');
const { promises: fs } = require('fs');
const mapping = require('../helpers/mapping');
const { getConfigVarOrThrow } = require('../helpers/config-utils');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const BOOKING_FLOWS_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookingFlowsInScope');
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');
const CONFORMANCE_CERTIFICATE_PATH = getConfigVarOrThrow('integrationTests', 'conformanceCertificatePath');

class CertificationWriter {
  constructor(loggers, generator, datasetJson, conformanceCertificateId) {
    this.opportunityTypesInScope = BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE;
    this.bookingFlowsInScope = BOOKING_FLOWS_IN_SCOPE;
    this.implementedFeatures = IMPLEMENTED_FEATURES;
    this.loggers = loggers;
    this.generator = generator;
    this.datasetJson = datasetJson;
    this.conformanceCertificateId = conformanceCertificateId;

    if (datasetJson) {
      // Find all URLs in the dataset site that might indicate the base URLs that are in use
      const referencedUrls = [
        datasetJson.url,
        datasetJson['@id'] || datasetJson.id,
        datasetJson.publisher && datasetJson.publisher.logo && datasetJson.publisher.logo.url,
        datasetJson.accessService && datasetJson.accessService.endpointUrl,
      ]
        .concat(Array.isArray(datasetJson.distribution) && datasetJson.distribution.flatMap(x => x.contentUrl))
        .filter(x => typeof x === 'string' && x !== '');

      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }

      // Reduced set of baseUrls
      const origins = Array.from(new Set(referencedUrls.map(url => (new URL(url)).origin)));

      // Include a negative lookahead to ensure that any instances of conformanceCertificateId are not redacted,
      // as conformanceCertificateId is used for validation
      this.baseUrlRegexes = origins.map(url => new RegExp(`(?!${escapeRegExp(conformanceCertificateId)})${escapeRegExp(url)}`, 'g'));

      // Ensure that escaped versions of the URLs are also redacted
      this.escapedBaseUrlRegexes = origins.map(url => new RegExp(`${escapeRegExp(encodeURIComponent(url))}`, 'g'));
    }
  }

  get helpers() {
    return {
      formatDate(dateString, options) {
        return moment(dateString).format('Do MMMM YYYY');
      },
      featureUrl(id, options) {
        const identifier = id.substring(id.indexOf('#') + 1);
        return 'https://github.com/openactive/openactive-test-suite/blob/master/packages/openactive-integration-tests/test/features/README.md';
      },
    };
  }

  get awardedTo() {
    if (this.datasetJson) {
      return this.datasetJson.bookingService?.name ? {
        '@type': 'Organization',
        name: this.datasetJson.bookingService.name,
        url: this.datasetJson.bookingService.url,
        softwareVersion: this.datasetJson.bookingService.softwareVersion,
      } : (this.datasetJson.publisher && {
        '@type': 'Organization',
        name: this.datasetJson.publisher.name,
        url: this.datasetJson.publisher.url,
      });
    }
    return {};
  }

  get certificateJsonLd() {
    const features = Object.keys(this.implementedFeatures).filter(x => x !== 'test-interface');
    return {
      '@context': 'https://openactive.io/',
      '@type': 'ConformanceCertificate',
      '@id': this.conformanceCertificateId,
      name: 'OpenActive Conformance Certificate',
      description: 'This conformance certificate has been produced automatically from the OpenActive Test Suite.',
      dateCreated: (new Date()).toISOString(),
      validFor: 'P3M',
      featureImplemented: features.filter(x => this.implementedFeatures[x] === true).map(feature => (
        {
          '@type': 'Concept',
          '@id': `https://openactive.io/specification-features#${feature}`,
          prefLabel: mapping.lookupIdentifier(feature),
          inScheme: 'https://openactive.io/specification-features',
        }
      )),
      featureNotImplemented: features.filter(x => this.implementedFeatures[x] === false).map(feature => (
        {
          '@type': 'Concept',
          '@id': `https://openactive.io/specification-features#${feature}`,
          prefLabel: mapping.lookupIdentifier(feature),
          inScheme: 'https://openactive.io/specification-features',
        }
      )),
      opportunityTypeImplemented: Object.keys(this.opportunityTypesInScope).filter(x => this.opportunityTypesInScope[x]),
      bookingFlowsImplemented: Object.keys(this.bookingFlowsInScope).filter(x => this.bookingFlowsInScope[x]),
      associatedMedia: {
        '@type': 'MediaObject',
        contentUrl: null,
      },
      awardedTo: this.awardedTo,
      recognizedBy: {
        '@type': 'Organization',
        name: 'OpenActive',
        url: 'https://www.openactive.io/',
      },
    };
  }

  get certificationOutputPath() {
    return CONFORMANCE_CERTIFICATE_PATH;
  }

  async generateCertificate() {
    const encodedZipFile = await this.generateZip(this.loggers, this.generator);

    const data = { ...this.certificateJsonLd };
    data.associatedMedia.contentUrl = encodedZipFile;
    data.json = JSON.stringify(data, null, 2);

    const template = await this.getTemplate('certification.html');

    const html = template(data, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
      helpers: this.helpers,
    });

    return html;
  }

  async readFileIntoZip(zip, zipPath, sourceFilePath) {
    let data = await fs.readFile(sourceFilePath, 'utf8');
    // Redact references to the base URL
    this.baseUrlRegexes.forEach((urlRegex) => {
      data = data.replace(urlRegex, 'https://origin-redacted');
    });
    this.escapedBaseUrlRegexes.forEach((urlRegex) => {
      data = data.replace(urlRegex, encodeURIComponent('https://origin-redacted'));
    });
    zip.file(zipPath, data);
  }

  async generateZip(loggers, generator) {
    const evidenceFilePaths = [].concat(
      loggers.map(logger => ({ path: logger.metaPath, zipPath: `json/${logger.metaLocalPath}` })),
      loggers.map(logger => ({ path: logger.hmtlPath, zipPath: `html/${logger.htmlLocalPath}` })),
      { path: generator.summaryMetaPath, zipPath: 'json/index.json' },
      { path: generator.reportHtmlPath, zipPath: 'html/summary.html' },
    );

    const zip = new JSZip();
    await Promise.all(
      evidenceFilePaths.map(({ path, zipPath }) => this.readFileIntoZip(zip, zipPath, path)),
    );

    const base64 = await zip.generateAsync({
      type: 'base64',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9, // force compression at the maximum compression level
      },
    });
    return `data:application/octet-stream;base64,${base64}`;
  }

  async getTemplate(name) {
    const file = await fs.readFile(
      `${__dirname}/${name}.handlebars`, 'utf8',
    );
    return Handlebars.compile(file);
  }
}

module.exports = {
  CertificationWriter,
};
