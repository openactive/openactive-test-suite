export type EventStatusType = 'https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled';
export type TaxMode = 'https://openactive.io/TaxGross' | 'https://openactive.io/TaxNet';
export type RequiredStatusType = 'https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable';
export type AvailableChannelType = 'https://openactive.io/OpenBookingPrepayment' | 'https://openactive.io/TelephoneAdvanceBooking' | 'https://openactive.io/TelephonePrepayment' | 'https://openactive.io/OnlinePrepayment';
export type OpenBookingFlowRequirement = 'https://openactive.io/OpenBookingIntakeForm' | 'https://openactive.io/OpenBookingAttendeeDetails' | 'https://openactive.io/OpenBookingApproval' | 'https://openactive.io/OpenBookingNegotiation' | 'https://openactive.io/OpenBookingMessageExchange';

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
  | NullNodeConstraint;

/**
 * For a particular criteria, test data requirements that must be met by an opportunity
 * and offer so that they meet the criteria.
 * e.g. the free criteria has the data requirement that price must be 0
 */
export interface TestDataShape {
  'opportunityConstraints'?: {
    'schema:startDate'?: DateRangeNodeConstraint;
    /**
     * "placeholder:remainingCapacity" is a stand-in for either remainingAttendeeCapacity (sessions)
     * or remainingUses (facilities)
     */
    'placeholder:remainingCapacity'?: NumericNodeConstraint;
    'schema:eventStatus'?: OptionNodeConstraint<EventStatusType, 'schema:EventStatusType'>;
    'oa:taxMode'?: OptionNodeConstraint<TaxMode, 'oa:TaxMode'>;
  };
  'offerConstraints'?: {
    'schema:price'?: NumericNodeConstraint;
    'oa:prepayment'?: OptionNodeConstraint<RequiredStatusType,'oa:RequiredStatusType'>;
    /**
     * Refers to the date calculated as `startDate - validFromBeforeStartDate`.
     * For this particular DateRangeNodeConstraint, `allowNull` refers to whether `validFromBeforeStartDate`
     * can be null.
     */
    'oa:validFromBeforeStartDate'?: DateRangeNodeConstraint;
    'schema:availableChannel'?: ArrayConstraint<AvailableChannelType, 'oa:AvailableChannelType'>;
    'oa:advanceBooking'?: OptionNodeConstraint<RequiredStatusType, 'oa:RequiredStatusType'>;
    'oa:openBookingFlowRequirement'?: ArrayConstraint<OpenBookingFlowRequirement, 'oa:OpenBookingFlowRequirement'>;
    'oa:latestCancellationBeforeStartDate'?: NullNodeConstraint;
    // note that the type isn't specified yet (it's a '@type': 'Terms' object) as
    // we don't use includes/excludes rules for this field, so it's irrelevant.
    'schema:termsOfService'?: ArrayConstraint<unknown, 'oa:Terms'>;
  };
}
