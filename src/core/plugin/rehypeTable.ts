import type { Element, ElementContent, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function isElement(node: ElementContent): node is Element {
  return (
    node.type === "element" &&
    typeof node.tagName === "string" &&
    Array.isArray(node.children)
  );
}

export const rehypeTable: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return;
      if (!isElement(node)) return;
      if (node.tagName !== "table") return;

      const tableNode: Element = {
        type: "element",
        tagName: "TableRenderer",
        properties: {
          // @ts-expect-error use js object because this plugin after run in rehype,
          // so we can use js object to store the original ast node
          ast: node,
        },
        children: [],
      };
      parent.children.splice(index, 1, tableNode);
    });
  };
};
