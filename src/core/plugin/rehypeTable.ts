import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type Element = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: any[];
};

function isElement(node: any): node is Element {
  return (
    node &&
    node.type === "element" &&
    typeof node.tagName === "string" &&
    Array.isArray(node.children)
  );
}

export const rehypeTable: Plugin = () => {
  return (tree: any) => {
    visit(tree, "element", (node: any, index, parent) => {
      if (!parent || index == null) return;
      if (!isElement(node)) return;
      if (node.tagName !== "table") return;

      const tableNode: Element = {
        type: "element",
        tagName: "TableRenderer",
        properties: {
          ast: node,
        },
        children: [],
      };
      parent.children[index] = tableNode;
    });
  };
};
