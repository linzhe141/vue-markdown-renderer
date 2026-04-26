import { computed, defineComponent, h, inject } from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider.js";
import { THEME } from "./codeTheme.js";
import { useProxyProps } from "../useProxyProps.js";
import { ApiOptions } from "../apiCreateMarkdownRender.js";

const FALLBACK_LANG = "ts";

export const ShikiStreamCodeBlock = defineComponent({
  name: "pre-wrapper",
  props: {
    meta: {
      type: String,
      required: false,
    },
    lang: {
      type: String,
      required: false,
    },
    code: {
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
      const loadedLangs = highlighter!.value!.getLoadedLanguages();
      let language = props.lang ?? "";
      let code = "";
      const lastChar = props.code[props.code.length - 1];
      const codeText = props.code.slice(
        0,
        props.code.length - (lastChar === "\n" ? 1 : 0)
      );
      const lines = codeText.split("\n");
      const lastLine = lines[lines.length - 1];

      let matchedMaybeMarkdownCodeblockCount = 0;
      if (language === "markdown") {
        for (const line of lines) {
          if (line.trimStart().startsWith("`")) {
            matchedMaybeMarkdownCodeblockCount++;
          }
        }
      }

      if (
        lines.length > 1 &&
        lastLine &&
        lastLine.trimStart().startsWith("`")
      ) {
        if (
          language === "markdown" &&
          matchedMaybeMarkdownCodeblockCount % 2 === 0
        ) {
          code = codeText;
        } else {
          code = lines.slice(0, lines.length - 1).join("\n");
        }
      } else {
        code = codeText;
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
          code: codeChunk,
        });
      }
      return highlightVnode;
    };
  },
});
