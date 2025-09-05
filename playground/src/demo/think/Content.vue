<script setup>
import { VueMarkdownRenderer } from "../../../../src";
import { ref, watch } from "vue";
import Think from "../../transfrom/think/Think.vue";
import { transformThink } from "../../transfrom/think/think";

const props = defineProps(["content"]);
const mdText = ref("");
const thinkText = ref("");
// 如果开启think 模式，这个状态必须是true，就是默认先进入think状态
const thinking = ref(true);
const processThink = transformThink();

watch(
  () => props.content,
  (value, oldVlue) => {
    let chunk = "";
    if (!oldVlue) chunk = value;
    else chunk = value.slice(oldVlue.length);
    if (!thinking.value) {
      mdText.value += chunk;
    }
    const thinkResult = processThink(chunk);
    if (thinkResult) {
      const { done, buffer, rest } = thinkResult;
      thinking.value = !done;
      thinkText.value = buffer;
      // 如果思考完成了，但是还有剩余的文本，需要放到正文里面
      if (done && rest) {
        mdText.value = rest;
      }
    }
  }
);
</script>

<template>
  <div class="mx-auto w-[640px]">
    <Think
      v-if="thinkText"
      :thinkchunk="thinkText"
      :thinking="thinking"
    ></Think>
    <article class="vue-markdown-wrapper markdown-body mx-auto !mt-6">
      <VueMarkdownRenderer :source="mdText" theme="light"></VueMarkdownRenderer>
    </article>
  </div>
</template>
