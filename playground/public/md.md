# VueMarkdownRenderer

A Vue.js markdown component with enhanced features, utilizing efficient DOM rendering through Vue's virtual DOM.

[live demo](https://linzhe141.github.io/vue-markdown-renderer/)

## Features

- Vue-powered rendering engine for optimal DOM updates
- Syntax highlighting power by shiki
- Seamless Vue.js integration

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

then use this animation

```vue
<script setup>
import { VueMarkdownRenderer } from "vue-mdr";
import { onMounted, ref } from "vue";
// use this animation
import "./animation.css";
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
</script>

<template>
  <div>
    <button @click="clickHandle" :disabled="isRender">re-grenerate ~</button>
    <article class="vue-markdown-wrapper">
      <VueMarkdownRenderer :md="mdText"></VueMarkdownRenderer>
    </article>
  </div>
</template>
```
