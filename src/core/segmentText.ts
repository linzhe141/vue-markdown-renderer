import type { Options } from "hast-util-to-jsx-runtime";
import {
  defineComponent,
  h,
  type PropType,
  type VNode,
  type Component,
} from "vue";
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
