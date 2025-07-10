# VueMarkdownRenderer

A Vue.js markdown component with enhanced features, utilizing efficient DOM rendering through Vue's virtual DOM.

[live demo](https://linzhe141.github.io/vue-markdown-renderer/)

## Features

- Vue-powered rendering engine for optimal DOM updates
- Syntax highlighting power by shiki
- Seamless Vue.js integration
- Vercel theme code blocks support dark and light mode
- Support rendering Vue components using `component-json` code blocks
- Extensible LaTeX support through remark-math and rehype-katex — simply pass them as plugins

## Installation

```bash
npm install vue-mdr
```

## Usage

You can add css animations for `.text-segmenter` and `shiki-stream token` to improve user experience like LLM outputs.

```css
/* animation.css */
.vue-markdown-wrapper > *,
.vue-markdown-wrapper .text-segmenter,
.vue-markdown-wrapper .shiki-stream span {
  animation: fade-in 0.5s ease-in-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

then use this animation, And you can also use @tailwindcss/typography, or other typography tools to beautify the page.

````vue
<script setup>
import { VueMarkdownRenderer } from "../../src";
import { onMounted, ref } from "vue";
import "./animation.css";
import Button from "./Button.vue";
// add extrl lang for code block
import java from "@shikijs/langs/java";
// support latex
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// support vue-components
import BarChart from "./BarChart.vue";

function createStream(text, chunkSize = 15, delay = 50) {
  let position = 0;

  return new ReadableStream({
    pull(controller) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (position >= text.length) {
            controller.close();
            resolve();
            return;
          }
          const chunk = text.slice(position, position + chunkSize);
          position += chunkSize;
          controller.enqueue(chunk);
          resolve();
        }, delay);
      });
    },
  });
}
const mdText = ref("");
const isRender = ref(true);

async function clickHandle() {
  mdText.value = "";
  isRender.value = true;
  const res = await fetch("./md.md");
  const md = await res.text();
  const stream = createStream(convertLatexDelimiters(md));
  for await (const chunk of stream) {
    mdText.value += chunk;
  }
  isRender.value = false;
}

onMounted(clickHandle);

function convertLatexDelimiters(text) {
  const pattern =
    /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replaceAll(
    pattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      if (codeBlock !== undefined) {
        return codeBlock;
      } else if (squareBracket !== undefined) {
        return `$$${squareBracket}$$`;
      } else if (roundBracket !== undefined) {
        return `$${roundBracket}$`;
      }
      return match;
    }
  );
}

const switchTheme = ref("dark");

function changeTheme() {
  if (switchTheme.value === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  switchTheme.value = switchTheme.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <div>
    <article
      class="vue-markdown-wrapper prose prose-slate dark:prose-invert mx-auto my-10"
    >
      <VueMarkdownRenderer
        :source="mdText"
        :extra-langs="[java]"
        :theme="switchTheme === 'dark' ? 'light' : 'dark'"
        :remark-plugins="[remarkMath]"
        :rehype-plugins="[rehypeKatex]"
        :components-map="{
          BarChart,
        }"
      ></VueMarkdownRenderer>
    </article>
  </div>
</template>
````

Supports rendering custom Vue components through component-json code blocks. Each code block should contain a JSON object with the following structure:

- type: The key in componentsMap that corresponds to a registered Vue component.

- props: An object containing the props to be passed to that component.

Additionally, the code block's meta information can include:

- placeholder (optional): Specifies a placeholder Vue component to render before the JSON content is fully parsed. For example: {"placeholder": "LoadingSkeleton"}.

If no placeholder is specified, a default fallback will be rendered `h("div", { class: "vue-mdr-default-component-placeholder" })`.

````markdown
```component-json {"placeholder": "Placeholder"}
{"type":"BarChart", "props": {"chartData": { "categories": ["type1", "type2", "type3"], "seriesData": [100, 200, 150] }}}
```
````

```component-json {"placeholder": "Placeholder"}
{"type":"BarChart", "props": {"chartData": { "categories": ["type1", "type2", "type3"], "seriesData": [100, 200, 150] }}}
```

test for extra lang `java`

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

test for latex

$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} & = 0
\end{align}
$$
