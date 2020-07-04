# OpenActive Conformance Certificates

An OpenActive Conformance Certificate offers a mechanism by which implementing systems can prove their conformance to the OpenActive specifications.

## Example certificate

An example conformance certificate can be found here:
https://openactive.io/openactive-test-suite/example-output/controlled/certification/

Note that this example is frequently generated for the OpenActive .NET Reference Implementation as part of the CI of the OpenActive Test Suite itself.

## Obtaining a certificate

The OpenActive Test Suite can be configured to output a Conformance Certificate upon all tests passing.

This is best achieved as part of a continuous integration script that runs these tests of your UAT environment (or test environment, if you do not have a UAT environment).

A Conformance Certificate is issued to cover a subset of the features of the specifications that are implemented - which are configured in the test suite (link), and hence only guarantees a complete implementation of that subset.

Certificates are designed to be published frequently, to demonstrate continued conformance, especially as the test suite is improved to test for additional edge cases within the features selected.

To obtain a certificate, simply update test.json with following:

```json
  "generateConformanceCertificate": true,
  "conformanceCertificateId": "https://acmebooker.example.com/openactive/certificate",
```

The certificate ID is the URL where the certificate will be hosted (see below section), which must match in order for the certificate to be valid.

## Publishing your certificate

This certificate must be hosted somewhere publicly accessible, ideally under the same or subdomain as your dataset site.

Static file hosting such as GitHub pages or an Amazon S3 bucket are both recommended.

Your UAT continuous integration script should upload a fresh certificate upon each successful run of the OpenActive Test Suite.

Upload script examples are available for Amazon S3 (link to CI script line) and GitHub pages (link to CI script line).

Note that the certificate is named index.html by default to allow it to be referenced at a path such as https://acmebooker.example.com/openactive/certificate

The certificate should be linked from your dataset site, to make it easily accessible to integrators in both human and machine-readable forms.

## Certificate self-validation

When the certificate is opened in a browser, it sends its contents to https://conformance-certificate-validator.openactive.io/, which runs checks to ensure its integrity and that its test coverage matches that of the latest test suite for the features selected.

A valid certificate will look as follows:

An invalid certificate will display an error message as follows:

## Certificate external validation

External validation is available for integrating services interested in establishing the validity of a certificate.

Simply send a request as follows:

`https://conformance-certificate-validator.openactive.io/validate?url={url}&holder={holder}`

The parameters accepted are:
* `url` - The URL of the conformance certificate
* `holder` - The certified booking services name, which should be taken from bookingService.name (or otherwise publisher.name) within the dataset site - which ensures the certificate is only referenced from relevant system.

## Certificate composition

The certificate is composed of three key elements:
* A human readable HTML page
* An embedded machine-readable JSON-LD snippet
* An embedded zip file of evidence of the test suite results that were used to obtain this certificate, as is common practice. (link to OpenID Connect)

All three of these components must be coherent and match in order for the certificate to be valid.

The test suite results included as evidence are redacted to remove all domain names from URLs, to ensure the security of your UAT infrastructure.

The evidence zip file can be extracted from the HTML page using the "Download Evidence" button when opening the page in a browser.
