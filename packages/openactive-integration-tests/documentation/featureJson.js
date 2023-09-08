const { z } = require('zod');

const FeatureJsonLinkSchema = z.object({
  name: z.string(),
  href: z.string().url(),
});

/**
 * The shape of data in feature.json files.
 */
const FeatureJsonSchema = z.object({
  category: z.string(),
  identifier: z.string(),
  name: z.string(),
  description: z.string(),
  explainer: z.string().optional(),
  /**
   * URL reference to a section of the Open Booking API
   */
  specificationReference: z.string().url(),
  /**
   * Is it required for an implementation to implement this feature?
   */
  required: z.boolean(),
  /**
   * How much test coverage has been written for this feature
   */
  coverageStatus: z.enum(['none', 'partial', 'complete']),
  /**
   * Description of when this feature is required
   */
  requiredCondition: z.string().optional(),
  links: z.array(FeatureJsonLinkSchema).optional(),
});

/**
 * @typedef {z.infer<typeof FeatureJsonSchema>} FeatureJson
 */

module.exports = {
  FeatureJsonSchema,
};
