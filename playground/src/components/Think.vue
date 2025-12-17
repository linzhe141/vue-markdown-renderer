<script setup>
import { ref } from "vue";
import { VueMarkdownRenderer } from "../../../src";

const props = defineProps({
  thinkchunk: String,
  thinking: Boolean,
});

const collapsed = ref(false);
</script>

<template>
  <div
    class="relative mx-auto w-full max-w-[640px] rounded-2xl bg-white p-4 shadow-md dark:bg-gray-800"
  >
    <!-- 顶部按钮和状态 -->
    <div class="mb-2 flex items-center justify-between">
      <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
        <div v-if="thinking" class="flex items-center gap-2">
          <span>thinking</span>
          <div class="size-6 animate-spin">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"
              ></path>
            </svg>
          </div>
        </div>
        <div v-else>Thought</div>
      </div>
      <button
        @click="collapsed = !collapsed"
        class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        {{ collapsed ? "展开" : "折叠" }}
      </button>
    </div>

    <!-- Markdown 内容 -->
    <div class="border-l border-gray-300 pl-4 dark:border-gray-700">
      <article
        :class="{ 'h-0 overflow-hidden': collapsed }"
        class="vue-markdown-wrapper prose prose-slate dark:prose-invert max-w-full text-[12px]"
      >
        <VueMarkdownRenderer :source="thinkchunk" :theme="'light'" />
      </article>
    </div>
  </div>
</template>
