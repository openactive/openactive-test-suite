export interface OpportunityCriteria {
  opportunityType: string | null;
  /** Name of the type of OpportunityCriteria e.g. TestOpportunityBookableFree */
  opportunityCriteria: string;
  primary?: boolean;
  control?: boolean;
  opportunityReuseKey?: number;
  usedInOrderItems?: number;
}
