import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { defineComponent, h, inject, ref } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender";
import { generateVueNode } from "../jsx";

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
        properties: {},
        children: [node],
      };
      parent.children[index] = tableNode;
    });
  };
};

export const TableRenderer = defineComponent({
  name: "table-renderer",
  inheritAttrs: false,
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const tableAst = props.node.children[0];
      function isElementTag(node: any, tag: string): boolean {
        return (
          node && node.type === "element" && (!tag || node.tagName === tag)
        );
      }

      function extractRows(sectionNode: any): any[] {
        return sectionNode.children
          .filter((n: any) => isElementTag(n, "tr"))
          .map((tr: any) => {
            return tr.children
              .filter(
                (n: any) => isElementTag(n, "th") || isElementTag(n, "td")
              )
              .map((cell: any) => {
                const children = cell.children || [];
                return {
                  ...cell,
                  children: [
                    {
                      type: "element",
                      tagName: "div",
                      properties: {
                        class: "vue-mdr-table-cell-content-wrapper",
                      },
                      children,
                    },
                  ],
                };
              });
          });
      }

      function extractTable(tableNode: any) {
        const theadNode = tableNode.children.find((n: any) =>
          isElementTag(n, "thead")
        );
        const tbodyNode = tableNode.children.find((n: any) =>
          isElementTag(n, "tbody")
        );

        return {
          thead: theadNode ? extractRows(theadNode) : [],
          tbody: tbodyNode ? extractRows(tbodyNode) : [],
        };
      }

      const { thead, tbody } = extractTable(tableAst);
      const { table } = inject("markdown-renderer-options") as ApiOptions;

      const TableRenderer = table?.renderer;
      if (TableRenderer) {
        function generateTextContent(node: any): string {
          if (node.type === "text") {
            return node.value;
          }
          if (node.type === "element") {
            return node.children.map(generateTextContent).join("");
          }
          return "";
        }
        const theadNode = thead[0].map((cell) =>
          cell.children[0].children.map(generateTextContent).join("")
        );
        const tbodyNode = tbody.map((row) =>
          row.map((cell) =>
            cell.children[0].children.map(generateTextContent).join("")
          )
        );
        // 只传递文本内容 和 ast
        return h(TableRenderer, {
          thead: theadNode,
          tbody: tbodyNode,
          ast: tableAst,
        });
      }
      return h(RawRender, { thead, tbody });
    };
  },
});

const RawRender = defineComponent({
  props: ["thead", "tbody"],
  setup(props) {
    return () => {
      const thead = h(
        "thead",
        { class: "vue-mdr-table-thead" },
        ...props.thead.map((row: any[]) =>
          h(
            "tr",
            row.map((cell: any) => generateVueNode(cell))
          )
        )
      );

      const tbody = h(
        "tbody",
        { class: "vue-mdr-table-tbody" },
        ...props.tbody.map((row: any[]) =>
          h(
            "tr",
            row.map((cell: any) => generateVueNode(cell))
          )
        )
      );

      const rawTable = h("table", { class: "vue-mdr-table" }, [thead, tbody]);

      return rawTable;
    };
  },
});
