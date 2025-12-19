import type { Highlighter } from "shiki";
import type { InjectionKey, Ref } from "vue";

export const shikiHighlightCoreKey = Symbol() as InjectionKey<
  Ref<Highlighter | null>
>;

export const configPropsKey = Symbol() as InjectionKey<{
  source: string;
  theme: "dark" | "light";
}>;
