import type { Highlighter } from "shiki";
import type { Component, InjectionKey, Ref } from "vue";
import { Langs } from "./highlight/shiki";

export const shikiHighlightCoreKey = Symbol() as InjectionKey<
  Ref<Highlighter | null>
>;

export const configPropsKey = Symbol() as InjectionKey<{
  source: string;
  theme: "dark" | "light";
  extraLangs: Langs[];
  codeBlockRenderer: Component | undefined;
  componentsMap: Record<string, Component>;
}>;
