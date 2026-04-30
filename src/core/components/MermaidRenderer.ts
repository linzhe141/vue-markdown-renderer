import { defineComponent, h, inject, ref, watch } from "vue";
import { markdownRendererOptionsKey } from "../symbol.js";
import mermaid from "mermaid";

let mermaidIdCounter = 0;

export const MermaidRenderer = defineComponent({
  name: "mermaid-renderer",
  inheritAttrs: false,
  props: {
    code: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    return () => {
      const source = props.code;
      return h(Render, { source });
    };
  },
});

const Render = defineComponent({
  props: ["source"],
  setup(props) {
    const blobUrl = ref("");
    const renderId = `mermaid-wrapper-${++mermaidIdCounter}`;
    const parse = async () => {
      try {
        const isValid = await mermaid.parse(props.source);
        if (isValid) {
          const { svg } = await mermaid.render(renderId, props.source);
          const blob = new Blob([svg], {
            type: "image/svg+xml",
          });
          if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
          blobUrl.value = URL.createObjectURL(blob);
        }
      } catch (e) {
        console.log("mermaid parse error skip rendering");
      }
    };
    watch(() => props.source, parse, { immediate: true });

    const { renderers } = inject(markdownRendererOptionsKey)!;

    const CustomMermaidRenderer = renderers.mermaid;
    return () => {
      return CustomMermaidRenderer
        ? h(CustomMermaidRenderer, { img: blobUrl.value, source: props.source })
        : h(
            "div",
            { style: { display: "flex", justifyContent: "center" } },
            blobUrl &&
              h("img", { src: blobUrl.value, style: { height: "500px" } })
          );
    };
  },
});
