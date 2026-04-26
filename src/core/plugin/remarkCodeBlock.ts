import type { Element, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type CodeElement = Element & {
  tagName: "code";
  children: Text[];
  properties: {
    className?: string[];
  };
  data?: {
    meta?: string;
  };
};

type PreElement = Element & {
  tagName: "pre";
  children: [CodeElement, ...Element["children"]];
  properties: {
    meta?: string;
    lang?: string;
    code?: string;
  };
};

function isCodeElement(node: Element | undefined): node is CodeElement {
  return node?.tagName === "code";
}

function isPreElement(node: Element): node is PreElement {
  return node.tagName === "pre" && isCodeElement(node.children[0] as Element);
}

function getLanguage(className: string[] | undefined): string {
  const languageClass = className?.find((item) => item.startsWith("language-"));
  return languageClass ? languageClass.replace("language-", "") : "";
}

function getCodeValue(children: Text[]): string {
  return children.map((child) => child.value).join("");
}

export const rehypeCodeMeta: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (!isPreElement(node)) return;

      const codeNode = node.children[0];
      node.properties = {
        ...node.properties,
        meta: codeNode.data?.meta ?? "",
        lang: getLanguage(codeNode.properties.className),
        code: getCodeValue(codeNode.children),
      };
    });
  };
};
