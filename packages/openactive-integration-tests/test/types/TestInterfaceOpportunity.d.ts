import { TestDataRequirements } from '@openactive/test-interface-criteria/built-types/types/TestDataRequirements';

/**
 * Opportunity data for test interface requests. Just has ID and organizer/provider ID
 */
export type TestInterfaceOpportunity =
  | TestInterfaceScheduledSessionData
  | TestInterfaceFacilityUseSlotData
  | TestInterfaceIndividualFacilityUseSlotData
  | TestInterfaceCourseInstanceData
  | TestInterfaceCourseInstanceSubEventData
  | TestInterfaceHeadlineEventData
  | TestInterfaceHeadlineEventSubEventData
  | TestInterfaceEventData
  | TestInterfaceOnDemandEventData;

export interface BaseTestInterfaceOpportunity {
  '@context': [
    'https://openactive.io/',
    'https://openactive.io/test-interface',
  ];
  'test:testOpportunityCriteria': string;
  'test:testOpportunityDataShapeExpression'?: TestDataRequirements['test:testOpportunityDataShapeExpression'];
  'test:testOfferDataShapeExpression'?: TestDataRequirements['test:testOfferDataShapeExpression'];
}

export interface TestInterfaceScheduledSessionData extends BaseTestInterfaceOpportunity {
  '@type': 'ScheduledSession';
  superEvent: {
    '@type': 'SessionSeries';
    organizer: TestInterfaceSeller;
  };
}

export interface TestInterfaceFacilityUseSlotData extends BaseTestInterfaceOpportunity {
  '@type': 'Slot';
  facilityUse: {
    '@type': 'FacilityUse';
    provider: TestInterfaceSeller;
  };
}

export interface TestInterfaceIndividualFacilityUseSlotData extends BaseTestInterfaceOpportunity {
  '@type': 'Slot';
  facilityUse: {
    '@type': 'IndividualFacilityUse';
    provider: TestInterfaceSeller;
  };
}

export interface TestInterfaceCourseInstanceData extends BaseTestInterfaceOpportunity {
  '@type': 'CourseInstance';
  organizer: TestInterfaceSeller;
}

export interface TestInterfaceCourseInstanceSubEventData extends BaseTestInterfaceOpportunity {
  '@type': 'Event';
  superEvent: Pick<TestInterfaceCourseInstanceData, '@type' | 'organizer'>;
}

export interface TestInterfaceHeadlineEventData extends BaseTestInterfaceOpportunity {
  '@type': 'HeadlineEvent';
  organizer: TestInterfaceSeller;
}

export interface TestInterfaceHeadlineEventSubEventData extends BaseTestInterfaceOpportunity {
  '@type': 'Event';
  superEvent: Pick<TestInterfaceHeadlineEventData, '@type' | 'organizer'>;
}

export interface TestInterfaceEventData extends BaseTestInterfaceOpportunity {
  '@type': 'Event';
  organizer: TestInterfaceSeller;
}

export interface TestInterfaceOnDemandEventData extends BaseTestInterfaceOpportunity {
  '@type': 'OnDemandEvent';
  organizer: TestInterfaceSeller;
}

export interface TestInterfaceSeller {
  '@type': string;
  '@id': string;
}
