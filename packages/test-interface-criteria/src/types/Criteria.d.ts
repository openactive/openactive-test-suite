import { Opportunity } from './Opportunity';
import { Offer } from './Offer';
import { Options } from './Options';
import { TestDataShape } from './TestDataShape';

export type OpportunityConstraint = (opportunity: Opportunity, options?: Options) => boolean;

export type OfferConstraint = (offer: Offer, opportunity?: Opportunity, options?: Options) => boolean;

export type TestDataShapeFactory = (options: Options) => TestDataShape;

export type Criteria = {
  name: string,
  /**
   * List of constraints that must all be met for this criteria to match an
   * opportunity.
   *
   * Each item is a 2-tuple where:
   * - The 1st arg is the name of the constraint
   * - The 2nd arg is the constraint itself
   */
  opportunityConstraints: (
    [string, OpportunityConstraint]
  )[],
  /**
   * List of constraints that must all be met for this criteria to match an
   * offer.
   *
   * Each item is a 2-tuple where:
   * - The 1st arg is the name of the constraint
   * - The 2nd arg is the constraint itself
   */
  offerConstraints: (
    [string, OfferConstraint]
  )[],
  /**
   * Test data requirements that are applicable for this criteria.
   */
  testDataShape: TestDataShapeFactory,
};
