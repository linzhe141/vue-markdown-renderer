import { defaultSchema } from "rehype-sanitize";

export function buildSanitizeSchema(): typeof defaultSchema {
  return {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? [])],
  };
}
