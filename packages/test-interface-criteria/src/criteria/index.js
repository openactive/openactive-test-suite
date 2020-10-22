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
const { TestOpportunityBookablePaidPrepaymentOptional } = require('./TestOpportunityBookablePaidPrepaymentOptional');
const { TestOpportunityBookableFreePrepaymentUnavailable } = require('./TestOpportunityBookableFreePrepaymentUnavailable');
const { TestOpportunityBookablePaidPrepaymentUnavailable } = require('./TestOpportunityBookablePaidPrepaymentUnavailable');
const { TestOpportunityBookablePaidPrepaymentRequired } = require('./TestOpportunityBookablePaidPrepaymentRequired');
const { TestOpportunityBookableFreePrepaymentUnspecified } = require('./TestOpportunityBookableFreePrepaymentUnspecified');
const { TestOpportunityBookablePaidPrepaymentUnspecified } = require('./TestOpportunityBookablePaidPrepaymentUnspecified');

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
    TestOpportunityBookablePaidPrepaymentOptional,
    TestOpportunityBookableFreePrepaymentUnavailable,
    TestOpportunityBookablePaidPrepaymentUnavailable,
    TestOpportunityBookablePaidPrepaymentRequired,
    TestOpportunityBookableFreePrepaymentUnspecified,
    TestOpportunityBookablePaidPrepaymentUnspecified,
  ],
};
