import { computed, defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";
export const ComponentCodeBlockRenderer = defineComponent({
  name: "component-code-block-renderer",
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
    const options = inject("markdown-renderer-options") as ApiOptions;
    const computedComponentsMap = options.componentsMap;
    const showPlaceholder = computed(() => {
      if (!props.meta) return true;
      if (!props.code) return true;
      try {
        JSON.parse(props.code);
        return false;
      } catch (e) {
        return true;
      }
    });
    return () => {
      if (showPlaceholder.value) {
        const placeholder = JSON.parse(props.meta).placeholder;
        const target = computedComponentsMap?.[placeholder];
        if (!target) {
          console.warn(
            `${placeholder} does not exist in componentsMap, the built-in 'Placeholder' will be used instead.`
          );
        }
        return h(target || Placeholder);
      }

      const component = computedComponentsMap?.[JSON.parse(props.code).type];
      if (!component) {
        throw new Error(
          `${JSON.parse(props.code).type} not exist in componentsMap:${JSON.stringify(computedComponentsMap, null, 2)}`
        );
      }
      const componentProps = JSON.parse(props.code).props;
      return h(component, componentProps);
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
