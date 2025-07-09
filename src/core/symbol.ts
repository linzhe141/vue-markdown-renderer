import type { Highlighter } from "shiki";
import type { Component, ComputedRef, InjectionKey, Ref } from "vue";
import { Langs } from "./highlight/shiki";

export const shikiHighlightCoreKey = Symbol() as InjectionKey<
  Ref<Highlighter | null>
>;

export const configKey = Symbol() as InjectionKey<
  ComputedRef<{ theme: "dark" | "light"; extraLangs: Langs[] }>
>;

export const componentsMapKey = Symbol() as InjectionKey<
  Record<string, Component>
>;
