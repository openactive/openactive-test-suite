export interface OpportunityCriteria {
  opportunityType: string | null;
  opportunityCriteria: string;
  primary?: boolean;
  control?: boolean;
  opportunityReuseKey?: number;
  usedInOrderItems?: number;
  seller?: string;
}
