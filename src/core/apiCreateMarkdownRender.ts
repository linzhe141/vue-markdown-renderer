import { Component, defineComponent, h, PropType, provide } from "vue";
import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import deepmerge from "deepmerge";

import { remarkCompleteTable } from "./plugin/remarkTable.js";
import { rehypeCodeBlock } from "./plugin/rehypeCodeBlock.js";
import { rehypeTable } from "./plugin/rehypeTable.js";
import { rehypeSegmentText } from "./plugin/rehypeSegmentText.js";

import VueMarkdownRenderer from "./VueMarkdownRenderer.js";
import { buildSanitizeSchema } from "./buildSanitizeSchema.js";
import {
  markdownRendererOptionsKey,
  markdownRendererProcessorKey,
} from "./symbol.js";

interface RemarkRehypeOptions {
  allowDangerousHtml?: boolean;
  [key: string]: any;
}
export type ApiOptions = {
  componentsMap?: Record<string, Component>;
  codeBlock?: {
    renderer: Component;
  };
  mermaid?: {
    renderer: Component;
  };
  echart?: {
    renderer: Component;
    placeholder: Component;
  };
  table?: {
    renderer: Component;
  };
  rehypePlugins?: Plugin[];
  remarkPlugins?: Plugin[];
  remarkRehypeOptions?: RemarkRehypeOptions;
  rehypeSanitizeSchema?: Schema;
  textSegmenterLocale?: string;
};

export function createMarkdownRenderer(options?: ApiOptions) {
  options = options || {};
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCompleteTable)
    .use(options.remarkPlugins ?? [])
    .use(remarkRehype, options.remarkRehypeOptions || {})
    .use(rehypeSegmentText, { locale: options.textSegmenterLocale })
    .use(rehypeRaw)
    .use(
      rehypeSanitize,
      deepmerge(buildSanitizeSchema(), options.rehypeSanitizeSchema || {})
    )
    // code block 的 rehype 插件必须放在 rehypeRaw 之后，rehypeTable 的 rehype 插件必须放在 rehypeCodeBlock 之后
    .use(rehypeCodeBlock)
    .use(rehypeTable)
    .use(options.rehypePlugins ?? []);

  return defineComponent({
    name: "VueMarkdownRendererWrapper",
    props: {
      source: {
        type: String as PropType<string>,
        required: true,
      },
      theme: {
        type: String as PropType<"light" | "dark">,
        required: true,
      },
    },
    setup(props) {
      provide(markdownRendererOptionsKey, options);
      provide(markdownRendererProcessorKey, processor);
      return () =>
        h(VueMarkdownRenderer, {
          source: props.source,
          theme: props.theme,
        });
    },
  });
}
