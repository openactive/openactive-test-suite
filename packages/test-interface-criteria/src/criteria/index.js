const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { TestOpportunityBookableFree } = require('./TestOpportunityBookableFree');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');
const { TestOpportunityBookableUsingPayment } = require('./TestOpportunityBookableUsingPayment');
const { TestOpportunityBookableNoSpaces } = require('./TestOpportunityBookableNoSpaces');
const { TestOpportunityBookableFiveSpaces } = require('./TestOpportunityBookableFiveSpaces');
const { TestOpportunityBookableWithinValidFromBeforeStartDate } = require('./TestOpportunityBookableWithinValidFromBeforeStartDate');
const { TestOpportunityBookableCancellable } = require('./TestOpportunityBookableCancellable');
const { TestOpportunityNotBookableViaAvailableChannel } = require('./TestOpportunityNotBookableViaAvailableChannel');
const { TestOpportunityBookableOutsideValidFromBeforeStartDate } = require('./TestOpportunityBookableOutsideValidFromBeforeStartDate');
const { TestOpportunityBookableFlowRequirementOnlyApproval } = require('./TestOpportunityBookableFlowRequirementOnlyApproval');
const { TestOpportunityBookableNonFreePrepaymentOptional } = require('./TestOpportunityBookableNonFreePrepaymentOptional');
const { TestOpportunityBookableNonFreePrepaymentUnavailable } = require('./TestOpportunityBookableNonFreePrepaymentUnavailable');
const { TestOpportunityBookableNonFreePrepaymentRequired } = require('./TestOpportunityBookableNonFreePrepaymentRequired');
const { TestOpportunityBookableFreePrepaymentOptional } = require('./TestOpportunityBookableFreePrepaymentOptional');
const { TestOpportunityBookableFreePrepaymentRequired } = require('./TestOpportunityBookableFreePrepaymentRequired');
const { TestOpportunityBookableNonFreeTaxNet } = require('./TestOpportunityBookableNonFreeTaxNet');
const { TestOpportunityBookableNonFreeTaxGross } = require('./TestOpportunityBookableNonFreeTaxGross');

module.exports = {
  allCriteria: [
    TestOpportunityBookable,
    TestOpportunityBookableFree,
    TestOpportunityBookableNonFree,
    TestOpportunityBookableUsingPayment,
    TestOpportunityBookableNoSpaces,
    TestOpportunityBookableFiveSpaces,
    TestOpportunityBookableWithinValidFromBeforeStartDate,
    TestOpportunityBookableCancellable,
    TestOpportunityNotBookableViaAvailableChannel,
    TestOpportunityBookableOutsideValidFromBeforeStartDate,
    TestOpportunityBookableFlowRequirementOnlyApproval,
    TestOpportunityBookableNonFreePrepaymentOptional,
    TestOpportunityBookableNonFreePrepaymentUnavailable,
    TestOpportunityBookableNonFreePrepaymentRequired,
    TestOpportunityBookableFreePrepaymentOptional,
    TestOpportunityBookableFreePrepaymentRequired,
    TestOpportunityBookableNonFreeTaxNet,
    TestOpportunityBookableNonFreeTaxGross,
  ],
};
