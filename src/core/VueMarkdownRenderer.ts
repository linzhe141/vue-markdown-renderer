import { h, defineComponent, PropType } from "vue";
import { Fragment, jsx, jsxs } from "vue/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { Plugin } from "unified";
import { componentsMap } from "./segmentText";
interface RemarkRehypeOptions {
  allowDangerousHtml?: boolean;
  [key: string]: any;
}

export default defineComponent({
  name: "VueMarkdown",
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
        jsx,
        jsxs,
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
