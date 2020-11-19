/*
Alternative approach:

a generic system for each field like:

startDate: {
  type: 'DateRange',
  min: '..', max: '..'
},
validFrom: {
  type: 'DateRange', min, max,
  allowNull?: true,
}
eventStatus: {
  type: 'Allowlist',
  mustBeOneOf: ['../EventCancelled'],
} | {
  type: 'Blocklist',
  mustBeNoneOf: ['../EventCancelled'],
}
 */



//  * - -IsRequired (boolean): Value is or is not required.
/**
 * Suffixes:
 * - -Min (T): Value must be greater or equal to this.
 * - -Max (T): Value must be less than or equal to this.
 * - -Allowlist (T[]): Value must be one of this list of options.
 * - -AllowNull (true): Value may be null (or undefined or property excluded).
 *   This is only needed when:
 *   - Set to false and combined with a requirement that implicitly requires a value
 *     e.g. `validFromMin=..` by itself means that `validFromBeforeStartDate` is required.
 *     But, `validFromMin=.., validFromIsRequired=false` means that it is not required but,
 *     if it is included, it must adhere to the other requirements.
 * - -Includes (T extends any[]): Value (which is a list) must include this value.
 * - -Excludes (T extends any[]): Value (which is a list) must exclude this value.
 * - -ExcludesAll (T extends any[]): Value (which is a list) must exclude all of these values.
 * - -Exists (boolean): Value must or must not exist. (here, "exists" is taken to mean that the
 *   property is included in an object and is not nullish).
 */
export type TestDataRequirements = {
  // ## Opportunity Requirements
  /** ISO date string */
  startDateMin?: string;
  /** ISO date string */
  startDateMax?: string;
  durationMin?: string;
  durationMax?: string;
  /**
   * "remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
   * or remainingUses (facilities)
   */
  remainingCapacityMin?: number;
  /**
   * "remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
   * or remainingUses (facilities)
   */
  remainingCapacityMax?: number;
  /**
   * eventStatus must NOT be one of these values
   */
  eventStatusBlocklist?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[];
  taxModeAllowlist?: ('https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet')[];
  // ## Offer Requirements
  // These price allow/blocklists allow specifying free or non-free offers.
  priceAllowlist?: [0];
  priceBlocklist?: [0];
  prepaymentAllowlist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  prepaymentBlocklist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  prepaymentAllowNull?: true;
  /**
   * Is `validFromBeforeStartDate` required to be included?
   */
  validFromAllowNull?: true;
  /**
   * ISO date string. Min value for `startDate - validFromBeforeStartDate`
   */
  validFromMin?: string;
  /**
   * ISO date string. Max value for `startDate - validFromBeforeStartDate`
   */
  validFromMax?: string;
  availableChannelIncludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  availableChannelExcludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  advanceBookingBlocklist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  openBookingFlowRequirementIncludes?: 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';
  openBookingFlowRequirementExcludes?: 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';
  openBookingFlowRequirementExcludesAll?: ('https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange')[];
  latestCancellationBeforeStartDateExists?: boolean;
};
