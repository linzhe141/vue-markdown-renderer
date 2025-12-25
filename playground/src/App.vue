<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import "./animation.css";
import Button from "./components/Button.vue";
import { md as thinkMd } from "./examples/think";
import Think from "./components/Think.vue";
import { type ParseNode, PreParse } from "./preParseStreamChunk";
import { convertLatexDelimiters, createStream } from "./utils";
import { MarkdownRenderer } from "./components/markdown/MarkdownRenderer";

const IS_THINK_DEMO = new URLSearchParams(location.search).get("thinkdemo");
const IS_BI_DEMO = new URLSearchParams(location.search).get("bidemo");

const isRendering = ref(true);

const activePage = IS_THINK_DEMO ? "think" : IS_BI_DEMO ? "bi" : "readme";
const streamParams: [chunkSize: number, delay: number] = IS_THINK_DEMO
  ? [5, 30]
  : IS_BI_DEMO
    ? [10, 20]
    : [40, 100];
const parseNodes = ref<ParseNode[]>([]);

async function clickHandle() {
  const [chunkSize, delay] = streamParams;
  isRendering.value = true;
  let formatMd = "";
  parseNodes.value = [];
  if (IS_THINK_DEMO) {
    formatMd = convertLatexDelimiters(thinkMd);
  } else {
    const res = await fetch(IS_BI_DEMO ? "./bi-demo.md" : "./md.md");
    const md = await res.text();
    formatMd = convertLatexDelimiters(md);
  }
  const stream = createStream(formatMd, chunkSize, delay);
  // ios 不支持 Symbol.asyncIterator
  const reader = stream.getReader();

  const parser = new PreParse();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    const nodes = parser.appendChunk(chunk);
    parseNodes.value = [...nodes];
  }
  isRendering.value = false;
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

const pleaceholderRef = useTemplateRef("pleaceholder");
const showToButtom = ref(false);
let observer: IntersectionObserver | null = null;
function clickToButtomHandle() {
  pleaceholderRef.value?.scrollIntoView({ behavior: "smooth" });
}
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        showToButtom.value = !entry.isIntersecting;
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(pleaceholderRef.value!);
});
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <div>
    <button
      v-if="showToButtom"
      class="border-1 z-100 fixed bottom-10 left-1/2 -translate-x-1/2 cursor-pointer rounded-full border-gray-300 bg-gray-50 p-2 shadow-xl hover:shadow-2xl"
      @click="clickToButtomHandle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    </button>
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      "
      class="p-2"
    >
      <Button @click="clickHandle" :disabled="isRendering"
        >re-grenerate ~</Button
      >
      <div class="flex flex-col items-center">
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
        <div class="my-2 space-x-6 dark:text-white">
          <a :class="{ underline: activePage === 'readme' }" href="./">
            readme
          </a>
          <a :class="{ underline: activePage === 'think' }" href="?thinkdemo=1">
            think demo
          </a>
          <a :class="{ underline: activePage === 'bi' }" href="?bidemo=1">
            LLM demo
          </a>
        </div>
      </div>
      <Button @click="changeTheme">change theme to {{ switchTheme }}</Button>
    </div>
    <!-- message -->
    <div>
      <template v-for="(node, index) in parseNodes" :key="index">
        <article
          v-if="node.type === 'text'"
          class="vue-markdown-wrapper prose prose-slate dark:prose-invert mx-auto my-10"
        >
          <MarkdownRenderer
            :source="node.content"
            :theme="switchTheme === 'dark' ? 'light' : 'dark'"
          ></MarkdownRenderer>
        </article>
        <template v-if="node.type === 'symbol'">
          <Think
            v-if="node.symbol === '<think>'"
            :thinkchunk="node.content"
            :thinking="!node.finished"
          ></Think>
        </template>
      </template>
    </div>

    <div class="h-[200px]" ref="pleaceholder"></div>
  </div>
</template>
