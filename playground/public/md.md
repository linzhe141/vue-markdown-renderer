<think>
- Vue-powered rendering engine for optimal DOM updates
- Syntax highlighting power by shiki
- Seamless Vue.js integration
- Vercel theme code blocks support dark and light mode
- Support rendering Vue components using `component-json` code blocks
- Support rendering echart options using `echarts` code blocks
- Extensible LaTeX support through remark-math and rehype-katex — simply pass them as plugins
- Custom code block renderer support via codeBlockRenderer prop — enables full control over how specific code blocks are rendered, with access to highlightVnode and language props
</think>
# VueMarkdownRenderer

A Vue.js markdown component with enhanced features, utilizing efficient DOM rendering through Vue's virtual DOM.

[live demo](https://linzhe141.github.io/vue-markdown-renderer/)

## Features

- Vue-powered rendering engine for optimal DOM updates
- Syntax highlighting power by shiki
- Seamless Vue.js integration
- Vercel theme code blocks support dark and light mode
- Support rendering Vue components using `component-json` code blocks
- Support rendering echart options using `echarts` code blocks
- Extensible LaTeX support through remark-math and rehype-katex — simply pass them as plugins
- Custom code block renderer support via codeBlockRenderer prop — enables full control over how specific code blocks are rendered, with access to highlightVnode and language props

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

### Custom Code Block Rendering

You can take full control over how code blocks are rendered by passing a `codeBlockRenderer` component to the `VueMarkdownRenderer`. This component receives two props:

- `highlightVnode`: a `VNode` containing the syntax-highlighted content powered by Shiki.
- `language`: a `string` representing the detected language of the code block.

This is useful when you want to add features like copy buttons, custom themes, header labels, or animations around your code blocks.

Example Usage

```vue
<VueMarkdownRenderer
  :source="mdText"
  :code-block-renderer="CodeBlockRenderer"
  :theme="switchTheme === 'dark' ? 'light' : 'dark'"
/>
```

```vue
<script setup lang="ts">
import { ref, computed, VNode } from "vue";

const props = defineProps<{
  highlightVnode: VNode;
  language: string;
}>();

const copied = ref(false);
const contentRef = ref<HTMLElement>();

function copyHandle() {
  if (!contentRef.value) return;
  navigator.clipboard.writeText(contentRef.value.textContent || "");
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const langLabel = computed(() => props.language?.toUpperCase() || "TEXT");
</script>

<template>
  <div
    class="relative my-4 w-0 min-w-full overflow-hidden rounded-lg bg-[#ededed] text-sm shadow dark:bg-[#171717]"
  >
    <!-- Header bar -->
    <div
      class="flex items-center justify-between bg-[#2f2f2f] p-2 text-[#cdcdcd]"
    >
      <span class="text-xs uppercase tracking-wider text-gray-400">
        {{ langLabel }}
      </span>
      <div class="relative cursor-pointer p-1" @click="copyHandle">
        <template v-if="copied">
          <div class="absolute -left-16 -top-6 z-10">
            <pre
              class="rounded bg-slate-100 px-2 py-1 text-sm text-green-500 dark:bg-black"
            >
Copied!</pre
            >
          </div>
          <svg
            class="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </template>
        <template v-else>
          <svg
            class="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h11v16z"
            />
          </svg>
        </template>
      </div>
    </div>

    <!-- Code block -->
    <div
      ref="contentRef"
      class="not-prose overflow-auto px-3 py-2 font-mono leading-relaxed text-gray-100"
    >
      <component :is="props.highlightVnode" />
    </div>
  </div>
</template>
```

This gives you complete flexibility over how code blocks appear and behave in your markdown rendering flow — great for documentation platforms, MDX-like previews, or blogging engines.

### Supports rendering custom Vue components through component-json code blocks. Each code block should contain a JSON object with the following structure:

- type: The key in componentsMap that corresponds to a registered Vue component.

- props: An object containing the props to be passed to that component.

Additionally, the code block's meta information can include:

- placeholder (optional): Specifies a placeholder Vue component to render before the JSON content is fully parsed. For example: {"placeholder": "LoadingSkeleton"}.

If no placeholder is specified, a default fallback will be rendered `h("div", { class: "vue-mdr-default-component-placeholder" })`.

````markdown
```component-json {"placeholder": "Placeholder"}
{"type":"BarChart","props":{"chartData":{"categories":["type1","type2","type3","type4","type5","type6","type7","type8","type9","type10","type11","type12","type13","type14","type15","type16","type17","type18","type19","type20"],"seriesData":[100,200,150,180,120,130,170,160,190,210,220,140,125,155,165,175,185,195,205,215]}}}
```
````

```component-json {"placeholder": "Placeholder"}
{"type":"BarChart","props":{"chartData":{"categories":["type1","type2","type3","type4","type5","type6","type7","type8","type9","type10","type11","type12","type13","type14","type15","type16","type17","type18","type19","type20"],"seriesData":[100,200,150,180,120,130,170,160,190,210,220,140,125,155,165,175,185,195,205,215]}}}
```

### Supports rendering ECharts code blocks

In addition to `component-json` code blocks, you can directly render ECharts.
The content of the code block should be a valid ECharts configuration object (`option`).

#### Usage

````markdown
```echarts
{
  "title": {
    "text": "数据对比趋势变化",
    "left": "center"
  },
  "tooltip": {
    "trigger": "axis",
    "axisPointer": {
      "type": "cross",
      "crossStyle": { "color": "#999" }
    },
    "formatter": "{b}<br/>{a0}: {c0}"
  },
  "legend": {
    "data": ["本期"],
    "top": "bottom"
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "10%",
    "containLabel": true
  },
  "xAxis": [
    {
      "type": "category",
      "data": ["xxx", "zzz"],
      "axisPointer": { "type": "shadow" }
    }
  ],
  "yAxis": [
    {
      "type": "value",
      "name": "数值",
      "min": 0,
      "axisLabel": { "formatter": "{value}" }
    }
  ],
  "series": [
    {
      "name": "本期",
      "type": "bar",
      "data": [5061.1429, 504.8844],
      "itemStyle": { "color": "#3ba272" }
    }
  ]
}
```
````
```echarts
{
  "title": {
    "text": "数据对比趋势变化",
    "left": "center"
  },
  "tooltip": {
    "trigger": "axis",
    "axisPointer": {
      "type": "cross",
      "crossStyle": { "color": "#999" }
    },
    "formatter": "{b}<br/>{a0}: {c0}"
  },
  "legend": {
    "data": ["本期"],
    "top": "bottom"
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "10%",
    "containLabel": true
  },
  "xAxis": [
    {
      "type": "category",
      "data": ["xxx", "zzz"],
      "axisPointer": { "type": "shadow" }
    }
  ],
  "yAxis": [
    {
      "type": "value",
      "name": "数值",
      "min": 0,
      "axisLabel": { "formatter": "{value}" }
    }
  ],
  "series": [
    {
      "name": "本期",
      "type": "bar",
      "data": [5061.1429, 504.8844],
      "itemStyle": { "color": "#3ba272" }
    }
  ]
}
```
#### Placeholder Support

If you want to show a placeholder while rendering the chart, you can set the `:echart-renderer-placeholder` prop in `<VueMarkdownRenderer>`:

```vue
<VueMarkdownRenderer
  :source="mdText"
  :theme="switchTheme === 'dark' ? 'light' : 'dark'"
  :echart-renderer="EchartRenderer"
  :echart-renderer-placeholder="Placeholder"
/>
```

If no placeholder is specified, a default fallback will be rendered:

```js
h("div", { class: "vue-mdr-default-echart-placeholder" })
```

### extra lang `java`

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

### test latex render

$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} & = \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} & = 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} & = \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} & = 0
\end{align}
$$


### test image render

![img](https://github.com/user-attachments/assets/01b679c8-681c-4ce0-bcce-91742b40e7b4)
