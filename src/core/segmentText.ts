import { type Component, defineComponent, h, type PropType } from "vue";

export interface TextNode {
  type: "text";
  value: string;
}

export interface ElementNode {
  type: "element";
  tagName: string;
  properties: Record<string, any>;
  children: (TextNode | ElementNode)[];
}

export type Node = TextNode | ElementNode;

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

export const segmentTextComponents = ["p", "h1", "h2", "h3", "li"].reduce(
  (res, key) => {
    const item = {} as {
      [x: string]: Component;
    };
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
  {} as {
    [x: string]: Component;
  }
);
