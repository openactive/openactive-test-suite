// const chakram = require('chakram');
// const { FeatureHelper } = require('../../../../helpers/feature-helper');
// const { GetMatch, C1, C2, Common } = require('../../../../shared-behaviours');

// FeatureHelper.describeFeature(module, {
//   testCategory: 'core',
//   testFeature: 'common-error-conditions',
//   testFeatureImplemented: true,
//   testIdentifier: 'not-bookable',
//   testName: 'Expect an OpportunityOfferPairNotBookableError for an un-bookable Opportunity',
//   testDescription: 'Run C1, C2 and B for an opportunity that is not bookable, expecting an OpportunityOfferPairNotBookableError to be returned',
//   // The primary opportunity criteria to use for the primary OrderItem under test
//   testOpportunityCriteria: 'TestOpportunityNotBookableViaAvailableChannel',
//   // ensure that the error still occurs even if there is one valid opportunity in the request
//   controlOpportunityCriteria: 'TestOpportunityBookable',
// },
// (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
//   beforeAll(async function () {
//     await state.fetchOpportunities(orderItemCriteria);

//     return chakram.wait();
//   });

//   describe('Get Opportunity Feed Items', function () {
//     (new GetMatch({
//       state, flow, logger, orderItemCriteria,
//     }))
//       .beforeSetup()
//       .successChecks()
//       .validationTests();
//   });
// });
