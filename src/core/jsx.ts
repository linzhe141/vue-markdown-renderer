import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { ComponentCodeBlockRenderer } from "./plugin/remarkComponentCodeBlock.js";
import { EchartCodeBlockRenderer } from "./plugin/remarkEchartCodeBlock.js";
import { MermaidRenderer } from "./plugin/remarkMermaidCodeBlock.js";
import { ShikiStreamCodeBlock } from "./highlight/ShikiStreamCodeBlock.js";
import { segmentTextWrappers } from "./segmentText";
import { TableRenderer } from "./plugin/rehypeTable.js";
import { h } from "vue";

export function generateVueNode(tree: any) {
  const vueVnode = toJsxRuntime(tree, {
    components: {
      ...segmentTextWrappers,
      pre: ShikiStreamCodeBlock,
      ComponentCodeBlockRenderer,
      EchartCodeBlockRenderer,
      MermaidRenderer,
      TableRenderer,
    },
    Fragment,
    jsx: jsx,
    jsxs: jsx,
    passKeys: true,
    passNode: true,
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
    if (type === ShikiStreamCodeBlock) {
      // 使用json字符串作为prop的目的是防止ShikiStreamCodeBlock组件不必要的re-render
      const nodeJSON = JSON.stringify(props.node);
      delete props.node;
      return h(type, { ...props, nodeJSON });
    }
    return h(type, props);
  }
  return h(type, props, children);
}
