import { createMarkdownRenderer } from "../../../../src";
import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { type Plugin } from "unified";
import {
  BarChart,
  CodeBlockRenderer,
  EchartRenderer,
  MermaidRenderer,
  Placeholder,
  TableRenderer,
} from ".";
import ARenderer from "./nodes/ARenderer.vue";
import CodeRender from "./nodes/CodeRender.vue";
import ImageRenderer from "./nodes/ImageRenderer.vue";
import PRender from "./nodes/PRender.vue";

export const MarkdownRenderer = createMarkdownRenderer({
  renderers: {
    nodes: {
      a: ARenderer,
      img: ImageRenderer,
      p: PRender,
      code: CodeRender,
      // !除了pre，pre已经内置使用了
      // !但其实也可以覆盖，但不建议覆盖，否则无法使用内置的代码块渲染和echart代码块等功能了
    },
    components: {
      BarChart,
      Placeholder,
    },
    codeBlock: CodeBlockRenderer,
    echart: {
      renderer: EchartRenderer,
      placeholder: Placeholder,
    },
    mermaid: MermaidRenderer,
    // table: TableRenderer,
  },
  plugins: {
    remark: [remarkMath],
    rehype: [rehypeKatex as unknown as Plugin],
  },
  processor: {
    remarkRehype: {
      allowDangerousHtml: true,
    },
    sanitizeSchema: {
      attributes: {
        "*": ["className", "style"],
      },
    },
  },
});
