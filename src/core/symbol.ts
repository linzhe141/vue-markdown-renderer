import type { Highlighter } from "shiki";
import type { InjectionKey, Ref } from "vue";
import type { Processor } from "unified";
import type { ResolvedApiOptions } from "./apiCreateMarkdownRender.js";

export const shikiHighlightCoreKey = Symbol() as InjectionKey<
  Ref<Highlighter | null>
>;

export const configPropsKey = Symbol() as InjectionKey<{
  source: string;
  theme: "dark" | "light";
}>;

export const markdownRendererOptionsKey = Symbol() as InjectionKey<ResolvedApiOptions>;

export const markdownRendererProcessorKey = Symbol() as InjectionKey<
  Processor<any, any, any, any, any>
>;
