# VueMarkdownRenderer

A Vue.js markdown component with enhanced features, utilizing efficient DOM rendering through Vue's virtual DOM.

[live demo](https://linzhe141.github.io/vue-markdown-renderer/)

## Features

- Vue-powered rendering engine for optimal DOM updates
- Syntax highlighting power by shiki
- Seamless Vue.js integration
- Vercel theme code blocks support dark and light mode

## Installation

```bash
npm install vue-mdr
```

## 支持使用`component-json`代码块渲染vue组件

```component-json
{"type":"BarChart",  "props": {"chartData": { "categories": ["type1", "type2", "type3"], "seriesData": [100, 200, 150] }}}
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

```vue
<script setup>
import { VueMarkdownRenderer } from "../../src";
import { onMounted, ref } from "vue";
import "./animation.css";
import Button from "./Button.vue";
// add extrl lang for code block
import java from "@shikijs/langs/java";

function createStream(text, chunkSize = 10, delay = 50) {
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
  const stream = createStream(md);
  for await (const chunk of stream) {
    mdText.value += chunk;
  }
  isRender.value = false;
}
onMounted(clickHandle);

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
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      "
      class="p-2"
    >
      <Button @click="clickHandle" :disabled="isRender">re-grenerate ~</Button>

      <Button @click="changeTheme">change theme to {{ switchTheme }}</Button>
    </div>
    <article
      class="vue-markdown-wrapper prose prose-slate dark:prose-invert mx-auto my-10"
    >
      <VueMarkdownRenderer
        :source="mdText"
        :extra-langs="[java]"
        :theme="switchTheme === 'dark' ? 'light' : 'dark'"
      ></VueMarkdownRenderer>
    </article>
  </div>
</template>
```

test for extra lang `java`

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```
