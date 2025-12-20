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

export const rehypeWrapTableCell: Plugin<[{ className?: string }?]> = (
  options
) => {
  const className = options?.className ?? "custom-td-th-content-wrap";

  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!isElement(node)) return;
      if (node.tagName !== "td" && node.tagName !== "th") return;
      if (!node.children || node.children.length === 0) return;

      // 只处理th、td元素
      // 避免重复包裹：如果th、td的第一个子元素span已经是我们标注的带有指定class的span，则跳过
      if (
        node.children.length === 1 &&
        isElement(node.children[0]) &&
        node.children[0].tagName === "span"
      ) {
        const first = node.children[0] as Element;
        const cls = first.properties?.className;
        const has = Array.isArray(cls)
          ? cls.includes(className)
          : cls === className;
        if (has) return;
      }

      const wrapped: Element = {
        type: "element",
        tagName: "span",
        properties: { className: [className] },
        children: node.children,
      };

      node.children = [wrapped];
    });
  };
};
