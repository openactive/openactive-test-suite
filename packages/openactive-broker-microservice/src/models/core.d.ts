export type OrderFeedType = 'orders' | 'order-proposals';
export type OrderFeedIdentifier = 'OrdersFeed' | 'OrderProposalsFeed';
export type BookingPartnerIdentifier = string;

/*
TODO in future we should put more thorough typing on this object and that would
then immediately improve type-checking on all functions that act on opportunity
data.

Since opportunities have (mostly) already been validated, we could make use of
this, if it gets implemented, to automatically get a confirmed valid type for
the Opportunity: https://github.com/openactive/data-model-validator/issues/448.
*/
export type Opportunity = Record<string, any>;
export type RpdeItem = {
  state: string;
  kind: string;
  id: string | number;
  /** modified handled as a string as it could be a number bigger than JS's number limit.
   * This causes issues with fidelity and ordering. It is not stored as a BigInt in memory as lots of libraries have
   * problems with BigInts. It is stored as a string and converted to a BigInt when comparisons are needed, and then
   * converted back.
   */
  modified: string;
  data?: Opportunity;
};

/**
 * An opportunity, as well as metadata about it's state and origin.
 */
export type OpportunityItemRow = {
  id: RpdeItem['id'];
  modified: RpdeItem['modified'];
  deleted: boolean;
  /** Timestamp (Date.now()) when item was ingested. Handled as a string as all modifieds are strings for consistency. For more information see above. */
  feedModified: string;
  jsonLdId: string;
  jsonLd: Opportunity;
  /** e.g 'Slot' */
  jsonLdType: string;
  /**
   * i.e. is this a SessionSeries or FacilityUse?
   * Note that if this is true, then the following fields should be:
   * - jsonLdParentId: null
   * - waitingForParentToBeIngested: false
   */
  isParent: boolean;
  jsonLdParentId: string | null;
  waitingForParentToBeIngested: boolean;
};
