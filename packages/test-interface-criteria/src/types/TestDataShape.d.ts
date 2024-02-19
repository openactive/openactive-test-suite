export type EventStatusType = 'https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled';
export type TaxMode = 'https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet';
export type RequiredStatusType = 'https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable';
export type OpenBookingFlowRequirement =
  | 'https://openactive.io/OpenBookingIntakeForm'
  | 'https://openactive.io/OpenBookingAttendeeDetails'
  | 'https://openactive.io/OpenBookingApproval'
  | 'https://openactive.io/OpenBookingNegotiation'
  | 'https://openactive.io/OpenBookingMessageExchange';
export type EventAttendanceMode =
  | 'https://schema.org/MixedEventAttendanceMode'
  | 'https://schema.org/OfflineEventAttendanceMode'
  | 'https://schema.org/OnlineEventAttendanceMode';

export interface DateRangeNodeConstraint {
  '@type': 'test:DateRangeNodeConstraint';
  /** ISO date string */
  minDate?: string;
  /** ISO date string */
  maxDate?: string;
  /** If true (default is false), the value can alternatively be null or undefined */
  allowNull?: true;
}

export interface NumericNodeConstraint {
  '@type': 'NumericNodeConstraint';
  mininclusive?: number;
  maxinclusive?: number;
}

export interface BooleanNodeConstraint {
  '@type': 'test:BooleanNodeConstraint';
  value: boolean; 
}

/**
 * A reference to a schema.org or OpenActive type, prefixed
 * e.g. oa:RequiredStatusType or schema:EventStatusType
 */
export type ValueType = 
  | 'oa:OpenBookingFlowRequirement'
  | 'oa:RequiredStatusType'
  | 'oa:TaxMode'
  | 'oa:Terms'
  | 'schema:EventStatusType'
  | 'schema:EventAttendanceModeEnumeration';

/**
 * Specifies a value that must be one of a set of options.
 * For example, an `eventStatus` field would be set up to only have
 * one of the `schema:EventStatusType` options (e.g.
 * `https://schema.org/EventCancelled`, etc)
 */
export interface OptionNodeConstraint<
  /** TypeScript union of the types that this option can take */
  TOptionType,
  TValueType extends ValueType
> {
  '@type': 'test:OptionNodeConstraint';
  datatype: TValueType;
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

/**
 * Similar to OptionNodeConstraint, but where the value must be an
 * array. Each item in the array must be from the same set of options.
 */
export interface ArrayConstraint<
  TArrayOf,
  TValueType extends ValueType
> {
  '@type': 'test:ArrayConstraint';
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
  datatype: TValueType;
}

/**
 * This value cannot be present. It must be null or undefined.
 */
export interface NullNodeConstraint {
  '@type': 'test:NullNodeConstraint';
}

/** Range of possible types for a single field's data requirement */
export type TestDataNodeConstraint =
  | DateRangeNodeConstraint
  | NumericNodeConstraint
  | OptionNodeConstraint<any, any>
  | ArrayConstraint<any, any>
  | NullNodeConstraint
  | BooleanNodeConstraint;

export type TestDataShapeOpportunityConstraints = {
  'schema:startDate'?: DateRangeNodeConstraint;
  /**
   * "placeholder:remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
   * or remainingUses (facilities)
   */
  'placeholder:remainingCapacity'?: NumericNodeConstraint;
  /**
   * IFU slots can have a different capacity requirement to other opportunity types
   * because the spec imposes a maximum capacity of 1 for IFU slots.
   */
  'placeholder:remainingCapacityIfuSlot'?: NumericNodeConstraint;
  'schema:eventStatus'?: OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>;
  'oa:taxMode'?: OptionNodeConstraint<TaxMode, 'oa:TaxMode'>;
  'oa:isOpenBookingAllowed'?: BooleanNodeConstraint;
  'schema:eventAttendanceMode'?: OptionNodeConstraint<EventAttendanceMode, 'schema:EventAttendanceModeEnumeration'>;
  // note that the type isn't specified yet (it's a '@type': 'Terms' object) as
  // we don't use includes/excludes rules for this field, so it's irrelevant.
  'schema:termsOfService'?: ArrayConstraint<unknown, 'oa:Terms'>;
};

/**
 * For a particular criteria, test data requirements that must be met by an opportunity
 * and offer so that they meet the criteria.
 * e.g. the free criteria has the data requirement that price must be 0
 */
export type TestDataShape = {
  'opportunityConstraints'?: TestDataShapeOpportunityConstraints;
  'offerConstraints'?: {
    'schema:price'?: NumericNodeConstraint;
    'oa:openBookingPrepayment'?: OptionNodeConstraint<RequiredStatusType,'oa:RequiredStatusType'>;
    /**
     * Refers to the date calculated as `startDate - validFromBeforeStartDate`.
     * For this particular DateRangeNodeConstraint, `allowNull` refers to whether `validFromBeforeStartDate`
     * can be null.
     */
    'oa:validFromBeforeStartDate'?: DateRangeNodeConstraint;
    'oa:openBookingInAdvance'?: OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>;
    'oa:openBookingFlowRequirement'?: ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>;
    'oa:latestCancellationBeforeStartDate'?: NullNodeConstraint | DateRangeNodeConstraint;
    'oa:allowCustomerCancellationFullRefund'?: BooleanNodeConstraint;
  };
}
