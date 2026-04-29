import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { h, inject } from "vue";
import { ComponentCodeBlockRenderer } from "./components/ComponentCodeBlockRenderer.js";
import { EchartCodeBlockRenderer } from "./components/EchartCodeBlockRenderer.js";
import { MermaidRenderer } from "./components/MermaidRenderer.js";
import { TableRenderer } from "./components/TableRenderer.js";
import { CodeBlockRenderer } from "./components/CodeBlockRenderer.js";
import { markdownRendererOptionsKey } from "./symbol.js";

export function useJsxRuntime() {
  const options = inject(markdownRendererOptionsKey)!;

  function generateVueNode(tree: any) {
    const vueVnode = toJsxRuntime(tree, {
      components: {
        ...(options.componentsMap || {}),
        // 内置组件不可替换
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
    // 针对pre标签进行特殊处理，使用内置组件渲染
    if (type === "pre") {
      const { meta, lang, code } = props;
      const langToBuildInComponentMap = {
        echarts: EchartCodeBlockRenderer,
        mermaid: MermaidRenderer,
        "component-json": ComponentCodeBlockRenderer,
      };
      const targetComponent =
        langToBuildInComponentMap[lang] ?? CodeBlockRenderer;
      return h(targetComponent, { meta, lang, code });
    }
    return h(type, props, children);
  } else if (typeof type === "object") {
    return h(type, props, { default: () => children });
  }
}
