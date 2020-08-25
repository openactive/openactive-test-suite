// const { FeatureHelper } = require('../../../../helpers/feature-helper');

// FeatureHelper.describeFeature(module, {
//   testCategory: 'core',
//   testFeature: 'common-error-conditions',
//   testFeatureImplemented: true,
//   testIdentifier: 'unknown-opportunity',
//   testName: 'Expect an UnknownOpportunityDetailsError for an non-existent Opportunity',
//   testDescription: 'Runs C1, C2 and B for an non-existent opportunity (with fictional identifiers), expecting an UnknownOpportunityDetailsError error to be returned',
//   testOpportunityCriteria: '_TestOpportunityDoesNotExist',
//   // The secondary opportunity criteria to use for multiple OrderItem tests
//   controlOpportunityCriteria: 'TestOpportunityBookable',
// },
// (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
//   // Steps I want it to take:
//   // 1. Construct some made-up opportunity identifiers
//   // 2. If in a multiple items test, get a `controlOpportunityCriteria` item
//   // 3. Construct a C1 request with the non-existent and, for multiple items tests, existing opp idents
//   // 4. And do the same for C2, B
//   //
//   // A new internal criteria would be ideal for this because it would allow single/multipe tests to work together seamlessly
// });
