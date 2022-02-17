import { SingleBar } from 'cli-progress';

export type OrderFeedType = 'orders' | 'order-proposals';
export type OrderFeedIdentifier = 'OrdersFeed' | 'OrderProposalsFeed';
export type BookingPartnerIdentifier = 'primary' | 'secondary';

export type FeedContext = {
  currentPage: string;
  pages: number;
  items: number;
  responseTimes: number[];
  totalItemsQueuedForValidation: number;
  validatedItems: number;
  sleepMode?: boolean;
  timeToHarvestCompletion?: string;

  progressbar?: SingleBar;
};
