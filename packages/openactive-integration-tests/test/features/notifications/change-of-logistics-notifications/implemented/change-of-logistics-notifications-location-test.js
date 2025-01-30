const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runChangeOfLogisticsTests } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'change-of-logistics-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'change-of-logistics-notifications-location',
  testName: 'Updating location information after B request.',
  testDescription: 'ChangeOfLogisticsLocationSimulateAction triggered after B request to update the `location` property of the Opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  testInterfaceActions: ['test:ChangeOfLogisticsLocationSimulateAction'],
}, runChangeOfLogisticsTests({
  actionType: 'test:ChangeOfLogisticsLocationSimulateAction',
}));
