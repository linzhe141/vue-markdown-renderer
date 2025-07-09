import { visit } from "unist-util-visit";
import { defineComponent, h } from "vue";
import Placeholder from "./placeholder.vue";
import BarChart from "./BarChart.vue";

export const remarkComponentBlock = () => {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "component-json") {
        try {
          const data = JSON.parse(node.value);
          const componentBlock = {
            type: "ComponentBlock",
            data: {
              hName: "ComponentBlock",
              hProperties: data,
            },
          };
          if (parent && typeof index === "number") {
            parent.children.splice(index, 1, componentBlock);
          }
        } catch (e) {
          if (parent && typeof index === "number") {
            const placeholder = {
              type: "ComponentBlock",
              data: {
                hName: "ComponentBlock",
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

const map = {
  Foo: {
    props: ["name"],
    setup(props) {
      return () =>
        h(
          "div",
          { style: "color:red;word-break: break-word;" },
          `131` + props.name
        );
    },
  },
  BarChart: BarChart,
};

export const Test = {
  name: "xxxxxxxxxxxxxx",
  inheritAttrs: false,
  props: ["componetPropsJson", "component"],
  setup(props) {
    return () => {
      debugger;
      return h(props.component, JSON.parse(props.componetPropsJson));
    };
  },
};

export const Component = defineComponent({
  name: "component-wrapper",
  // inheritAttrs: false,

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

      const component = map[node.properties.type];
      const componentProps = node.properties.props;
      // return h(component, { ...componentProps });
      debugger;
      return h(Test, {
        component,
        componetPropsJson: JSON.stringify(componentProps),
      });
    };
  },
});
