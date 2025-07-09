import { visit } from "unist-util-visit";
import { defineComponent, h, inject } from "vue";
import Placeholder from "./placeholder.vue";
import { componentsMapKey } from "../symbol";

export const remarkComponentBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "component-json") {
        try {
          const data = JSON.parse(node.value);
          const componentCodeBlock = {
            type: "ComponentCodeBlock",
            data: {
              hName: "ComponentCodeBlock",
              hProperties: data,
            },
          };
          if (parent && typeof index === "number") {
            parent.children.splice(index, 1, componentCodeBlock);
          }
        } catch (e) {
          if (parent && typeof index === "number") {
            const placeholder = {
              type: "ComponentCodeBlock",
              data: {
                hName: "ComponentCodeBlock",
                hProperties: {
                  loading: true,
                },
              },
            };
            parent.children.splice(index, 1, placeholder);
          }
        }
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
    return () => {
      const node = props.node;
      const isLoading = node.properties.loading;
      if (isLoading) {
        return h(Placeholder);
      }
      const componentsMap = inject(componentsMapKey)!;
      const component = componentsMap[node.properties.type];
      const componentProps = node.properties.props;
      return h(ComponentWrapper, {
        component,
        componetPropsJson: JSON.stringify(componentProps),
      });
    };
  },
});
