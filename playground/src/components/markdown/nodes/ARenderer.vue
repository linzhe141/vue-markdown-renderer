<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  href?: string;
}>();

const webSearchUrls = ref([
  "https://linzhe141.github.io/vue-markdown-renderer/",
  "google.com",
  "bing.com",
  "yahoo.com",
]);

// 判断是否 web search
const webSearchIndex = computed(() => {
  const index = webSearchUrls.value.findIndex((url) => props.href === url);
  return index !== -1 ? index : null;
});

const isWebSearch = computed(() => webSearchIndex.value !== null);

const previewData = computed(() => ({
  title: "VueMarkdownRenderer",
  desc: "VueMarkdownRenderer is a high-performance Vue.js Markdown component built for modern web applications. It leverages Vue's virtual DOM to efficiently update the DOM, ensuring smooth rendering even for complex Markdown content.",
}));

// hover 控制（避免闪烁）
const show = ref(false);
let timer: any = null;

const onEnter = () => {
  clearTimeout(timer);
  timer = setTimeout(() => (show.value = true), 100);
};

const onLeave = () => {
  clearTimeout(timer);
  timer = setTimeout(() => (show.value = false), 100);
};
</script>

<template>
  <span
    class="relative inline-block"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <a
      :href="props.href"
      target="_blank"
      class="group inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
    >
      <span class="hover:underline">
        <slot></slot>
      </span>

      <!-- badge -->
      <span
        v-if="isWebSearch"
        class="ml-1 inline-flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600 transition-all group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600"
      >
        {{ webSearchIndex! + 1 }}
      </span>
    </a>

    <!-- popover -->
    <transition name="fade">
      <div
        v-if="show && isWebSearch"
        class="absolute z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
      >
        <!-- arrow -->
        <div
          class="absolute -top-1 left-4 h-2 w-2 rotate-45 border-t border-l border-gray-200 bg-white"
        />

        <!-- domain -->
        <div class="mb-1 flex items-center gap-1 text-xs text-gray-500">🌐</div>

        <!-- title -->
        <div class="line-clamp-2 text-sm font-medium text-gray-800">
          {{ previewData.title }}
        </div>

        <!-- desc -->
        <div class="mt-1 line-clamp-3 text-xs text-gray-500">
          {{ previewData.desc }}
        </div>
      </div>
    </transition>
  </span>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
