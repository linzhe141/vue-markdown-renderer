import {
  h,
  defineComponent,
  type PropType,
  provide,
  computed,
  type Component,
} from "vue";
import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import { VFile } from "vfile";
import { unified, type Plugin } from "unified";
import { segmentTextComponents } from "./segmentText";
import { ShikiProvider } from "./ShikiProvider";
import { componentsMapKey, configKey } from "./symbol";
import { Langs } from "./highlight/shiki";
import {
  remarkComponentCodeBlock,
  ComponentCodeBlock,
} from "./plugin/remarkComponentCodeBlock";
import { ShikiStreamCodeBlock } from "./ShikiStreamCodeBlock";

interface RemarkRehypeOptions {
  allowDangerousHtml?: boolean;
  [key: string]: any;
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
  return h(type, props, children);
}

export default defineComponent({
  name: "VueMarkdownRenderer",
  props: {
    componentsMap: {
      type: Object as PropType<Record<string, Component>>,
    },
    source: {
      type: String as PropType<string>,
      required: true,
    },
    theme: {
      type: String as PropType<"light" | "dark">,
      required: true,
    },
    codeBlockRenderer: {
      type: Object as PropType<Component>,
    },
    extraLangs: {
      type: Array as PropType<Langs[]>,
      default: () => [],
    },
    rehypePlugins: {
      type: Array as PropType<Plugin[]>,
      default: () => [],
    },
    remarkPlugins: {
      type: Array as PropType<Plugin[]>,
      default: () => [],
    },
    remarkRehypeOptions: {
      type: Object as PropType<RemarkRehypeOptions>,
      default: () => ({ allowDangerousHtml: true }),
    },
  },
  setup(props) {
    const createProcessor = () => {
      const { rehypePlugins, remarkPlugins, remarkRehypeOptions } = props;

      return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkComponentCodeBlock)
        .use(remarkPlugins)
        .use(remarkRehype, remarkRehypeOptions)
        .use(rehypePlugins);
    };

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
          pre: ShikiStreamCodeBlock,
        },
        Fragment,
        jsx: jsx,
        jsxs: jsx,
        passKeys: true,
        passNode: true,
      });
      return vueVnode;
    };
    const computedProps = computed(() => ({
      theme: props.theme,
      extraLangs: props.extraLangs,
      codeBlockRenderer: props.codeBlockRenderer,
    }));
    provide(configKey, computedProps);
    provide(componentsMapKey, props.componentsMap || {});
    const processor = createProcessor();
    return () => {
      const file = createFile(props.source);
      const vnode = generateVueNode(
        processor.runSync(processor.parse(file), file)
      );
      return h(ShikiProvider, null, {
        default: () => vnode,
      });
    };
  },
});
