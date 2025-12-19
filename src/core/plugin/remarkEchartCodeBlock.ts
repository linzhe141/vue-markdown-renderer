import { visit } from "unist-util-visit";
import { defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

export const remarkEchartCodeBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "echarts") {
        if (!node.meta) {
          // 默认的placeholder
          const placeholder = {
            type: "EchartCodeBlock",
            data: {
              hName: "EchartCodeBlock",
              hProperties: {
                placeholder: "vue-mdr-default-echart-placeholder-key",
              },
            },
          };
          parent.children.splice(index, 1, placeholder);
        }
        try {
          const meta = JSON.parse(node.meta);
          try {
            const data = JSON.parse(node.value);
            const echartCodeBlock = {
              type: "EchartCodeBlock",
              data: {
                hName: "EchartCodeBlock",
                hProperties: data,
              },
            };
            parent.children.splice(index, 1, echartCodeBlock);
          } catch (e) {
            const placeholder = {
              type: "EchartCodeBlock",
              data: {
                hName: "EchartCodeBlock",
                hProperties: {
                  placeholder: meta.placeholder,
                },
              },
            };
            parent.children.splice(index, 1, placeholder);
          }
        } catch (e) {}
      }
    });
  };
};

// 使用json字符串作为prop的目的是防止组件(props.component)不必要的re-render
const EchartWrapper = defineComponent({
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

export const EchartCodeBlock = defineComponent({
  name: "echart-code-block",
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

      return h(EchartWrapper, {
        optionJson: JSON.stringify(node.properties),
      });
    };
  },
});
