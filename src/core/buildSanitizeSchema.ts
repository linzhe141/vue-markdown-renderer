import { defaultSchema } from "rehype-sanitize";

export function buildSanitizeSchema(): typeof defaultSchema {
  const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? [])],
    attributes: {
      ...defaultSchema.attributes,
      pre: [...(defaultSchema.attributes?.pre ?? []), "meta", "lang", "code"],
    },
  };
  return sanitizeSchema;
}
