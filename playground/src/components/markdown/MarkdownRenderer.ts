import { createMarkdownRenderer } from "../../../../src";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { type Plugin } from "unified";
import {
  BarChart,
  CodeBlockRenderer,
  MermaidRenderer,
  EchartRenderer,
  TableRenderer,
  Placeholder,
} from ".";
import ARenderer from "./nodes/ARenderer.vue";
import ImageRenderer from "./nodes/ImageRenderer.vue";
import PRender from "./nodes/PRender.vue";
import CodeRender from "./nodes/CodeRender.vue";
import PreRender from "./nodes/PreRender.vue";

export const MarkdownRenderer = createMarkdownRenderer({
  componentsMap: {
    BarChart,
    Placeholder,
    // html 标签的渲染也可以通过这个componentsMap来覆盖

    a: ARenderer,
    img: ImageRenderer,
    p: PRender,
    code: CodeRender,
    // !除了pre，pre已经内置使用了
    // !但其实也可以覆盖，但不建议覆盖，否则无法使用内置的代码块渲染和echart代码块等功能了
    // pre: PreRender,
  },
  codeBlock: {
    renderer: CodeBlockRenderer,
  },
  echart: {
    renderer: EchartRenderer,
    placeholder: Placeholder,
  },
  mermaid: {
    renderer: MermaidRenderer,
  },
  // table: {
  //   renderer: TableRenderer,
  // },
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex as unknown as Plugin],
  remarkRehypeOptions: {
    allowDangerousHtml: true,
  },
  rehypeSanitizeSchema: {
    attributes: {
      "*": ["className", "style"],
    },
  },
});
