export type ValidatorWorkerResponse = {
  errors: {
    opportunityId: string;
    error: unknown[];
  }[];
  numItemsPerFeed: {
    [feedContextIdentifier: string]: number;
  };
};

export type ValidatorWorkerRequestParsedItem = {
  validationMode: string;
  item: {
    '@id': string;
    [k: string]: unknown;
  };
  feedContextIdentifier: string;
};

export type ValidatorWorkerRequestParsed = ValidatorWorkerRequestParsedItem[];
