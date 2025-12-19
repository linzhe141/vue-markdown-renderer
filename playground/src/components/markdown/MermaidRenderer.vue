<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  img: string;
  source: string;
}>();

const copied = ref(false);

function copyHandle() {
  navigator.clipboard.writeText(props.source || "");
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div
    class="relative my-4 w-0 min-w-full overflow-hidden rounded-lg bg-[#ededed] text-sm shadow dark:bg-[#171717]"
  >
    <!-- 顶部标签行 -->
    <div
      class="flex items-center justify-between bg-[#2f2f2f] p-2 text-[#cdcdcd]"
    >
      <span class="text-xs uppercase tracking-wider text-gray-400">
        MERMAID
      </span>

      <div class="relative cursor-pointer p-1" @click="copyHandle">
        <template v-if="copied">
          <div class="absolute -left-16 -top-6 z-10">
            <pre
              class="rounded bg-slate-100 px-2 py-1 text-sm text-green-500 dark:bg-black"
            >
Copied!
</pre
            >
          </div>
          <!-- ✅ Check Icon SVG -->
          <svg
            class="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </template>
        <template v-else>
          <!-- ✅ Copy Icon SVG -->
          <svg
            class="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h11v16z"
            />
          </svg>
        </template>
      </div>
    </div>

    <!-- 高亮代码区域 -->
    <div
      ref="contentRef"
      class="not-prose flex items-center justify-center overflow-auto px-3 py-2"
    >
      <img :src="img" />
    </div>
  </div>
</template>
