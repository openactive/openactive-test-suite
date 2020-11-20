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
  type: 'OptionRequirements',
  mustBeOneOf: ['../EventCancelled'],
} | {
  type: 'Blocklist',
  mustBeNoneOf: ['../EventCancelled'],
}
 */

export type EventStatusType = 'https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled';
export type TaxMode = 'https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet';
export type RequiredStatusType = 'https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable';
export type AvailableChannelType = 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
export type OpenBookingFlowRequirement = 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';

export interface DateRange {
  '@type': 'test:DateRange';
  /** ISO date string */
  minRange?: string;
  /** ISO date string */
  maxRange?: string;
  /** If true (default is false), the value can alternatively be null or undefined */
  allowNull?: true;
}

export interface QuantitativeValue {
  '@type': 'QuantitativeValue';
  minValue?: number;
  maxValue?: number;
}

/**
 * A reference to a schema.org or OpenActive type, prefixed
 * e.g. oa:RequiredStatusType or schema:EventStatusType
 */
export type ValueType = 
  | 'oa:AvailableChannelType'
  | 'oa:OpenBookingFlowRequirement'
  | 'oa:RequiredStatusType'
  | 'oa:TaxMode'
  | 'oa:Terms'
  | 'schema:EventStatusType';

export interface OptionRequirements<
  /** TypeScript union of the types that this option can take */
  TOptionType,
  TValueType extends ValueType
> {
  '@type': 'test:OptionRequirements';
  valueType: TValueType;
  /**
   * If included, value must be one of the items in this list.
   *
   * NOTE: This also means that some value for this option is required UNLESS
   * `allowNull` is set to `true`.
   */
  allowlist?: TOptionType[];
  /**
   * If included, value must NOT be one of the items in this list.
   */
  blocklist?: TOptionType[];
  /**
   * This field only has meaning when provided in conjunction with `allowlist`.
   * If true (default is false), the value can alternatively be null or undefined
   */
  allowNull?: true;
}

// /**
//  * Value must be one of the items in `mustBeOneOf`
//  */
// export interface Allowlist<
//   TMustBeOneOf extends any[],
//   TValueType extends ValueType,
// > {
//   '@type': 'test:Allowlist';
//   mustBeOneOf: TMustBeOneOf;
//   /**
//    * Type of item in the array. A reference to a schema.org or OpenActive type, prefixed
//    * e.g. oa:RequiredStatusType or schema:EventStatusType
//    */
//   valueType: TValueType;
//   /** If true (default is false), the value can alternatively be null or undefined */
//   allowNull?: true;
// }

// /**
//  * Value must not be one of the items in `mustNotBeOneOf`
//  */
// export interface Blocklist<
//   TMustNotBeOneOf extends any[],
//   TValueType extends ValueType,
// > {
//   '@type': 'test:Blocklist';
//   mustNotBeOneOf: TMustNotBeOneOf;
//   /**
//    * Type of item in the array. A reference to a schema.org or OpenActive type, prefixed
//    * e.g. oa:RequiredStatusType or schema:EventStatusType
//    */
//   valueType: TValueType;
// }

export interface ArrayRequirements<
  TArrayOf,
  TValueType extends ValueType
> {
  '@type': 'test:ArrayRequirements';
  /** Value must include all items from this array */
  includesAll?: TArrayOf[];
  /** Value must exclude all items from this array */
  excludesAll?: TArrayOf[];
  /** Array must have at least this many items */
  minLength?: number;
  /**
   * Type of item in the array. A reference to a schema.org or OpenActive type, prefixed
   * e.g. oa:RequiredStatusType or schema:EventStatusType
   */
  valueType: TValueType;
}

/**
 * This value cannot be present. It must be null or undefined.
 */
export interface BlockedField {
  '@type': 'test:BlockedField';
}

