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
  item: unknown;
  feedContextIdentifier: string;
  rpdeKind: string;
};

export type ValidatorWorkerRequestParsed = ValidatorWorkerRequestParsedItem[];
