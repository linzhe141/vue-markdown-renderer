import { computed, defineComponent, h, inject, type PropType, ref } from "vue";
import type { Options } from "hast-util-to-jsx-runtime";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import { useShiki } from "./ShikiProvider";
import { supportLangs } from "./highlight/shiki";
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
    function getCodeMeta() {
      let language = "ts";
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
          const languageClass = className.find((i) =>
            i.includes("language")
          ) as string;

          let [_, languageName] = languageClass.split("-");

          if (supportLangs[languageName]) language = languageName;

          const lastChar = codeTextNode.value.at(-1);
          const codeText = codeTextNode.value.slice(
            0,
            codeTextNode.value.length - (lastChar === "\n" ? 1 : 0)
          );
          if (codeText.includes("`")) {
            console.log("todo handle `");
            return {
              language,
              code,
            };
          }
          code = codeText;
        }
      }
      return {
        language,
        code,
      };
    }
    const config = inject(configKey);
    const themeStyle = computed(() => {
      debugger;
      const theme = config!.value.theme;
      return THEME[theme];
    });
    return () => {
      const { language, code } = getCodeMeta();
      codeChunk.value = code;
      if (!highlighter!.value) return null;
      return h(ShikiCachedRenderer, {
        highlighter: highlighter!.value,
        code: codeChunk.value,
        lang: language,
        theme: "css-variables",
        style: { ...themeStyle.value, background: "var(--ray-background)" },
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
