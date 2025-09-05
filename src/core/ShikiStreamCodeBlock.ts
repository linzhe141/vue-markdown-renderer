import { computed, defineComponent, h } from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider";
import { THEME } from "./highlight/codeTheme";
import { ElementNode } from "./segmentText";
import { useProxyProps } from "./useProxyProps";

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
    const computedCodeBlockRenderer = computed(
      () => proxyProps.codeBlockRenderer
    );
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

          let matchedMarkdownCount = 0;
          if (language === "markdown") {
            lines.forEach((line) => {
              const trimStartLine = line.trimStart();
              if (trimStartLine.startsWith("```")) {
                matchedMarkdownCount++;
              }
            });
            if (
              lastLine &&
              lastLine.trimStart().startsWith("```") &&
              matchedMarkdownCount % 2 === 0
            ) {
              code = codeText;
            }
          } else {
            if (lastLine && lastLine.trimStart().startsWith("`")) {
              code = lines.slice(0, lines.length - 1).join("\n");
            } else {
              code = codeText;
            }
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
      if (codeChunk === "") return null;
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

      if (computedCodeBlockRenderer.value) {
        return h(computedCodeBlockRenderer.value, {
          highlightVnode,
          language,
        });
      }
      return highlightVnode;
    };
  },
});
