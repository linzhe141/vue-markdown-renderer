import { Component, defineComponent, h, PropType, provide } from "vue";
import type { Components } from "hast-util-to-jsx-runtime";
import type { Schema } from "hast-util-sanitize";
import deepmerge from "deepmerge";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified, type PluggableList, type Processor } from "unified";

import VueMarkdownRenderer from "./VueMarkdownRenderer.js";
import { buildSanitizeSchema } from "./buildSanitizeSchema.js";
import { rehypeCodeBlock } from "./plugin/rehypeCodeBlock.js";
import { rehypeSegmentText } from "./plugin/rehypeSegmentText.js";
import { rehypeTable } from "./plugin/rehypeTable.js";
import { remarkCompleteTable } from "./plugin/remarkTable.js";
import {
  markdownRendererOptionsKey,
  markdownRendererProcessorKey,
} from "./symbol.js";

interface RemarkRehypeOptions {
  allowDangerousHtml?: boolean;
  [key: string]: any;
}

type PluginList = PluggableList;

export interface MarkdownRendererPlugins {
  remark?: PluginList;
  rehype?: PluginList;
}

export interface MarkdownRendererProcessorOptions {
  remarkRehype?: RemarkRehypeOptions;
  sanitizeSchema?: Schema;
  textSegmenterLocale?: string;
}

export interface MarkdownRendererRenderers {
  /**
   * Custom hast tag -> Vue component mapping.
   */
  nodes?: Record<string, Component>;
  /**
   * Component registry used by `component-json` code blocks.
   */
  components?: Record<string, Component>;
  codeBlock?: Component;
  mermaid?: Component;
  echart?: {
    renderer: Component;
    placeholder?: Component;
  };
  table?: Component;
}

export type ApiOptions = {
  renderers?: MarkdownRendererRenderers;
  plugins?: MarkdownRendererPlugins;
  processor?: MarkdownRendererProcessorOptions;

  /**
   * @deprecated Use `renderers.components` or `renderers.nodes`.
   */
  componentsMap?: Record<string, Component>;
  /**
   * @deprecated Use `renderers.codeBlock`.
   */
  codeBlock?: {
    renderer: Component;
  };
  /**
   * @deprecated Use `renderers.mermaid`.
   */
  mermaid?: {
    renderer: Component;
  };
  /**
   * @deprecated Use `renderers.echart`.
   */
  echart?: {
    renderer: Component;
    placeholder: Component;
  };
  /**
   * @deprecated Use `renderers.table`.
   */
  table?: {
    renderer: Component;
  };
  /**
   * @deprecated Use `plugins.rehype`.
   */
  rehypePlugins?: PluginList;
  /**
   * @deprecated Use `plugins.remark`.
   */
  remarkPlugins?: PluginList;
  /**
   * @deprecated Use `processor.remarkRehype`.
   */
  remarkRehypeOptions?: RemarkRehypeOptions;
  /**
   * @deprecated Use `processor.sanitizeSchema`.
   */
  rehypeSanitizeSchema?: Schema;
  /**
   * @deprecated Use `processor.textSegmenterLocale`.
   */
  textSegmenterLocale?: string;
};

export interface ResolvedApiOptions {
  renderers: {
    nodes: Record<string, Component>;
    components: Record<string, Component>;
    codeBlock?: Component;
    mermaid?: Component;
    echart?: {
      renderer: Component;
      placeholder?: Component;
    };
    table?: Component;
  };
  plugins: Required<MarkdownRendererPlugins>;
  processor: Required<MarkdownRendererProcessorOptions>;
}

export function createMarkdownRenderer(options: ApiOptions = {}) {
  const resolvedOptions = resolveApiOptions(options);
  const processor = createProcessor(resolvedOptions);

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
      provide(markdownRendererOptionsKey, resolvedOptions);
      provide(markdownRendererProcessorKey, processor);

      return () =>
        h(VueMarkdownRenderer, {
          source: props.source,
          theme: props.theme,
        });
    },
  });
}

function resolveApiOptions(options: ApiOptions): ResolvedApiOptions {
  const legacyComponents = options.componentsMap ?? {};

  return {
    renderers: {
      nodes: {
        ...legacyComponents,
        ...(options.renderers?.nodes ?? {}),
      } as Record<string, Component>,
      components: options.renderers?.components ?? legacyComponents,
      codeBlock: options.renderers?.codeBlock ?? options.codeBlock?.renderer,
      mermaid: options.renderers?.mermaid ?? options.mermaid?.renderer,
      echart: options.renderers?.echart ?? options.echart,
      table: options.renderers?.table ?? options.table?.renderer,
    },
    plugins: {
      remark: options.plugins?.remark ?? options.remarkPlugins ?? [],
      rehype: options.plugins?.rehype ?? options.rehypePlugins ?? [],
    },
    processor: {
      remarkRehype:
        options.processor?.remarkRehype ?? options.remarkRehypeOptions ?? {},
      sanitizeSchema:
        options.processor?.sanitizeSchema ?? options.rehypeSanitizeSchema ?? {},
      textSegmenterLocale:
        options.processor?.textSegmenterLocale ??
        options.textSegmenterLocale ??
        "",
    },
  };
}

function createProcessor(options: ResolvedApiOptions) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCompleteTable)
    .use(options.plugins.remark)
    .use(remarkRehype, options.processor.remarkRehype)
    .use(rehypeSegmentText, {
      locale: options.processor.textSegmenterLocale || undefined,
    })
    .use(rehypeRaw)
    .use(
      rehypeSanitize,
      deepmerge(buildSanitizeSchema(), options.processor.sanitizeSchema)
    );

  // Code block metadata depends on raw HTML parsing,
  // table replacement depends on the normalized code block tree shape.
  useRehypePipeline(processor, [
    rehypeCodeBlock,
    rehypeTable,
    ...options.plugins.rehype,
  ]);

  return processor;
}

function useRehypePipeline(
  processor: Processor<any, any, any, any, any>,
  plugins: PluginList
) {
  for (const plugin of plugins) {
    processor.use(plugin as any);
  }
}
