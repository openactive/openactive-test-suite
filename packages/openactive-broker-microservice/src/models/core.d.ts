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
  modified: string | number;
  data?: Opportunity;
};

/**
 * A type internal to Broker which contains data about a child-
 * (e.g. ScheduledSession) opportunity.
 */
export type OpportunityItemRow = {
  id: RpdeItem['id'];
  modified: RpdeItem['modified'];
  deleted: boolean;
  /** Timestamp (Date.now()) when item was ingested */
  feedModified: number;
  jsonLdId: string;
  jsonLd: Opportunity;
  /** e.g 'Slot' */
  jsonLdType: string;
  jsonLdParentId: string | null;
  waitingForParentToBeIngested: boolean;
};
