import {
  h,
  defineComponent,
  PropType,
  onMounted,
  ref,
  provide,
  type Component,
} from "vue";
import { Fragment } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { Plugin } from "unified";
import { componentsMap } from "./segmentText";
import { initShikiHighlighter } from "./shiki";
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
    md: {
      type: String as PropType<string>,
      required: true,
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
    const highlighter = ref<any>(null);
    provide("highlighter", highlighter);
    onMounted(async () => {
      highlighter.value = await initShikiHighlighter();
    });
    const createProcessor = () => {
      const { rehypePlugins, remarkPlugins, remarkRehypeOptions } = props;

      return unified()
        .use(remarkParse)
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
        components: componentsMap,
        Fragment,
        jsx: jsx,
        jsxs: jsx,
        passKeys: true,
        passNode: true,
      });
      return vueVnode;
    };

    return () => {
      const processor = createProcessor();
      const file = createFile(props.md);
      const vnode = generateVueNode(
        processor.runSync(processor.parse(file), file)
      );
      return vnode;
    };
  },
});
