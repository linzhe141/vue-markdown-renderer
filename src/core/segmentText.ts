import { computed, defineComponent, h, inject, type PropType, ref } from "vue";
import type { Options } from "hast-util-to-jsx-runtime";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider";
import { defaultLangs } from "./highlight/shiki";
import { THEME } from "./highlight/codeTheme";
import { configKey } from "./symbol";

interface TextNode {
  type: "text";
  value: string;
}

interface ElementNode {
  type: "element";
  tagName: string;
  properties: Record<string, any>;
  children: (TextNode | ElementNode)[];
}

type Node = TextNode | ElementNode;

const components = ["p", "h1", "h2", "h3", "li", "strong"] as const;

type ComponentsMap = NonNullable<Options["components"]>;

function wrap(node: Node) {
  if (node.type === "text") {
    const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
    return [...segmenter.segment(node.value)].map((s, i) =>
      h("span", { key: i, class: "text-segmenter" }, s.segment)
    );
  } else if (node.type === "element" && Array.isArray(node.children)) {
    const newChildren = node.children.map(wrap);
    return h(node.tagName, node.properties, newChildren);
  }
}

const SegmentTextImpl = defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup(props) {
    return () => wrap(props.node);
  },
});

const Pre = defineComponent({
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

            if (loadedLangs.includes(languageName)) language = languageName;
          }

          const lastChar = codeTextNode.value.at(-1);
          const codeText = codeTextNode.value.slice(
            0,
            codeTextNode.value.length - (lastChar === "\n" ? 1 : 0)
          );
          const lines = codeText.split("\n");
          const lastLine = lines.at(-1);
          if (lastLine && lastLine.startsWith("`")) {
            // 当最后一行存在``,先忽略掉最后一行的，如果还存在后续代码，这一行代码会正常更新到代码块中，
            // 否则这就是最后一行的代码块的结束标识
            code = lines.slice(0, lines.length - 1).join("\n");
          } else {
            code = codeText;
          }
        }
      }
      return {
        language,
        code,
      };
    }
    const config = inject(configKey);
    const themeStyle = computed(() => {
      const theme = config!.value.theme;
      return THEME[theme];
    });
    return () => {
      if (!highlighter!.value) return null;
      const { language, code } = getCodeMeta();
      if (code === "") return null;
      codeChunk.value = code;
      return h(ShikiCachedRenderer, {
        highlighter: highlighter!.value,
        code: codeChunk.value,
        lang: language === fallbackLang ? "ts" : language,
        theme: "css-variables",
        style: {
          ...themeStyle.value,
          background: "var(--vercel-code-block-background)",
        },
      });
    };
  },
});

export const componentsMap = components.reduce(
  (res, key) => {
    const item = {} as ComponentsMap;
    item[key] = defineComponent({
      name: key + "-wrapper",
      props: {
        node: {
          type: Object as PropType<ElementNode>,
          required: true,
        },
      },
      setup(props) {
        return () => {
          return h(
            key,
            null,
            props.node.children.map((child) =>
              h(SegmentTextImpl, { node: child })
            )
          );
        };
      },
    });
    return Object.assign(res, item);
  },
  { pre: Pre } as ComponentsMap
);
