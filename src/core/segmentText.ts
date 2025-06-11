import type { Options } from "hast-util-to-jsx-runtime";
import {
  defineComponent,
  h,
  type PropType,
  type VNode,
  type Component,
  ref,
  inject,
} from "vue";
import { ShikiCachedRenderer } from "shiki-stream/vue";
import theme from "@shikijs/themes/nord";

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
  props: {
    node: {
      type: Object as PropType<ElementNode>,
      required: true,
    },
  },
  setup(props) {
    const codeChunk = ref("");
    const highlighter = inject("highlighter");
    return () => {
      props;
      const codeNode = props.node.children[0];
      if (
        codeNode &&
        codeNode.type === "element" &&
        codeNode.tagName === "code"
      ) {
        const codeTextNode = codeNode.children[0];
        if (codeTextNode.type === "text") {
          const codeText = codeTextNode.value;
          codeChunk.value = codeText;
        }
      }
      debugger;
      return h(ShikiCachedRenderer, {
        highlighter: highlighter.value,
        code: codeChunk.value,
        theme: "nord",
      });
    };
  },
});

const components = ["p", "h1", "h2", "h3", "li", "strong"] as const;

type ComponentsMap = NonNullable<Options["components"]>;

export const componentsMap = components.reduce((res, key) => {
  const item = {} as ComponentsMap;
  item[key] = defineComponent({
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
