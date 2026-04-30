import { computed, defineComponent, h, inject } from "vue";
import { markdownRendererOptionsKey } from "../symbol.js";
import { parseJson } from "../parseJson.js";

export const EchartCodeBlockRenderer = defineComponent({
  name: "echart-code-block-renderer",
  inheritAttrs: false,
  props: {
    meta: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const options = inject(markdownRendererOptionsKey)!;
    const EchartRenderer = options.renderers.echart?.renderer;
    if (!EchartRenderer) {
      throw new Error(`echartRenderer must be provided`);
    }
    const EchartRendererPlaceholder = options.renderers.echart?.placeholder;
    const parsedCode = computed(() =>
      parseJson<Record<string, unknown>>(props.code)
    );
    return () => {
      if (!parsedCode.value) {
        return h(EchartRendererPlaceholder || Placeholder);
      }
      return h(EchartRenderer, {
        option: parsedCode.value,
      });
    };
  },
});

const Placeholder = defineComponent({
  setup() {
    return () => {
      return h("div", { class: "vue-mdr-default-echart-placeholder" });
    };
  },
});
