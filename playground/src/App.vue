<script setup>
import { VueMarkdownRenderer } from "../../src";
import { ref } from "vue";
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
const isRender = ref(false);
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
</script>

<template>
  <div>
    <button @click="clickHandle" :disabled="isRender">grenerate ~</button>
    <article class="vue-markdown-wrapper">
      <VueMarkdownRenderer :md="mdText"></VueMarkdownRenderer>
    </article>
  </div>
</template>
