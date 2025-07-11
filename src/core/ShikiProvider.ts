import { inject, provide, defineComponent, ref, onMounted } from "vue";
import { initShikiHighlighter } from "./highlight/shiki";
import { type Highlighter } from "shiki";
import { configKey, shikiHighlightCoreKey } from "./symbol";

export const ShikiProvider = defineComponent({
  setup(_, { slots }) {
    const highlighter = ref<Highlighter | null>(null);
    provide(shikiHighlightCoreKey, highlighter);
    const config = inject(configKey)!;
    onMounted(async () => {
      const _highlighter = await initShikiHighlighter();
      for (const lang of config.value.extraLangs) {
        await _highlighter.loadLanguage(lang);
      }
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
