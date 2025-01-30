const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runChangeOfLogisticsTests } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'change-of-logistics-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'change-of-logistics-notifications-time',
  testName: 'Updating time information after B request.',
  testDescription: 'ChangeOfLogisticsTimeSimulateAction triggered after B request to update the time properties of the Opportunity (e.g. `startDate`).',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  testInterfaceActions: ['test:ChangeOfLogisticsTimeSimulateAction'],
}, runChangeOfLogisticsTests({
  actionType: 'test:ChangeOfLogisticsTimeSimulateAction',
}));