// /**
//  * Suffixes:
//  * - -Min (T): Value must be greater or equal to this.
//  * - -Max (T): Value must be less than or equal to this.
//  * - -Allowlist (T[]): Value must be one of this list of options.
//  * - -AllowNull (true): Value may be null (or undefined or property excluded).
//  *   This is only needed when:
//  *   - Set to false and combined with a requirement that implicitly requires a value
//  *     e.g. `validFromMin=..` by itself means that `validFromBeforeStartDate` is required.
//  *     But, `validFromMin=.., validFromIsRequired=false` means that it is not required but,
//  *     if it is included, it must adhere to the other requirements.
//  * - -Includes (T extends any[]): Value (which is an array) must include this value.
//  * - -Excludes (T extends any[]): Value (which is an array) must exclude this value.
//  * - -ExcludesAll (T extends any[]): Value (which is an array) must exclude all of these values.
//  * - -Exists (boolean): Value must or must not exist. (here, "exists" is taken to mean that the
//  *   property is included in an object and is not nullish).
//  * - -ArrayMinLength (number): Value (which is an array) must have at least this many items
//  */
/**
 * For a particular criteria, test data requirements that must be met by an opportunity
 * and offer so that they meet the criteria.
 * e.g. the free criteria has the data requirement that price must be 0
 */
export interface TestDataRequirements {
  'test:testOpportunityDataRequirements'?: {
    '@type': 'test:OpportunityTestDataRequirements';
    'test:startDate'?: DateRange;
    /**
     * "remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
     * or remainingUses (facilities)
     */
    'test:remainingCapacity'?: QuantitativeValue;
    'test:eventStatus'?: OptionRequirements<EventStatusType, 'schema:EventStatusType'>;
    'test:taxMode'?: OptionRequirements<TaxMode, 'oa:TaxMode'>;
  };
  'test:testOfferDataRequirements'?: {
    '@type': 'test:OfferTestDataRequirements';
    'test:price'?: QuantitativeValue;
    'test:prepayment'?: OptionRequirements<RequiredStatusType,'oa:RequiredStatusType'>;
    /**
     * Refers to the date calculated as `startDate - validFromBeforeStartDate`.
     * For this particular DateRange, `allowNull` refers to whether `validFromBeforeStartDate`
     * can be null.
     */
    'test:validFrom'?: DateRange;
    'test:availableChannel'?: ArrayRequirements<AvailableChannelType, 'oa:AvailableChannelType'>;
    'test:advanceBooking'?: OptionRequirements<RequiredStatusType, 'oa:RequiredStatusType'>;
    'test:openBookingFlowRequirement'?: ArrayRequirements<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>;
    'test:latestCancellationBeforeStartDate'?: BlockedField;
    // note that the type isn't specified yet (it's a '@type': 'Terms' object) as
    // we don't use includes/excludes rules for this field, so it's irrelevant.
    'test:termsOfService'?: ArrayRequirements<unknown, 'oa:Terms'>;
  };
};

  // // ## Opportunity Requirements
  // /** ISO date string */
  // startDateMin?: string;
  // /** ISO date string */
  // startDateMax?: string;
  // // durationMin?: string;
  // // durationMax?: string;
  // /**
  //  * "remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
  //  * or remainingUses (facilities)
  //  */
  // remainingCapacityMin?: number;
  // /**
  //  * "remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
  //  * or remainingUses (facilities)
  //  */
  // remainingCapacityMax?: number;
  // /**
  //  * eventStatus must NOT be one of these values
  //  */
  // eventStatusBlocklist?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[];
  // taxModeAllowlist?: ('https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet')[];

  // ## Offer Requirements
  // // These price allow/blocklists allow specifying free or non-free offers.
  // priceAllowlist?: [0];
  // priceBlocklist?: [0];
  // prepaymentAllowlist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  // prepaymentBlocklist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  // prepaymentAllowNull?: true;
  // /**
  //  * Is `validFromBeforeStartDate` required to be included?
  //  */
  // validFromAllowNull?: true;
  // /**
  //  * ISO date string. Min value for `startDate - validFromBeforeStartDate`
  //  */
  // validFromMin?: string;
  // /**
  //  * ISO date string. Max value for `startDate - validFromBeforeStartDate`
  //  */
  // validFromMax?: string;
  // availableChannelIncludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  // availableChannelExcludes?: 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
  // advanceBookingBlocklist?: ('https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable')[];
  // openBookingFlowRequirementIncludes?: 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';
  // openBookingFlowRequirementExcludes?: 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';
  // openBookingFlowRequirementExcludesAll?: ('https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange')[];
  // latestCancellationBeforeStartDateExists?: boolean;
  // termsOfServiceArrayMinLength?: number;
