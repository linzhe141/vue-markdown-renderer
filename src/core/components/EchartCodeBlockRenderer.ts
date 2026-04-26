import { computed, defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

export const EchartCodeBlockRenderer = defineComponent({
  name: "echart-code-block-renderer",
  inheritAttrs: false,
  props: {
    meta: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const options = inject("markdown-renderer-options") as ApiOptions;
    const EchartRenderer = options.echart?.renderer;
    if (!EchartRenderer) {
      throw new Error(`echartRenderer must be provided`);
    }
    const EchartRendererPlaceholder = options.echart?.placeholder;

    const showPlaceholder = computed(() => {
      try {
        JSON.parse(props.code);
        return false;
      } catch (e) {
        return true;
      }
    });
    return () => {
      if (showPlaceholder.value) {
        return h(EchartRendererPlaceholder || Placeholder);
      }
      const config = JSON.parse(props.code);
      return h(EchartRenderer, {
        option: config,
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
