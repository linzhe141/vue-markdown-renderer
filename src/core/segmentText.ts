import type { Options } from "hast-util-to-jsx-runtime";
import {
  defineComponent,
  h,
  type PropType,
  type VNode,
  ref,
  inject,
} from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
interface TextNode {
  type: "text";
  value: string;
}

interface ElementNode {
  type: "element";
  tagName: string;
  children: (TextNode | ElementNode)[];
}

type Node = TextNode | ElementNode;

export const components = ["p", "h1", "h2", "h3", "li", "strong"] as const;

type ComponentsMap = NonNullable<Options["components"]>;

function wrap(node: Node): VNode | VNode[] {
  if (node.type === "text") {
    const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
    return [...segmenter.segment(node.value)].map((s, i) =>
      h("span", { key: i, class: "text-segmenter" }, s.segment)
    );
  } else if (node.type === "element" && Array.isArray(node.children)) {
    const newChildren = node.children.map(wrap);
    return h(node.tagName, null, newChildren);
  }
  return h("span"); // 默认返回，避免 undefined
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
    const highlighter = inject("highlighter") as any;
    return () => {
      const codeNode = props.node.children[0];
      if (
        codeNode &&
        codeNode.type === "element" &&
        codeNode.tagName === "code"
      ) {
        const codeTextNode = codeNode.children[0];
        if (codeTextNode.type === "text") {
          const lastChar = codeTextNode.value.at(-1);
          const codeText = codeTextNode.value.slice(
            0,
            codeTextNode.value.length - (lastChar === "\n" ? 1 : 0)
          );
          if (codeText.includes("`")) {
            console.log("todo handle `");
          }
          codeChunk.value = codeText;
        }
      }
      return h(ShikiCachedRenderer, {
        highlighter: highlighter.value,
        code: codeChunk.value,
        lang: "js",
        theme: "light-plus",
      });
    };
  },
});

export const componentsMap = components.reduce((res, key) => {
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
}, {} as ComponentsMap);
Object.assign(componentsMap, {
  pre: Pre,
});
