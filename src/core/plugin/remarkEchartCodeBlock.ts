import { visit } from "unist-util-visit";
import { defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

export const remarkEchartCodeBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "echarts") {
        if (!node.meta) {
          // 默认的placeholder
          const echartCodeBlockRenderer = {
            type: "EchartCodeBlockRenderer",
            data: {
              hName: "EchartCodeBlockRenderer",
              hProperties: {
                placeholder: "vue-mdr-default-echart-placeholder-key",
              },
            },
          };
          parent.children.splice(index, 1, echartCodeBlockRenderer);
        }
        try {
          const meta = JSON.parse(node.meta);
          try {
            const data = JSON.parse(node.value);
            const echartCodeBlockRenderer = {
              type: "EchartCodeBlockRenderer",
              data: {
                hName: "EchartCodeBlockRenderer",
                hProperties: data,
              },
            };
            parent.children.splice(index, 1, echartCodeBlockRenderer);
          } catch (e) {
            const echartCodeBlockRenderer = {
              type: "EchartCodeBlockRenderer",
              data: {
                hName: "EchartCodeBlockRenderer",
                hProperties: {
                  placeholder: meta.placeholder,
                },
              },
            };
            parent.children.splice(index, 1, echartCodeBlockRenderer);
          }
        } catch (e) {}
      }
    });
  };
};

// 使用json字符串作为prop的目的是防止组件(props.component)不必要的re-render
const Wrapper = defineComponent({
  props: ["optionJson"],
  setup(props) {
    const options = inject("markdown-renderer-options") as ApiOptions;
    const EchartRenderer = options.echart?.renderer;
    return () => {
      if (!EchartRenderer) {
        throw new Error(`echartRenderer must be provided`);
      }
      return h(EchartRenderer, {
        option: JSON.parse(props.optionJson),
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
    const EchartRendererPlaceholder = options.echart?.placeholder;
    return () => {
      const node = props.node;
      const placeholder = node.properties.placeholder;
      if (placeholder) {
        return h(EchartRendererPlaceholder || Placeholder);
      }

      return h(Wrapper, {
        optionJson: JSON.stringify(node.properties),
      });
    };
  },
});
