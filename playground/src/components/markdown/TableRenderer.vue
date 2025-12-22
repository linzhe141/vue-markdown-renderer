<script setup lang="ts">
const props = defineProps<{
  // 只提取了 文本内容，如果存在图片或者链接等复杂内容，需要通过 ast 进行更细颗粒度的渲染，要不然会丢失信息
  thead: string[];
  tbody: string[][];
  // 细颗粒度的 AST 信息
  ast: Object;
}>();
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
        TABLE
      </span>
    </div>

    <div class="not-prose px-3 py-2">
      <div
        class="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <!-- header -->
        <div
          class="flex bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <div
            v-for="(col, i) in thead"
            :key="i"
            class="flex-1 border-r border-gray-200 px-3 py-2 last:border-r-0 dark:border-neutral-700"
          >
            {{ col }}
          </div>
        </div>

        <!-- body -->
        <div>
          <div
            v-for="(row, rowIndex) in tbody"
            :key="rowIndex"
            class="flex text-gray-700 transition-colors odd:bg-white even:bg-gray-50 hover:bg-gray-100 dark:text-neutral-200 dark:odd:bg-neutral-900 dark:even:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="flex-1 border-r border-t border-gray-200 px-3 py-2 last:border-r-0 dark:border-neutral-700"
            >
              {{ cell }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
