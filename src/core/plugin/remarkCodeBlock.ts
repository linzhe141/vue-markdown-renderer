import type { Root, Code } from "mdast";
import type { Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkCodeMeta: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      let meta = {};
      let parsedSucess = false;
      try {
        meta = node.meta ? JSON.parse(node.meta) : {};
        parsedSucess = true;
      } catch (e) {
        //
      }
      let preHastNode: any | null = null;
      if (parsedSucess) {
        preHastNode = {
          type: "element",
          data: {
            hName: "pre",
            hProperties: {
              meta: node.meta ?? "",
              lang: node.lang,
              code: node.value,
            },
          },
        };
      }

      if (index != null && parent) {
        if (preHastNode) parent.children.splice(index, 1, preHastNode);
        else parent.children.splice(index, 1);
      }
    });
  };
};
