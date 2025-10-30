import { type CSSProperties } from "vue";
import { createCssVariablesTheme } from "./theme-css-variables.js";
export const FONTS = [
  "jetbrains-mono",
  "geist-mono",
  "ibm-plex-mono",
  "fira-code",
  "soehne-mono",
] as const;

export type Font = (typeof FONTS)[number];

export const shikiTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--vercel-code-block-",
  variableDefaults: {},
  fontStyle: true,
});

type ShikiSyntaxObject = {
  background: string;
  /* foreground is also used as caret color */
  foreground: string;
  /* rest is optional as syntax might come from a textmate source */
  constant?: string;
  string?: string;
  comment?: string;
  keyword?: string;
  parameter?: string;
  function?: string;
  stringExpression?: string;
  punctuation?: string;
  link?: string;
  number?: string;
  property?: string;
  highlight?: string;
  highlightBorder?: string;
  highlightHover?: string;
};

function convertToShikiTheme(syntaxObject: ShikiSyntaxObject): CSSProperties {
  if (!syntaxObject) {
    return {};
  }

  return {
    "--vercel-code-block-background": syntaxObject.background,
    "--vercel-code-block-foreground": syntaxObject.foreground,
    "--vercel-code-block-token-constant": syntaxObject.constant,
    "--vercel-code-block-token-string": syntaxObject.string,
    "--vercel-code-block-token-comment": syntaxObject.comment,
    "--vercel-code-block-token-keyword": syntaxObject.keyword,
    "--vercel-code-block-token-parameter": syntaxObject.parameter,
    "--vercel-code-block-token-function": syntaxObject.function,
    "--vercel-code-block-token-string-expression":
      syntaxObject.stringExpression,
    "--vercel-code-block-token-punctuation": syntaxObject.punctuation,
    "--vercel-code-block-token-link": syntaxObject.link,
    "--vercel-code-block-token-number": syntaxObject.number,
    "--vercel-code-block-token-property": syntaxObject.property,
    "--vercel-code-block-highlight": syntaxObject.highlight,
    "--vercel-code-block-highlight-border": syntaxObject.highlightBorder,
    "--vercel-code-block-highlight-hover": syntaxObject.highlightHover,
  } as CSSProperties;
}

export const THEME = {
  light: convertToShikiTheme({
    background: "hsla(0, 0%, 93%,1)",
    foreground: "hsla(0, 0%, 9%,1)",
    constant: "oklch(53.18% 0.2399 256.9900584162342)",
    string: "oklch(51.75% 0.1453 147.65)",
    comment: "hsla(0, 0%, 40%,1)",
    keyword: "oklch(53.5% 0.2058 2.84)",
    parameter: "oklch(52.79% 0.1496 54.65)",
    function: "oklch(47.18% 0.2579 304)",
    stringExpression: "oklch(51.75% 0.1453 147.65)",
    punctuation: "hsla(0, 0%, 9%,1)",
    link: "oklch(51.75% 0.1453 147.65)",
    number: "#111111",
    property: "oklch(53.18% 0.2399 256.9900584162342)",
    highlight: "oklch(94.58% 0.0293 249.84870859673202)",
    highlightHover: "oklch(94.58% 0.0293 249.84870859673202 / 30%)",
    highlightBorder: "oklch(53.18% 0.2399 256.9900584162342)",
  }),
  dark: convertToShikiTheme({
    background: "hsla(0, 0%, 9%,1)",
    foreground: "hsla(0, 0%, 93%,1)",
    constant: "oklch(71.7% 0.1648 250.79360374054167)",
    string: "oklch(73.1% 0.2158 148.29)",
    comment: "hsla(0, 0%, 63%,1)",
    keyword: "oklch(69.36% 0.2223 3.91)",
    parameter: "oklch(77.21% 0.1991 64.28)",
    function: "oklch(69.87% 0.2037 309.51)",
    stringExpression: "oklch(73.1% 0.2158 148.29)",
    punctuation: "hsla(0, 0%, 93%,1)",
    link: "oklch(73.1% 0.2158 148.29)",
    number: "#ffffff",
    property: "oklch(71.7% 0.1648 250.79360374054167)",
    highlight: "oklch(30.86% 0.1022 255.21)",
    highlightHover: "oklch(30.86% 0.1022 255.21 / 30%)",
    highlightBorder: "oklch(71.7% 0.1648 250.79360374054167)",
  }),
};
