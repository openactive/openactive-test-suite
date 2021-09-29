export type OrderFeedType = 'orders' | 'order-proposals';
export type OrderFeedIdentifier = 'OrdersFeed' | 'OrderProposalsFeed';
export type BookingPartnerIdentifier = 'primary' | 'secondary';

export type FeedContext = {
  currentPage: string;
  pages: number;
  sleepPages: number;
  items: number;
  responseTimes: number[];
  totalItemsQueuedForValidation: number;
  validatedItems: number;
  sleepMode?: boolean;
  isInitialHarvestComplete?: boolean;
  timeToHarvestCompletion?: string;
};
