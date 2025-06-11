import {
  type Highlighter,
  createHighlighterCore,
  createOnigurumaEngine,
} from "shiki";

let highlighter: Highlighter | null = null;

export async function initShikiHighlighter() {
  if (highlighter) return highlighter;
  const _highlighter = await createHighlighterCore({
    themes: [import("@shikijs/themes/nord")],
    langs: [
      import("@shikijs/langs/json"),
      import("@shikijs/langs/ts"),
      import("@shikijs/langs/vue"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/sass"),
    ],
    engine: createOnigurumaEngine(() => import("shiki/wasm")),
  });
  highlighter = _highlighter as Highlighter;
  return highlighter;
}

export function codeToHtml(input: string, lang: string) {
  const html = highlighter!.codeToHtml(input, {
    lang,
    theme: "nord",
  });
  return html;
}
