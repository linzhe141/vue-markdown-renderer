<script setup>
import { VueMarkdownRenderer } from "../../src";
import { onMounted, ref } from "vue";
import "./animation.css";
import Button from "./components/Button.vue";
import java from "@shikijs/langs/java";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  BarChart,
  CodeBlockRenderer,
  EchartRenderer,
  Placeholder,
} from "./components/markdown";
import { transformThink } from "./transfrom/think/think";
import Think from "./transfrom/think/Think.vue";
import { md as thinkMd } from "./examples/think";
import { convertLatexDelimiters, createStream } from "./utils";

const IS_THINK_DEMO = new URLSearchParams(location.search).get("thinkdemo");

const parseNode = ref([]);
const mdText = ref("");
const thinkText = ref("");
// 如果开启think 模式，这个状态必须是true，就是默认先进入think状态
const thinking = ref(false);
const isRendering = ref(true);

async function clickHandle() {
  mdText.value = "";
  isRendering.value = true;
  let formatMd = "";
  if (IS_THINK_DEMO) {
    formatMd = convertLatexDelimiters(thinkMd);
  } else {
    const res = await fetch("./md.md");
    const md = await res.text();
    formatMd = convertLatexDelimiters(md);
  }

  const stream = createStream(formatMd);
  // ios 不支持 Symbol.asyncIterator
  const reader = stream.getReader();

  const processThink = transformThink();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    debugger;
    const thinkResult = processThink(chunk);
    const { state, buffer, rest } = thinkResult;
    thinking.value = state === "thinking";
    if (state === "idle" || state === "finished") {
      debugger;
      const contentNode = {
        type: "content",
        content: buffer,
      };
      const lastNode = parseNode.value[parseNode.value.length - 1];
      if (lastNode?.type === "content") {
        lastNode.content = buffer;
      } else {
        parseNode.value.push(contentNode);
      }
    } else if (state === "thinking") {
      const thinkNode = {
        type: "think",
        content: buffer,
        thinking: true,
      };
      const lastNode = parseNode.value[parseNode.value.length - 1];
      if (lastNode?.type === "think") {
        lastNode.content = buffer;
      } else {
        parseNode.value.push(thinkNode);
      }
    } else if (state === "finished") {
      const lastNode = parseNode.value[parseNode.value.length - 1];
      if (lastNode) {
        lastNode.thinking = false;
      }
    }
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
const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];
const componentsMap = {
  BarChart,
  Placeholder,
};
const extraLangs = [java];
const codeBlockRenderer = CodeBlockRenderer;
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
      <Button @click="clickHandle" :disabled="isRendering"
        >re-grenerate ~</Button
      >
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
    <!-- message -->
    <div>
      <template v-for="(node, index) in parseNode" :key="index">
        <Think
          v-if="node.type === 'think'"
          :thinkchunk="node.content"
          :thinking="node.thinking"
        ></Think>
        <article
          v-if="node.type === 'content'"
          class="vue-markdown-wrapper prose prose-slate dark:prose-invert mx-auto my-10"
        >
          <VueMarkdownRenderer
            :source="node.content"
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
      </template>
    </div>
  </div>
</template>
