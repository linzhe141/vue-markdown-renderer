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
  Placeholder,
} from ".";
export const MarkdownRenderer = createMarkdownRenderer({
  componentsMap: {
    BarChart,
    Placeholder,
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
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex as unknown as Plugin],
});
