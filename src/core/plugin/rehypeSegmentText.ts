import { type ElementContent, type Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type Options = {
  locale?: string;
};

export const rehypeSegmentText: Plugin<[Options?], Root> = (options) => {
  const segmenter = new Intl.Segmenter(options?.locale ?? "zh", {
    granularity: "word",
  });

  return (tree) => {
    visit(tree, "element", (node) => {
      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong"].includes(
          node.tagName
        ) &&
        node.children
      ) {
        const newChildren: ElementContent[] = [];
        for (const child of node.children) {
          if (child.type === "text") {
            const segments = segmenter.segment(child.value);
            const words = [...segments]
              .map((segment) => segment.segment)
              .filter(Boolean);
            words.forEach((word) => {
              newChildren.push({
                children: [{ type: "text", value: word }],
                properties: {
                  className: "text-segmenter",
                },
                tagName: "span",
                type: "element",
              });
            });
          } else {
            newChildren.push(child);
          }
        }
        node.children = newChildren;
      }
    });
  };
};
