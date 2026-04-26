import { defineComponent, h, inject } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";
import { generateVueNode } from "../jsx.js";

export const TableRenderer = defineComponent({
  name: "table-renderer",
  inheritAttrs: false,
  props: {
    ast: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const tableAst = props.ast;
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
        props.thead.map((row: any[]) => h("tr", row.map(generateVueNode)))
      );

      const tbody = h(
        "tbody",
        { class: "vue-mdr-table-tbody" },
        props.tbody.map((row: any[]) => h("tr", row.map(generateVueNode)))
      );

      const rawTable = h("table", { class: "vue-mdr-table" }, [thead, tbody]);

      return rawTable;
    };
  },
});
