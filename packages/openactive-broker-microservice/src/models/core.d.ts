export type OrderFeedType = 'orders' | 'order-proposals';
export type OrderFeedIdentifier = 'OrdersFeed' | 'OrderProposalsFeed';
export type BookingPartnerIdentifier = string;

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
