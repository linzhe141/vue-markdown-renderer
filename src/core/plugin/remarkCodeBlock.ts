import type { Root, Code } from "mdast";
import type { Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkCodeMeta: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index, parent) => {
      let hasParsedMetaSuccess = false;
      const hasMeta = node.meta != null;
      if (hasMeta) {
        try {
          JSON.parse(node.meta!);
          hasParsedMetaSuccess = true;
        } catch (e) {
          //
        }
      }

      const preHastNode: any | null = {
        type: "element",
        data: {
          hName: "pre",
          hProperties: Object.assign(
            {
              lang: node.lang,
              code: node.value,
            },
            {
              meta: hasMeta && hasParsedMetaSuccess ? node.meta : "",
            }
          ),
        },
      };

      if (index != null && parent) {
        parent.children.splice(index, 1, preHastNode);
      }
    });
  };
};
