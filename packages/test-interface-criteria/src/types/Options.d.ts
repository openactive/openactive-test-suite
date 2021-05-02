import { DateTime } from 'luxon';

export type Options = {
  /** When harvesting began. */
  harvestStartTime: DateTime;
  /** Two hours after harvesting began. This is used in some calculations */
  harvestStartTimeTwoHoursLater: DateTime;
};
