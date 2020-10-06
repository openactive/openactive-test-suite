const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { TestOpportunityBookableFree } = require('./TestOpportunityBookableFree');
const { TestOpportunityBookablePaid } = require('./TestOpportunityBookablePaid');
const { TestOpportunityBookableNoSpaces } = require('./TestOpportunityBookableNoSpaces');
const { TestOpportunityBookableFiveSpaces } = require('./TestOpportunityBookableFiveSpaces');
const { TestOpportunityBookableCancellable } = require('./TestOpportunityBookableCancellable');
const { TestOpportunityNotBookableViaAvailableChannel } = require('./TestOpportunityNotBookableViaAvailableChannel');
const { TestOpportunityBookableOutsideValidFromBeforeStartDate } = require('./TestOpportunityBookableOutsideValidFromBeforeStartDate');
const { TestOpportunityBookableFlowRequirementOnlyApproval } = require('./TestOpportunityBookableFlowRequirementOnlyApproval');

module.exports = {
  allCriteria: [
    TestOpportunityBookable,
    TestOpportunityBookableFree,
    TestOpportunityBookablePaid,
    TestOpportunityBookableNoSpaces,
    TestOpportunityBookableFiveSpaces,
    TestOpportunityBookableCancellable,
    TestOpportunityNotBookableViaAvailableChannel,
    TestOpportunityBookableOutsideValidFromBeforeStartDate,
    TestOpportunityBookableFlowRequirementOnlyApproval,
  ],
};
