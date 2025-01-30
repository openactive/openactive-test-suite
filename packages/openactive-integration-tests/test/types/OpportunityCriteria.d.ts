/**
 * For an OpportunityCriteria, the criteria for which Seller it should belong to.
 *
 * Values:
 * - primary: The seller identified as `primary` in sellers config
 * - secondary: The seller identified as `secondary` in sellers config
 * - taxGross: A seller which has taxMode set to "https://openactive.io/TaxGross"
 * - taxNet: A seller which has taxMode set to "https://openactive.io/TaxNet"
 */
export type SellerCriteria =
  | 'primary'
  | 'secondary'
  | 'taxGross'
  | 'taxNet';

/**
 * What kind of Booking Flow is being tested?
 *
 * For more info about how Test Suite tests both Booking Flows, see the section on "bookingFlowsInScope" in the
 * openactive-integration-tests README.md
 */
export type BookingFlow =
  | 'OpenBookingSimpleFlow'
  | 'OpenBookingApprovalFlow';

export interface OpportunityCriteria {
  opportunityType: string | null;
  /** Name of the type of OpportunityCriteria e.g. TestOpportunityBookableFree */
  opportunityCriteria: string;
  primary?: boolean;
  control?: boolean;
  opportunityReuseKey?: number;
  usedInOrderItems?: number;
  sellerCriteria?: SellerCriteria;
  bookingFlow: BookingFlow;
}

export type OpportunityType = 
"ScheduledSession" 
    |"FacilityUseSlot"
    |"IndividualFacilityUseSlot"
    |"CourseInstance"
    |"CourseInstanceSubEvent"
    |"HeadlineEvent"
    |"HeadlineEventSubEvent"
    |"Event"
    |"OnDemandEvent"
