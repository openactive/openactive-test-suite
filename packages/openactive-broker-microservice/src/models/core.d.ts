import { SingleBar } from 'cli-progress';

export type OrderFeedType = 'orders' | 'order-proposals';
export type OrderFeedIdentifier = 'OrdersFeed' | 'OrderProposalsFeed';
export type BookingPartnerIdentifier = string;

export type FeedContext = {
  currentPage: string;
  pages: number;
  items: number;
  responseTimes: number[];
  totalItemsQueuedForValidation: number;
  validatedItems: number;
  sleepMode?: boolean;
  timeToHarvestCompletion?: string;

  _progressbar?: SingleBar; // Underscore prefix hides this value from /status page
};
