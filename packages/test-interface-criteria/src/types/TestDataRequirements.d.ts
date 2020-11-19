/*
Alternative approach:

a generic system for each field like:

startDate: {
  type: 'DateRange',
  min: '..', max: '..'
},
validFrom: {
  type: 'DateRange', min, max,
  isRequired: false, // defaults to true
}
eventStatus: {
  type: 'Allowlist',
  mustBeOneOf: ['../EventCancelled'],
} | {
  type: 'Blocklist',
  mustBeNoneOf: ['../EventCancelled'],
}
 */



/**
 * Suffixes:
 * - -Min (T): Value must be greater or equal to this.
 * - -Max (T): Value must be less than or equal to this.
 * - -Allowlist (T[]): Value must be one of this list of options.
 * - -IsRequired (boolean): Value is or is not required.
 *   This is only needed when:
 *   - Set to false and combined with a requirement that implicitly requires a value
 *     e.g. `validFromMin=..` by itself means that `validFromBeforeStartDate` is required.
 *     But, `validFromMin=.., validFromIsRequired=false` means that it is not required but,
 *     if it is included, it must adhere to the other requirements.
 * - -Includes (T extends any[]): Value (which is a list) must include this value.
 * - -Excludes (T extends any[]): Value (which is a list) must exclude this value.
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
   * eventStatus must be one of these values
   */
  // eventStatusAllowlist?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[];
  eventStatusBlocklist?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[];
  // eventStatusOptions?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[];
  // ## Offer Requirements
  /**
   * Is `validFromBeforeStartDate` required to be included?
   */
  validFromIsRequired?: boolean;
  /**
   * ISO date string. Min value for `startDate - validFromBeforeStartDate`
   */
  validFromMin?: string;
  /**
   * ISO date string. Max value for `startDate - validFromBeforeStartDate`
   */
  validFromMax?: string;
  /**
   * availableChannel must include this value
   */
  availableChannelIncludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  /**
   * availableChannel must NOT include this value
   */
  availableChannelExcludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  /**
   * advanceBooking must NOT be one of these values
   */
  advanceBookingBlocklist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  // /**
  //  * Should availableChannel include https://openactive.io/OpenBookingPrepayment?
  //  * - If true, availableChannel MUST include OpenBookingPrepayment
  //  * - If false, availableChannel MUST NOT include OpenBookingPrepayment
  //  */
  // availableChannelIncludesOpenBookingPrepayment?: boolean;
};
