// const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
// const { GetMatch, C1 } = require('../../../../shared-behaviours');
const { netTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-net',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-business-tax-calculation-net',
  testName: 'Tax calculations',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
  // the simple tests can only work if all OrderItems have the same tax mode
  controlOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
},
netTest({ c2ReqTemplateRef: 'businessCustomer', bReqTemplateRef: 'businessCustomer' }));
