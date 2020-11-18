export type TestDataRequirements = {
  startDateMin?: string,
  startDateMax?: string,
  durationMin?: string,
  durationMax?: string,
  remainingCapacityMin?: number,
  remainingCapacityMax?: number,
  validFromNull?: boolean,
  validFromMin?: string,
  validFromMax?: string,
  eventStatusOptions?: ('https://schema.org/EventCancelled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventScheduled')[]
};
