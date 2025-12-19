import { h, defineComponent, type PropType, computed, inject } from "vue";
import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";

import { VFile } from "vfile";
import { type Processor } from "unified";
import { segmentTextComponents } from "./segmentText.js";
import { ShikiProvider } from "./ShikiProvider.js";
import { ComponentCodeBlock } from "./plugin/remarkComponentCodeBlock.js";
import { EchartCodeBlock } from "./plugin/remarkEchartCodeBlock.js";
import { MermaidRenderer } from "./plugin/remarkMermaidCodeBlock.js";

import { ShikiStreamCodeBlock } from "./ShikiStreamCodeBlock.js";
import { provideProxyProps } from "./useProxyProps.js";

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

export default defineComponent({
  name: "VueMarkdownRenderer",
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
  errorCaptured(e) {
    console.error("VueMarkdownRenderer captured error", e);
  },
  setup(props) {
    const processor = inject("markdown-renderer-processor") as Processor<
      any,
      any,
      any
    >;
    provideProxyProps(props);

    const createFile = (md: string) => {
      const file = new VFile();
      file.value = md;
      return file;
    };

    const generateVueNode = (tree: any) => {
      const vueVnode = toJsxRuntime(tree, {
        components: {
          ...segmentTextComponents,
          ComponentCodeBlock,
          EchartCodeBlock,
          pre: ShikiStreamCodeBlock,
          MermaidRenderer,
        },
        Fragment,
        jsx: jsx,
        jsxs: jsx,
        passKeys: true,
        passNode: true,
      });
      return vueVnode;
    };

    const computedVNode = computed(() => {
      const file = createFile(props.source);
      return generateVueNode(processor.runSync(processor.parse(file), file));
    });

    return () => {
      return h(ShikiProvider, null, {
        default: () => computedVNode.value,
      });
    };
  },
});
