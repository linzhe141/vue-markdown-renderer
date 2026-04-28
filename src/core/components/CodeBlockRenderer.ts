import {
  computed,
  ComputedRef,
  defineComponent,
  h,
  inject,
  Ref,
  ref,
  renderList,
  watch,
} from "vue";
import { useShiki } from "../highlight/ShikiProvider";
import { defaultLangs } from "../highlight/shiki";
import { ShikiStreamTokenizer } from "shiki-stream";
import { ThemedToken } from "shiki/dist/core-unwasm.mjs";
import { THEME } from "../highlight/codeTheme";
import { useProxyProps } from "../useProxyProps";
import { markdownRendererOptionsKey } from "../symbol";

const FALLBACK_LANG = "ts";
export const CodeBlockRenderer = defineComponent({
  name: "CodeBlockRenderer",
  props: {
    code: {
      type: String,
    },
    lang: {
      type: String,
    },
  },
  setup(props) {
    const { highlighter } = useShiki();

    return () => {
      if (!highlighter?.value) return null;
      // return h(CodeBlock, {
      //   code: props.code,
      //   lang: props.lang,
      // });
      return h(StreamBlock, {
        code: props.code,
        lang: props.lang,
      });
    };
  },
});

export const CodeBlock = defineComponent({
  name: "CodeBlock",
  props: {
    code: {
      type: String,
    },
    lang: {
      type: String,
    },
  },
  setup(props) {
    const { highlighter } = useShiki();

    const tokens = computed(() => {
      if (!props.code) return [];
      const formatLang = props.lang as keyof typeof defaultLangs;

      const highlightLang =
        defaultLangs[formatLang] !== undefined ? formatLang : FALLBACK_LANG;

      const result = highlighter!.value!.codeToTokens(props.code, {
        lang: highlightLang,
        theme: "css-variables",
      });
      return result.tokens;
    });

    const highlightVnode = useHighlightVnode(tokens);

    const { codeBlock } = inject(markdownRendererOptionsKey)!;
    const CodeBlockRenderer = codeBlock?.renderer;
    return () => {
      if (CodeBlockRenderer) {
        return h(CodeBlockRenderer, {
          highlightVnode: highlightVnode.value,
          language: props.lang,
          code: props.code,
        });
      }
      return highlightVnode.value;
    };
  },
});

export const StreamBlock = defineComponent({
  name: "StreamBlock",
  props: {
    code: {
      type: String,
    },
    lang: {
      type: String,
    },
  },
  setup(props) {
    let tokenizer: ShikiStreamTokenizer | null = null;
    const indexRef = { current: 0 };

    const { highlighter } = useShiki();

    const tokens = ref<ThemedToken[]>([]);
    watch(
      () => props.code,
      async (code, oldCode) => {
        if (!code) return;

        // 表示 codeblock 已经是完整的了，或者说code变短了，这时直接用shiki重新高亮就好了
        if (oldCode && oldCode.length > code.length) {
          const stableTokens = tokenizer?.tokensStable || [];
          tokens.value = [...stableTokens];
          return;
        }

        // 因为code开始改变了所以这时 lang 已经确定了
        if (!tokenizer) {
          const formatLang = props.lang as keyof typeof defaultLangs;
          const highlightLang =
            defaultLangs[formatLang] !== undefined ? formatLang : FALLBACK_LANG;

          tokenizer = new ShikiStreamTokenizer({
            highlighter: highlighter!.value!,
            lang: highlightLang,
            theme: "css-variables",
          });
        }

        let formatCode = code;
        if (code.at(-1) === "\n") formatCode = code.slice(0, -1);
        if (formatCode.length > indexRef.current) {
          const incrementalText = formatCode.slice(indexRef.current);
          indexRef.current = formatCode.length;

          const { stable, unstable, recall } =
            await tokenizer.enqueue(incrementalText);
          const chunkTokens = [...stable, ...unstable];

          const prev = tokens.value;
          const baseTokens = recall > 0 ? prev.slice(0, -recall) : prev;
          tokens.value = [...baseTokens, ...chunkTokens];
        }
      },
      {
        immediate: true,
      }
    );

    const lineTokens = computed(() => tokensToLineTokens(tokens.value));
    const highlightVnode = useHighlightVnode(lineTokens);

    const { codeBlock } = inject(markdownRendererOptionsKey)!;
    const CodeBlockRenderer = codeBlock?.renderer;

    return () => {
      if (CodeBlockRenderer) {
        return h(CodeBlockRenderer, {
          highlightVnode: highlightVnode.value,
          language: props.lang,
          code: props.code,
        });
      }
      return highlightVnode.value;
    };
  },
});

function useThemeStyle() {
  const proxyProps = useProxyProps();
  const themeStyle = computed(() => {
    const theme = proxyProps.theme;
    return THEME[theme];
  });
  return themeStyle;
}

function useHighlightVnode(
  tokens: Ref<ThemedToken[][]> | ComputedRef<ThemedToken[][]>
) {
  const themeStyle = useThemeStyle();

  const highlightVnode = computed(() => {
    return h(
      "pre",
      {
        class: "shiki",
        style: {
          ...themeStyle.value,
          background: "var(--vercel-code-block-background)",
        },
      },
      h(
        "code",
        renderList(tokens.value, (line, index) =>
          h(
            "span",
            {
              key: index,
              class: "shiki-code-line",
              style: { display: "block" },
            },
            renderList(line, (t, index) =>
              h(
                "span",
                {
                  key: index,
                  class: "shiki-token",
                  style: {
                    color: t.color,
                    backgroundColor: t.bgColor,
                    ...t.htmlStyle,
                  },
                },
                t.content
              )
            )
          )
        )
      )
    );
  });
  return highlightVnode;
}

// https://github.com/lobehub/lobe-ui/blob/bddfce33e3d7c4a117f7b11ee70c25fdffb3f250/src/hooks/useStreamHighlight.ts#L21
const tokensToLineTokens = (tokens: ThemedToken[]): ThemedToken[][] => {
  if (!tokens.length) return [[]];

  const lines: ThemedToken[][] = [];
  let currentLine: ThemedToken[] = [];

  for (const token of tokens) {
    const content = token.content ?? "";

    if (content === "\n") {
      lines.push(currentLine);
      currentLine = [];
      continue;
    }

    const newlineIndex = content.indexOf("\n");
    if (newlineIndex === -1) {
      // No newline, add token directly
      currentLine.push(token);
    } else {
      // Split on newlines
      const segments = content.split("\n");
      for (const [j, segment] of segments.entries()) {
        if (segment) {
          // Only create new object if we need to modify content
          currentLine.push(
            j === 0 && segment === content
              ? token
              : { ...token, content: segment }
          );
        }
        if (j < segments.length - 1) {
          lines.push(currentLine);
          currentLine = [];
        }
      }
    }
  }

  // Don't forget the last line
  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [[]];
};
