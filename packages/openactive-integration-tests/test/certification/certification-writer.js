const mapping = require('../helpers/mapping');
const mkdirp = require('mkdirp');
const moment = require('moment');
const Handlebars = require("handlebars");
var JSZip = require("jszip");
const {promises: fs} = require("fs");
const { getConfigVarOrThrow } = require('../helpers/config-utils');

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = getConfigVarOrThrow('integrationTests', 'bookableOpportunityTypesInScope');
const IMPLEMENTED_FEATURES = getConfigVarOrThrow('integrationTests', 'implementedFeatures');
const OUTPUT_PATH = getConfigVarOrThrow('integrationTests', 'outputPath');

class CertificationWriter {

  constructor (loggers, generator, datasetJson, conformanceCertificateId) {
    this.opportunityTypesInScope = BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE;
    this.implementedFeatures = IMPLEMENTED_FEATURES;
    this.loggers = loggers;
    this.generator = generator;
    this.datasetJson = datasetJson;
    this.conformanceCertificateId = conformanceCertificateId;

    if (datasetJson) {
      // Find all URLs in the dataset site that might indicate the base URLs that are in use
      let referencedUrls = [
        datasetJson.url,
        datasetJson['@id'] || datasetJson.id,
        datasetJson.publisher && datasetJson.publisher.logo && datasetJson.publisher.logo.url,
        datasetJson.accessService && datasetJson.accessService.endpointURL
      ]
      .concat(Array.isArray(datasetJson.distribution) && datasetJson.distribution.flatMap( x => x.contentUrl))
      .filter(x => typeof x === 'string' && x !== '');

      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }

      // Reduced set of baseUrls
      this.baseUrlRegexes = Array.from(new Set(referencedUrls.map(url => (new URL(url)).origin)))
        // Include a negative lookahead to ensure that any instances of conformanceCertificateId are not redacted,
        // as conformanceCertificateId is used for validation
        .map(url => new RegExp(`(?!${escapeRegExp(conformanceCertificateId)})${escapeRegExp(url)}`, 'g'));
    }
  }


  get helpers () {
    return {
      "formatDate": function(dateString, options) {
        return moment(dateString).format("Do MMMM YYYY");
      },
      "featureUrl": function(id, options) {
        const identifier = id.substring(id.indexOf('#') + 1);
        return 'https://github.com/openactive/openactive-test-suite/blob/master/packages/openactive-integration-tests/test/features/README.md';
      },
    };
  }


  get awardedTo () {
    if (this.datasetJson) {
      return this.datasetJson.bookingService || this.datasetJson.publisher && {
        "@type": "Organization",
        "name": this.datasetJson.publisher.name,
        "url": this.datasetJson.publisher.url
      };
    } else {
      return {};
    }
  }

  get certificateJsonLd () {
    return {
      "@context": "https://openactive.io/",
      "@type": "ConformanceCertificate",
      "@id": this.conformanceCertificateId,
      "name": "OpenActive Conformance Certificate",
      "description": "This conformance certificate has been produced automatically from the OpenActive Test Suite.",
      "dateCreated": (new Date()).toISOString(),
      "validFor": "P3M",
      "featureImplemented": Object.keys(this.implementedFeatures).filter(x => this.implementedFeatures[x] === true).map(feature => (
        {
          "@type": "Concept",
          "@id": "https://openactive.io/specification-features#" + feature,
          "prefLabel": mapping.lookupIdentifier(feature),
          "inScheme": "https://openactive.io/specification-features"
        }
      )),
      "featureNotImplemented": Object.keys(this.implementedFeatures).filter(x => this.implementedFeatures[x] === false).map(feature => (
        {
          "@type": "Concept",
          "@id": "https://openactive.io/specification-features#" + feature,
          "prefLabel": mapping.lookupIdentifier(feature),
          "inScheme": "https://openactive.io/specification-features"
        }
      )),
      "opportunityTypeImplemented": Object.keys(this.opportunityTypesInScope).filter(x => this.opportunityTypesInScope[x]),
      "associatedMedia": {
        "@type": "MediaObject",
        "contentUrl": null
      },
      "awardedTo": this.awardedTo,
      "recognizedBy": {
        "@type": "Organization",
        "name": "OpenActive",
        "url": "https://www.openactive.io/"
      }
    };
  }

  get certificationOutputPath () {
    return `${OUTPUT_PATH}certification/index.html`;
  }

  async generateCertificate() {
    let encodedZipFile = await this.generateZip(this.loggers, this.generator);

    let data = Object.assign({}, this.certificateJsonLd);
    data.associatedMedia.contentUrl = encodedZipFile;
    data.json = JSON.stringify(data, null, 2);
    
    let template = await this.getTemplate('certification.html');

    let html = template(data, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
      helpers: this.helpers,
    });

    return html;
  }

  async readFileIntoZip(zip, zipPath, sourceFilePath) {
    let data = await fs.readFile(sourceFilePath, "utf8");
    // Redact references to the base URL
    this.baseUrlRegexes.forEach(urlRegex => {
      data = data.replace(urlRegex, 'https://origin-redacted')
    });
    zip.file(zipPath, data);
  }

  async generateZip(loggers, generator) {
    var evidenceFilePaths = [].concat(
      loggers.map(logger => ({ path: logger.metaPath, zipPath: 'json/' + logger.metaLocalPath })),
      loggers.map(logger => ({ path: logger.markdownPath, zipPath: 'markdown/' + logger.markdownLocalPath })),
      { path: generator.summaryMetaPath, zipPath: 'json/index.json' },
      { path: generator.reportMarkdownPath, zipPath: 'markdown/index.md' }
    );

    let zip = new JSZip();
    await Promise.all(
      evidenceFilePaths.map( ({path, zipPath}) => this.readFileIntoZip(zip, zipPath, path))
      );
    
    let base64 = await zip.generateAsync({type:"base64"});
    return `data:application/octet-stream;base64,${base64}`;
  }

  async getTemplate (name) {
    let file = await fs.readFile(
      __dirname + "/" + name + ".handlebars", "utf8");
    return Handlebars.compile(file);
  };
}

module.exports = {
  CertificationWriter
};
