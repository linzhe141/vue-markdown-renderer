import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";

import { ShikiStreamCodeBlock } from "./highlight/ShikiStreamCodeBlock.js";
import { h } from "vue";
import { ComponentCodeBlockRenderer } from "./components/ComponentCodeBlockRenderer.js";
import { EchartCodeBlockRenderer } from "./components/EchartCodeBlockRenderer.js";
import { MermaidRenderer } from "./components/MermaidRenderer.js";
import { TableRenderer } from "./components/TableRenderer.js";

export function generateVueNode(tree: any) {
  const vueVnode = toJsxRuntime(tree, {
    components: {
      // 这个对应的plugin 在rehypeSanitize 之后所以跳过了hast阶段
      TableRenderer,
    },
    Fragment,
    jsx: jsx,
    jsxs: jsx,
    passKeys: true,
  });
  return vueVnode;
}

function jsx(type: any, props: Record<any, any>, key: any) {
  const { children } = props;
  delete props.children;
  if (arguments.length > 2) {
    props.key = key;
  }
  if (type === Fragment) {
    return h(type, props, children);
  } else if (typeof type !== "string") {
    return h(type, props);
  }

  if (type === "pre") {
    const { meta, lang, code } = props;
    const langToBuildInComponentMap = {
      echarts: EchartCodeBlockRenderer,
      mermaid: MermaidRenderer,
      "component-json": ComponentCodeBlockRenderer,
    };
    const targetComponent =
      langToBuildInComponentMap[lang] ?? ShikiStreamCodeBlock;

    return h(targetComponent, { meta, lang, code });
  } else {
    return h(type, props, children);
  }
}
