import { h, defineComponent, type PropType, computed, inject } from "vue";
import { VFile } from "vfile";
import { ShikiProvider } from "./highlight/ShikiProvider.js";
import { provideProxyProps } from "./useProxyProps.js";
import { useJsxRuntime } from "./jsx.js";
import { markdownRendererProcessorKey } from "./symbol.js";

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
    const processor = inject(markdownRendererProcessorKey)!;
    provideProxyProps(props);

    const createFile = (md: string) => {
      const file = new VFile();
      file.value = md;
      return file;
    };

    const generateVueNode = useJsxRuntime();

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
