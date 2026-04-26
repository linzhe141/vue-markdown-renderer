import type { Element, ElementContent, Text } from "hast";
import { defineComponent, h, inject, type PropType } from "vue";
import { ApiOptions } from "../apiCreateMarkdownRender.js";
import { generateVueNode } from "../jsx.js";

type TableCellElement = Element & {
  tagName: "th" | "td";
};

type TableRowElement = Element & {
  tagName: "tr";
  children: TableCellElement[];
};

type TableSectionElement = Element & {
  tagName: "thead" | "tbody";
  children: TableRowElement[];
};

type TableAst = Element & {
  tagName: "table";
  children: TableSectionElement[];
};

type WrappedTableCellElement = TableCellElement & {
  children: [
    Element & {
      tagName: "div";
      children: ElementContent[];
    },
  ];
};

type TableRows = WrappedTableCellElement[][];

function isElementTag(node: ElementContent, tag: string): node is Element {
  return node.type === "element" && node.tagName === tag;
}

function wrapTableCell(cell: TableCellElement): WrappedTableCellElement {
  return {
    ...cell,
    children: [
      {
        type: "element",
        tagName: "div",
        properties: {
          class: "vue-mdr-table-cell-content-wrapper",
        },
        children: cell.children,
      },
    ],
  };
}

function extractRows(sectionNode: TableSectionElement): TableRows {
  return sectionNode.children
    .filter((node): node is TableRowElement => isElementTag(node, "tr"))
    .map((row) =>
      row.children
        .filter(
          (cell): cell is TableCellElement =>
            isElementTag(cell, "th") || isElementTag(cell, "td")
        )
        .map(wrapTableCell)
    );
}

function extractTable(tableNode: TableAst) {
  const theadNode = tableNode.children.find((node) => isElementTag(node, "thead"));
  const tbodyNode = tableNode.children.find((node) => isElementTag(node, "tbody"));

  return {
    thead: theadNode ? extractRows(theadNode as TableSectionElement) : [],
    tbody: tbodyNode ? extractRows(tbodyNode as TableSectionElement) : [],
  };
}

function generateTextContent(node: ElementContent | Text): string {
  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "element") {
    return node.children.map(generateTextContent).join("");
  }

  return "";
}

export const TableRenderer = defineComponent({
  name: "table-renderer",
  inheritAttrs: false,
  props: {
    ast: {
      type: Object as PropType<TableAst>,
      required: true,
    },
  },
  setup(props) {
    const { table } = inject("markdown-renderer-options") as ApiOptions;

    return () => {
      const { thead, tbody } = extractTable(props.ast);
      const CustomTableRenderer = table?.renderer;

      if (CustomTableRenderer) {
        const theadNode = (thead[0] ?? []).map((cell) =>
          cell.children[0].children.map(generateTextContent).join("")
        );
        const tbodyNode = tbody.map((row) =>
          row.map((cell) =>
            cell.children[0].children.map(generateTextContent).join("")
          )
        );

        return h(CustomTableRenderer, {
          thead: theadNode,
          tbody: tbodyNode,
          ast: props.ast,
        });
      }

      return h(RawRender, { thead, tbody });
    };
  },
});

const RawRender = defineComponent({
  props: {
    thead: {
      type: Array as PropType<TableRows>,
      required: true,
    },
    tbody: {
      type: Array as PropType<TableRows>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const thead = h(
        "thead",
        { class: "vue-mdr-table-thead" },
        props.thead.map((row) => h("tr", row.map(generateVueNode)))
      );

      const tbody = h(
        "tbody",
        { class: "vue-mdr-table-tbody" },
        props.tbody.map((row) => h("tr", row.map(generateVueNode)))
      );

      return h("table", { class: "vue-mdr-table" }, [thead, tbody]);
    };
  },
});
