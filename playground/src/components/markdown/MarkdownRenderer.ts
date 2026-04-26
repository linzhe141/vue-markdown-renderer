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
import Link from "./Link.vue";

export const MarkdownRenderer = createMarkdownRenderer({
  componentsMap: {
    BarChart,
    Placeholder,
    // html 标签的渲染也可以通过这个componentsMap来覆盖
    // !除了pre，pre已经内置使用了
    a: Link,
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
