import { defineComponent, h, inject, ref, watch } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";
import mermaid from "mermaid";

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
    const parse = async () => {
      try {
        const isValid = await mermaid.parse(props.source);
        if (isValid) {
          const { svg } = await mermaid.render("mermaid-wrapper", props.source);
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

    const { mermaid: mermaidOption } = inject(
      "markdown-renderer-options"
    ) as ApiOptions;

    const MermaidRenderer = mermaidOption?.renderer;
    return () => {
      return MermaidRenderer
        ? h(MermaidRenderer, { img: blobUrl.value, source: props.source })
        : h(
            "div",
            { style: { display: "flex", justifyContent: "center" } },
            blobUrl &&
              h("img", { src: blobUrl.value, style: { height: "500px" } })
          );
    };
  },
});
