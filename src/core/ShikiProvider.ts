import { inject, provide, defineComponent, ref, onMounted } from "vue";
import {
  type Highlighter,
  createHighlighterCore,
  createOnigurumaEngine,
} from "shiki";
import { shikiHighlightCoreKey } from "./symbol";

let highlighter: Highlighter | null = null;

export const langs = {
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

async function initShikiHighlighter() {
  if (highlighter) return highlighter;
  const _highlighter = await createHighlighterCore({
    themes: [import("@shikijs/themes/light-plus")],
    langs: Object.values(langs),
    engine: createOnigurumaEngine(() => import("shiki/wasm")),
  });
  highlighter = _highlighter as Highlighter;
  return highlighter;
}

export const ShikiProvider = defineComponent({
  setup(_, { slots }) {
    const highlighter = ref<Highlighter | null>(null);
    provide(shikiHighlightCoreKey, highlighter);
    onMounted(async () => {
      highlighter.value = await initShikiHighlighter();
    });
    return () => {
      // @ts-expect-error
      return slots.default();
    };
  },
});

export function useShiki() {
  const highlighter = inject(shikiHighlightCoreKey);
  return {
    highlighter,
  };
}
