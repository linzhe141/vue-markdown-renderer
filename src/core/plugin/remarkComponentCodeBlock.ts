import { visit } from "unist-util-visit";
import { defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

export const remarkComponentCodeBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "component-json") {
        if (!node.meta) {
          // 默认的placeholder
          const placeholder = {
            type: "ComponentCodeBlock",
            data: {
              hName: "ComponentCodeBlock",
              hProperties: {
                placeholder: "vue-mdr-default-component-placeholder-key",
              },
            },
          };
          parent.children.splice(index, 1, placeholder);
        }
        try {
          const meta = JSON.parse(node.meta);
          try {
            const data = JSON.parse(node.value);
            const componentCodeBlock = {
              type: "ComponentCodeBlock",
              data: {
                hName: "ComponentCodeBlock",
                hProperties: data,
              },
            };
            parent.children.splice(index, 1, componentCodeBlock);
          } catch (e) {
            const placeholder = {
              type: "ComponentCodeBlock",
              data: {
                hName: "ComponentCodeBlock",
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
const ComponentWrapper = defineComponent({
  props: ["component", "componetPropsJson"],
  setup(props) {
    return () => {
      return h(props.component, JSON.parse(props.componetPropsJson));
    };
  },
});

const Placeholder = defineComponent({
  setup() {
    return () => {
      return h("div", { class: "vue-mdr-default-component-placeholder" });
    };
  },
});

export const ComponentCodeBlock = defineComponent({
  name: "component-code-block",
  inheritAttrs: false,

  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const options = inject("markdown-renderer-options") as ApiOptions;
    const computedComponentsMap = options.componentsMap;
    return () => {
      const node = props.node;
      const placeholder = node.properties.placeholder;
      if (placeholder) {
        const target = computedComponentsMap?.[placeholder];
        if (target === undefined) {
          console.warn(
            `${placeholder} does not exist in componentsMap, the built-in 'Placeholder' will be used instead.`
          );
        }
        return h(target || Placeholder);
      }

      const component = computedComponentsMap?.[node.properties.type];
      if (component === undefined) {
        throw new Error(
          `${node.properties.type} not exist in componentsMap:${JSON.stringify(computedComponentsMap, null, 2)}`
        );
      }
      const componentProps = node.properties.props;
      return h(ComponentWrapper, {
        component,
        componetPropsJson: JSON.stringify(componentProps),
      });
    };
  },
});
