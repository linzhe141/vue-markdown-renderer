<script setup>
import { onMounted, ref } from "vue";
import "./animation.css";

import { md } from "./md";
import Content from "./demo/think/Content.vue";
// const IS_DEMO = new URLSearchParams(location.search).get("demo");
const IS_DEMO = true;
function createStream(text, chunkSize = 2, delay = 10) {
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
const contentText = ref("");
const isRender = ref(true);
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
async function clickHandle() {
  contentText.value = "";
  isRender.value = true;
  let formatMd = "";
  if (IS_DEMO) {
    formatMd = convertLatexDelimiters(md);
  } else {
    const res = await fetch("./md.md");
    const md = await res.text();
    formatMd = convertLatexDelimiters(md);
  }

  const stream = createStream(formatMd);
  // ios 不支持 Symbol.asyncIterator
  const reader = stream.getReader();

  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    contentText.value += chunk;
  }
  isRender.value = false;
}

onMounted(clickHandle);
</script>

<template>
  <div>
    <!-- message -->
    <Content :content="contentText"></Content>
  </div>
</template>
