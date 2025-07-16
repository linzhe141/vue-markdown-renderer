import { computed, defineComponent, h, inject, type PropType, ref } from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider";
import { THEME } from "./highlight/codeTheme";
import { configKey } from "./symbol";
import { ElementNode } from "./segmentText";

export const ShikiStreamCodeBlock = defineComponent({
  name: "pre-wrapper",
  props: {
    node: {
      type: Object as PropType<ElementNode>,
      required: true,
    },
  },
  setup(props) {
    const codeChunk = ref("");
    const { highlighter } = useShiki();
    const fallbackLang = "ts";
    function getCodeMeta() {
      const loadedLangs = highlighter!.value!.getLoadedLanguages();
      let language = fallbackLang;
      let code = "";
      const codeNode = props.node.children[0];
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

          const lastChar = codeTextNode.value.at(-1);
          const codeText = codeTextNode.value.slice(
            0,
            codeTextNode.value.length - (lastChar === "\n" ? 1 : 0)
          );
          const lines = codeText.split("\n");
          const lastLine = lines.at(-1);

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
      if (!loadedLangs.includes(language)) language = fallbackLang;
      return {
        language,
        code,
      };
    }
    const config = inject(configKey)!;
    const themeStyle = computed(() => {
      const theme = config!.value.theme;
      return THEME[theme];
    });
    return () => {
      if (!highlighter!.value) return null;
      const { language, code } = getCodeMeta();
      if (code === "") return null;
      codeChunk.value = code;
      const highlightVnode = h(ShikiCachedRenderer, {
        highlighter: highlighter!.value,
        code: codeChunk.value,
        lang: language === fallbackLang ? fallbackLang : language,
        theme: "css-variables",
        style: {
          ...themeStyle.value,
          background: "var(--vercel-code-block-background)",
        },
      });
      if (config.value.codeBlockRenderer) {
        return h(config.value.codeBlockRenderer, {
          highlightVnode,
          language,
        });
      }
      return highlightVnode;
    };
  },
});
