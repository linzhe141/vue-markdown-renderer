import { computed, defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";
import { parseJson } from "../parseJson.js";

type ComponentBlockMeta = {
  placeholder?: string;
};

type ComponentBlockPayload = {
  type?: string;
  props?: Record<string, unknown>;
};

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
    const parsedMeta = computed(() => parseJson<ComponentBlockMeta>(props.meta));
    const parsedCode = computed(() =>
      parseJson<ComponentBlockPayload>(props.code)
    );
    const placeholderName = computed(() => parsedMeta.value?.placeholder);
    const placeholderComponent = computed(() => {
      const name = placeholderName.value;
      if (!name) return Placeholder;

      const target = computedComponentsMap?.[name];
      if (!target) {
        console.warn(
          `${name} does not exist in componentsMap, the built-in 'Placeholder' will be used instead.`
        );
      }
      return target || Placeholder;
    });
    const renderedComponent = computed(() => {
      if (!parsedCode.value) return null;

      const type = parsedCode.value?.type;
      if (!type) {
        throw new Error(`component-json code block requires a 'type' field.`);
      }

      const component = computedComponentsMap?.[type];
      if (!component) {
        throw new Error(
          `${type} not exist in componentsMap:${JSON.stringify(computedComponentsMap, null, 2)}`
        );
      }
      return component;
    });

    return () => {
      if (!parsedCode.value) {
        return h(placeholderComponent.value);
      }

      return h(renderedComponent.value!, parsedCode.value.props ?? {});
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
