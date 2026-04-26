import type { Root, Code } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkCodeMeta: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      const preHastNode: any | null = {
        type: "element",
        data: {
          hName: "pre",
          hProperties: {
            lang: node.lang,
            code: node.value,
            meta: node.meta ?? "",
          },
        },
      };

      if (index != null && parent) {
        parent.children.splice(index, 1, preHastNode);
      }
    });
  };
};
