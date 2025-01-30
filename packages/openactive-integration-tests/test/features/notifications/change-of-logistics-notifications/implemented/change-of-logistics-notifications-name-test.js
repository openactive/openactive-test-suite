const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runChangeOfLogisticsTests } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'change-of-logistics-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'change-of-logistics-notifications-name',
  testName: 'Updating name information after B request.',
  testDescription: 'ChangeOfLogisticsNameSimulateAction triggered after B request to update the `name` property of the Opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  testInterfaceActions: ['test:ChangeOfLogisticsNameSimulateAction'],
}, runChangeOfLogisticsTests({
  actionType: 'test:ChangeOfLogisticsNameSimulateAction',
}));
