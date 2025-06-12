import type { Highlighter } from "shiki";
import type { InjectionKey, Ref } from "vue";

export const shikiHighlightCoreKey = Symbol() as InjectionKey<
  Ref<Highlighter | null>
>;
