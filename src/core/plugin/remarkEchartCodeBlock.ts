import { visit } from "unist-util-visit";
import { defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

export const htag = "EchartCodeBlockRenderer".toLowerCase();
export const hprops = ["config", "placeholder"] as const;
type Properties = Partial<Record<(typeof hprops)[number], string>>;

export const remarkEchartCodeBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "echarts") {
        if (!node.meta) {
          // 默认的placeholder
          const echartCodeBlockRenderer = {
            type: "element",
            data: {
              hName: htag,
              hProperties: {
                placeholder: "vue-mdr-default-echart-placeholder-key",
              } satisfies Properties,
            },
          };
          parent.children.splice(index, 1, echartCodeBlockRenderer);
        }
        try {
          const meta = JSON.parse(node.meta);
          try {
            JSON.parse(node.value);
            const echartCodeBlockRenderer = {
              type: "element",
              data: {
                hName: htag,
                hProperties: {
                  config: node.value,
                } as Properties,
              },
            };
            parent.children.splice(index, 1, echartCodeBlockRenderer);
          } catch (e) {
            const echartCodeBlockRenderer = {
              type: "element",
              data: {
                hName: htag,
                hProperties: {
                  placeholder: meta.placeholder,
                } satisfies Properties,
              },
            };
            parent.children.splice(index, 1, echartCodeBlockRenderer);
          }
        } catch (e) {}
      }
    });
  };
};

const Placeholder = defineComponent({
  setup() {
    return () => {
      return h("div", { class: "vue-mdr-default-echart-placeholder" });
    };
  },
});

export const EchartCodeBlockRenderer = defineComponent({
  name: "echart-code-block-renderer",
  inheritAttrs: false,

  props: {
    node: {
      type: Object,
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
    return () => {
      const node = props.node;
      const placeholder = node.properties.placeholder;
      if (placeholder) {
        return h(EchartRendererPlaceholder || Placeholder);
      }
      const config = node.properties.config;
      return h(EchartRenderer, {
        option: JSON.parse(config),
      });
    };
  },
});
