import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { h } from "vue";
import { resolveNodeRenderers } from "./nodeRenderers.js";

export function useJsxRuntime() {
  const components = resolveNodeRenderers();

  function generateVueNode(tree: any) {
    const vueVnode = toJsxRuntime(tree, {
      components,
      Fragment,
      jsx: jsx,
      jsxs: jsx,
      passKeys: true,
    });
    return vueVnode;
  }
  return generateVueNode;
}

function jsx(type: any, props: Record<any, any>, key: any) {
  const { children } = props;
  delete props.children;
  if (arguments.length > 2) {
    props.key = key;
  }
  if (type === Fragment) {
    return h(type, props, children);
  }
  if (typeof type === "string") {
    return h(type, props, children);
  } else if (typeof type === "object") {
    return h(type, props, { default: () => children });
  }
}
