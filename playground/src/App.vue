<script setup>
import { VueMarkdownRenderer } from "../../src";
import { onMounted, ref, shallowRef } from "vue";
import "./animation.css";
import Button from "./Button.vue";
import java from "@shikijs/langs/java";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import BarChart from "./BarChart.vue";
import Placeholder from "./Placeholder.vue";
import CodeBlockRendererComp from "./CodeBlockRenderer.vue";
import EchartRenderer from "./EchartRenderer.vue";

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

  const formatMd = convertLatexDelimiters(md);

  const stream = createStream(formatMd);
  // ios 不支持 Symbol.asyncIterator
  const reader = stream.getReader();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
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
const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];
const componentsMap = {
  BarChart,
  Placeholder,
};
const extraLangs = [java];
const codeBlockRenderer = CodeBlockRendererComp;
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
      <a href="https://github.com/linzhe141/vue-markdown-renderer">
        <svg
          class="fill-black dark:fill-white"
          height="32"
          aria-hidden="true"
          viewBox="0 0 24 24"
          version="1.1"
          width="32"
          data-view-component="true"
        >
          <path
            d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"
          ></path>
        </svg>
      </a>
      <Button @click="changeTheme">change theme to {{ switchTheme }}</Button>
    </div>
    <article
      class="vue-markdown-wrapper prose prose-slate dark:prose-invert mx-auto my-10"
    >
      <VueMarkdownRenderer
        :source="mdText"
        :theme="switchTheme === 'dark' ? 'light' : 'dark'"
        :components-map
        :code-block-renderer
        :extra-langs
        :remark-plugins
        :rehype-plugins
        :echart-renderer="EchartRenderer"
        :echart-renderer-placeholder="Placeholder"
      ></VueMarkdownRenderer>
    </article>
  </div>
</template>
