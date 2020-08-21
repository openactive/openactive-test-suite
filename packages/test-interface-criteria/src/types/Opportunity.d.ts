// export type OpportunityIdPart = {
//   '@id': string,
//   id?: string,
// } | {
//   '@id'?: string,
//   id: string,
// };

// export type OpportunityTypePart = {
//   '@type': string,
//   type?: string,
// } | {
//   '@type'?: string,
//   type: string,
// };

// export type Opportunity = OpportunityIdPart & OpportunityTypePart & {
//   [k: string]: unknown,
// };

// export type Opportunity = {
//   '@id'?: string,
//   id?: string,
//   '@type'?: string,
//   type?: string,
//   [k: string]: unknown,
// };

// TODO Types need to be generated from OpenActive objects using existing
// specifications. This is a placeholder for now
export type Opportunity = {
  [k: string]: any,
};
