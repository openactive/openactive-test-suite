const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { TestOpportunityBookableFree } = require('./TestOpportunityBookableFree');
const { TestOpportunityBookableNonFree } = require('./TestOpportunityBookableNonFree');
const { TestOpportunityBookableUsingPayment } = require('./TestOpportunityBookableUsingPayment');
const { TestOpportunityBookableNoSpaces } = require('./TestOpportunityBookableNoSpaces');
const { TestOpportunityBookableFiveSpaces } = require('./TestOpportunityBookableFiveSpaces');
const { TestOpportunityBookableWithinValidFromBeforeStartDate } = require('./TestOpportunityBookableWithinValidFromBeforeStartDate');
const { TestOpportunityBookableCancellable } = require('./TestOpportunityBookableCancellable');
const { TestOpportunitySellerOpenBookingNotAllowed } = require('./TestOpportunitySellerOpenBookingNotAllowed');
const { TestOpportunityBookableOutsideValidFromBeforeStartDate } = require('./TestOpportunityBookableOutsideValidFromBeforeStartDate');
const { TestOpportunityBookableFlowRequirementOnlyApproval } = require('./TestOpportunityBookableFlowRequirementOnlyApproval');
const { TestOpportunityBookableCancellableWithinWindow } = require('./TestOpportunityBookableCancellableWithinWindow');
const { TestOpportunityBookableCancellableOutsideWindow } = require('./TestOpportunityBookableCancellableOutsideWindow');
const { TestOpportunityBookableNotCancellable } = require('./TestOpportunityBookableNotCancellable');
const { TestOpportunityBookableNonFreeTaxNet } = require('./TestOpportunityBookableNonFreeTaxNet');
const { TestOpportunityBookableNonFreeTaxGross } = require('./TestOpportunityBookableNonFreeTaxGross');
const { TestOpportunityBookableNonFreePrepaymentOptional } = require('./TestOpportunityBookableNonFreePrepaymentOptional');
const { TestOpportunityBookableNonFreePrepaymentUnavailable } = require('./TestOpportunityBookableNonFreePrepaymentUnavailable');
const { TestOpportunityBookableNonFreePrepaymentRequired } = require('./TestOpportunityBookableNonFreePrepaymentRequired');
const { TestOpportunityBookableFreePrepaymentOptional } = require('./TestOpportunityBookableFreePrepaymentOptional');
const { TestOpportunityBookableFreePrepaymentRequired } = require('./TestOpportunityBookableFreePrepaymentRequired');
const { TestOpportunityBookableAttendeeDetails } = require('./TestOpportunityBookableAttendeeDetails');
const { TestOpportunityBookableAdditionalDetails } = require('./TestOpportunityBookableAdditionalDetails');
const { TestOpportunityBookableSellerTermsOfService } = require('./TestOpportunityBookableSellerTermsOfService');
const { TestOpportunityOnlineBookable } = require('./TestOpportunityOnlineBookable');
const { TestOpportunityOfflineBookable } = require('./TestOpportunityOfflineBookable');

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
    TestOpportunityBookableNotCancellable,
    TestOpportunitySellerOpenBookingNotAllowed,
    TestOpportunityBookableOutsideValidFromBeforeStartDate,
    TestOpportunityBookableFlowRequirementOnlyApproval,
    TestOpportunityBookableCancellableWithinWindow,
    TestOpportunityBookableCancellableOutsideWindow,
    TestOpportunityBookableNonFreeTaxNet,
    TestOpportunityBookableNonFreeTaxGross,
    TestOpportunityBookableNonFreePrepaymentOptional,
    TestOpportunityBookableNonFreePrepaymentUnavailable,
    TestOpportunityBookableNonFreePrepaymentRequired,
    TestOpportunityBookableFreePrepaymentOptional,
    TestOpportunityBookableFreePrepaymentRequired,
    TestOpportunityBookableAttendeeDetails,
    TestOpportunityBookableAdditionalDetails,
    TestOpportunityBookableSellerTermsOfService,
    TestOpportunityOnlineBookable,
    TestOpportunityOfflineBookable,
  ],
};
