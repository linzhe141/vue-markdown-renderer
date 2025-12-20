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

export const rehypeWrapTables: Plugin<[{ className?: string }?]> = (
  options
) => {
  const className = options?.className ?? "custom-table-wrapper";

  return (tree: any) => {
    visit(
      tree,
      "element",
      (node: any, index: number | undefined | null, parent: any) => {
        if (!parent || index == null) return;
        if (!isElement(node)) return;
        if (node.tagName !== "table") return;
        // 只处理table元素
        // 避免重复包裹：如果table的父元素已经被我们标注的带有指定class的div包裹，则跳过
        if (isElement(parent) && parent.tagName === "div") {
          const cls = parent.properties?.className;
          const has = Array.isArray(cls)
            ? cls.includes(className)
            : cls === className;
          if (has) return;
        }

        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: [className] },
          children: [node],
        };

        parent.children[index] = wrapper;
      }
    );
  };
};
