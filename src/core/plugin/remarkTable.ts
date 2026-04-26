import type { Paragraph, Root, Table, TableCell, TableRow, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function isText(node: Paragraph["children"][number]): node is Text {
  return node.type === "text";
}

function createTableCell(value: string): TableCell {
  return {
    type: "tableCell",
    children: [
      {
        type: "text",
        value: value.trim(),
      },
    ],
  };
}

function createTableRow(line: string): TableRow {
  return {
    type: "tableRow",
    children: line.split("|").slice(1, -1).map(createTableCell),
  };
}

function createTable(lines: string[]): Table {
  return {
    type: "table",
    align: [],
    children: lines
      .filter((line) => !/^\|[\s|:-]+\|?$/.test(line))
      .map(createTableRow),
  };
}

export const remarkCompleteTable: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "paragraph", (node: Paragraph, index, parent) => {
      if (!parent || index == null) return;

      const text = node.children.filter(isText).map((child) => child.value).join("");
      const lines = text.split("\n");
      if (/^\|.+\|/.test(lines[0] ?? "")) {
        parent.children.splice(index, 1, createTable(lines));
      }
    });
  };
};
