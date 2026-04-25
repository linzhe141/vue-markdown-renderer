import { defaultSchema } from "rehype-sanitize";
import {
  hprops as ComponentCodeBlockRendererProps,
  htag as ComponentCodeBlockRenderer,
} from "./plugin/remarkComponentCodeBlock.js";
import {
  hprops as EchartCodeBlockRendererProps,
  htag as EchartCodeBlockRenderer,
} from "./plugin/remarkEchartCodeBlock.js";
import {
  hprops as MermaidRendererProps,
  htag as MermaidRenderer,
} from "./plugin/remarkMermaidCodeBlock.js";

export function buildSanitizeSchema(): typeof defaultSchema {
  const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames ?? []),
      ComponentCodeBlockRenderer,
      EchartCodeBlockRenderer,
      MermaidRenderer,
    ],
    attributes: {
      ...defaultSchema.attributes,
      [ComponentCodeBlockRenderer]:
        ComponentCodeBlockRendererProps as unknown as string[],
      [EchartCodeBlockRenderer]:
        EchartCodeBlockRendererProps as unknown as string[],
      [MermaidRenderer]: MermaidRendererProps as unknown as string[],
    },
  };
  return sanitizeSchema;
}
