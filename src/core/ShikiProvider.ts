import { inject, provide, defineComponent, ref, onMounted } from "vue";
import { initShikiHighlighter } from "./highlight/shiki";
import { type Highlighter } from "shiki";
import { shikiHighlightCoreKey } from "./symbol";

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
