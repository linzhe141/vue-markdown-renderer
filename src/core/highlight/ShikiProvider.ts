import { inject, provide, defineComponent, ref, onMounted } from "vue";
import { type Highlighter } from "shiki";
import { initShikiHighlighter } from "./shiki.js";
import { shikiHighlightCoreKey } from "../symbol.js";

export const ShikiProvider = defineComponent({
  setup(_, { slots }) {
    const highlighter = ref<Highlighter | null>(null);
    provide(shikiHighlightCoreKey, highlighter);

    onMounted(async () => {
      const _highlighter = await initShikiHighlighter();
      highlighter.value = _highlighter;
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
