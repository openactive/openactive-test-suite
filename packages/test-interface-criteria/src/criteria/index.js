const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { TestOpportunityBookableFree } = require('./TestOpportunityBookableFree');
const { TestOpportunityBookablePaid } = require('./TestOpportunityBookablePaid');
const { TestOpportunityBookableNoSpaces } = require('./TestOpportunityBookableNoSpaces');
const { TestOpportunityBookableFiveSpaces } = require('./TestOpportunityBookableFiveSpaces');
const { TestOpportunityBookableWithinValidFromBeforeStartDate } = require('./TestOpportunityBookableWithinValidFromBeforeStartDate');
const { TestOpportunityBookableCancellable } = require('./TestOpportunityBookableCancellable');
const { TestOpportunityNotBookableViaAvailableChannel } = require('./TestOpportunityNotBookableViaAvailableChannel');
const { TestOpportunityBookableOutsideValidFromBeforeStartDate } = require('./TestOpportunityBookableOutsideValidFromBeforeStartDate');
const { TestOpportunityBookableFlowRequirementOnlyApproval } = require('./TestOpportunityBookableFlowRequirementOnlyApproval');
const { TestOpportunityBookableCancellableWithinWindow } = require('./TestOpportunityBookableCancellableWithinWindow');
const { TestOpportunityBookableCancellableOutsideWindow } = require('./TestOpportunityBookableCancellableOutsideWindow');

module.exports = {
  allCriteria: [
    TestOpportunityBookable,
    TestOpportunityBookableFree,
    TestOpportunityBookablePaid,
    TestOpportunityBookableNoSpaces,
    TestOpportunityBookableFiveSpaces,
    TestOpportunityBookableWithinValidFromBeforeStartDate,
    TestOpportunityBookableCancellable,
    TestOpportunityNotBookableViaAvailableChannel,
    TestOpportunityBookableOutsideValidFromBeforeStartDate,
    TestOpportunityBookableFlowRequirementOnlyApproval,
    TestOpportunityBookableCancellableWithinWindow,
    TestOpportunityBookableCancellableOutsideWindow,
  ],
};
