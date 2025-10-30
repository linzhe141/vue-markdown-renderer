import {
  type Highlighter,
  createHighlighterCore,
  createOnigurumaEngine,
} from "shiki";
import { shikiTheme } from "./codeTheme.js";
let highlighter: Highlighter | null = null;

export type Langs = Parameters<Highlighter["loadLanguage"]>[0];
export const defaultLangs = {
  json: import("@shikijs/langs/json"),
  bash: import("@shikijs/langs/bash"),
  vue: import("@shikijs/langs/vue"),
  ts: import("@shikijs/langs/ts"),
  tsx: import("@shikijs/langs/tsx"),
  css: import("@shikijs/langs/css"),
  html: import("@shikijs/langs/html"),
  python: import("@shikijs/langs/python"),
  go: import("@shikijs/langs/go"),
  rust: import("@shikijs/langs/rust"),
};

export async function initShikiHighlighter() {
  if (highlighter) return highlighter;
  const _highlighter = await createHighlighterCore({
    themes: [shikiTheme],
    langs: Object.values(defaultLangs),
    engine: createOnigurumaEngine(() => import("shiki/wasm")),
  });
  highlighter = _highlighter as Highlighter;
  return highlighter;
}
