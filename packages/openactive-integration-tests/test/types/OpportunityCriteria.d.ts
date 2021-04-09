/**
 * For an OpportunityCriteria, the criteria for which Seller it should belong to.
 *
 * Values:
 * - primary: The seller identified as `primary` in sellers config
 * - secondary: The seller identified as `secondary` in sellers config
 * - taxGross: A seller which has taxMode set to "https://openactive.io/TaxGross"
 * - taxNet: A seller which has taxMode set to "https://openactive.io/TaxNet"
 */
export type SellerCriteria =
  | 'primary'
  | 'secondary'
  | 'taxGross'
  | 'taxNet';

export interface OpportunityCriteria {
  opportunityType: string | null;
  /** Name of the type of OpportunityCriteria e.g. TestOpportunityBookableFree */
  opportunityCriteria: string;
  primary?: boolean;
  control?: boolean;
  opportunityReuseKey?: number;
  usedInOrderItems?: number;
  sellerCriteria?: SellerCriteria;
}
