import type { Root, TableRow } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkCompleteTable: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index == null) return;
      const text = node.children
        .filter((c) => c.type === "text")
        .map((c) => c.value)
        .join("");
      const lines = text.split("\n");
      // 行首符合| xxx |的语法
      if (/^\|.+\|/.test(lines[0])) {
        // 构建table节点
        const rows: TableRow[] = lines
          .filter((l) => !/^\|[\s|:-]+\|?$/.test(l)) // 去掉分隔行
          .map((line) => {
            return {
              type: "tableRow",
              children: line
                .split("|")
                .slice(1, -1)
                .map((c) => ({
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: c.trim(),
                    },
                  ],
                })),
            };
          });
        parent.children.splice(index, 1, {
          type: "table",
          children: rows,
        });
      }
    });
  };
};
