import { computed, defineComponent, h, inject } from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider.js";
import { THEME } from "./codeTheme.js";
import { ElementNode } from "../segmentText.js";
import { useProxyProps } from "../useProxyProps.js";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

const FALLBACK_LANG = "ts";

export const ShikiStreamCodeBlock = defineComponent({
  name: "pre-wrapper",
  props: {
    nodeJSON: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const proxyProps = useProxyProps();
    const { highlighter } = useShiki();
    const { codeBlock } = inject("markdown-renderer-options") as ApiOptions;

    const CodeBlockRenderer = codeBlock?.renderer;
    const themeStyle = computed(() => {
      const theme = proxyProps.theme;
      return THEME[theme];
    });

    function getCodeMeta() {
      const node = JSON.parse(props.nodeJSON) as ElementNode;
      const loadedLangs = highlighter!.value!.getLoadedLanguages();
      let language = "";
      let code = "";
      const codeNode = node.children[0];
      if (
        codeNode &&
        codeNode.type === "element" &&
        codeNode.tagName === "code"
      ) {
        const codeTextNode = codeNode.children[0];
        if (codeTextNode.type === "text") {
          const className = codeNode.properties.className as string[];
          if (className) {
            const languageClass = className.find((i) =>
              i.includes("language")
            ) as string;

            let [_, languageName] = languageClass.split("-");
            language = languageName;
          }

          const lastChar = codeTextNode.value[codeTextNode.value.length - 1];
          const codeText = codeTextNode.value.slice(
            0,
            codeTextNode.value.length - (lastChar === "\n" ? 1 : 0)
          );
          const lines = codeText.split("\n");
          const lastLine = lines[lines.length - 1];

          if (
            lines.length > 1 &&
            lastLine &&
            lastLine.trimStart().startsWith("`")
          ) {
            code = lines.slice(0, lines.length - 1).join("\n");
          } else {
            code = codeText;
          }
        }
      }
      let highlightLang = language;
      if (!loadedLangs.includes(highlightLang)) highlightLang = FALLBACK_LANG;
      return {
        highlightLang,
        language,
        code,
      };
    }

    return () => {
      if (!highlighter!.value) return null;
      const { highlightLang, language, code: codeChunk } = getCodeMeta();
      // early render for better UX
      // if (codeChunk === "") return null;
      const highlightVnode = h(ShikiCachedRenderer, {
        highlighter: highlighter!.value,
        code: codeChunk,
        lang: highlightLang,
        theme: "css-variables",
        style: {
          ...themeStyle.value,
          background: "var(--vercel-code-block-background)",
        },
      });

      if (CodeBlockRenderer) {
        return h(CodeBlockRenderer, {
          highlightVnode,
          language,
        });
      }
      return highlightVnode;
    };
  },
});
