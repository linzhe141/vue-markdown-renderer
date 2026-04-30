import { defineComponent, h, inject } from "vue";
import { ComponentCodeBlockRenderer } from "./components/ComponentCodeBlockRenderer.js";
import { CodeBlockRenderer } from "./components/CodeBlockRenderer.js";
import { EchartCodeBlockRenderer } from "./components/EchartCodeBlockRenderer.js";
import { MermaidRenderer } from "./components/MermaidRenderer.js";
import { TableRenderer } from "./components/TableRenderer.js";
import { markdownRendererOptionsKey } from "./symbol.js";

export function resolveNodeRenderers() {
  const options = inject(markdownRendererOptionsKey)!;

  return {
    pre: InternalPreNodeRenderer,
    TableRenderer,
    ...options.renderers.nodes,
  };
}

const InternalPreNodeRenderer = defineComponent({
  name: "VueMarkdownPreNodeRenderer",
  props: {
    meta: String,
    lang: String,
    code: String,
  },
  setup(props) {
    return () => {
      const langToRendererMap = {
        echarts: EchartCodeBlockRenderer,
        mermaid: MermaidRenderer,
        "component-json": ComponentCodeBlockRenderer,
      };

      const TargetRenderer =
        langToRendererMap[props.lang as keyof typeof langToRendererMap] ??
        CodeBlockRenderer;

      return h(TargetRenderer, {
        meta: props.meta ?? "",
        lang: props.lang ?? "",
        code: props.code ?? "",
      });
    };
  },
});
