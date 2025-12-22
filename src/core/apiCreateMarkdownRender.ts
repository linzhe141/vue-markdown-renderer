import { Component, defineComponent, h, PropType, provide } from "vue";
import { unified, type Plugin } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";

import { remarkComponentCodeBlock } from "./plugin/remarkComponentCodeBlock.js";
import { remarkEchartCodeBlock } from "./plugin/remarkEchartCodeBlock.js";
import { remarkMermaidCodeBlock } from "./plugin/remarkMermaidCodeBlock.js";
import { rehypeTable } from "./plugin/rehypeTable.js";

import VueMarkdownRenderer from "./VueMarkdownRenderer.js";

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
};

export function createMarkdownRenderer(options?: ApiOptions) {
  options = options || {};
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkComponentCodeBlock)
    .use(remarkEchartCodeBlock)
    .use(remarkMermaidCodeBlock)
    .use(options.remarkPlugins ?? [])
    .use(remarkRehype, options.remarkRehypeOptions || {})
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
      provide("markdown-renderer-options", options);
      provide("markdown-renderer-processor", processor);
      return () =>
        h(VueMarkdownRenderer, {
          source: props.source,
          theme: props.theme,
        });
    },
  });
}
