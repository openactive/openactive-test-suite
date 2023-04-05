export type ValidatorWorkerResponse = {
  errors: {
    opportunityId: string;
    error: unknown[];
  }[];
  numItemsPerFeed: {
    [feedContextIdentifier: string]: number;
  };
  profileMeasuresPerFeed: any
};

export type ValidatorWorkerRequestParsedItem = {
  validationMode: string;
  item: unknown;
  feedContextIdentifier: string;
};

export type ValidatorWorkerRequestParsed = ValidatorWorkerRequestParsedItem[];
