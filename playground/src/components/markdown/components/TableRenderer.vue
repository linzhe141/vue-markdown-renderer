<script setup lang="ts">
defineProps<{
  thead: string[];
  tbody: string[][];
  ast: Object;
}>();
</script>

<template>
  <div
    class="not-prose relative my-6 w-0 min-w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-sm shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0f172a]"
  >
    <div
      class="flex items-center justify-between border-b border-black/5 bg-slate-950 px-4 py-3 text-slate-200 dark:border-white/10"
    >
      <span
        class="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase"
      >
        TABLE
      </span>
    </div>

    <div class="px-4 py-4">
      <div
        class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"
      >
        <div
          class="flex bg-slate-50 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300"
        >
          <div
            v-for="(col, i) in thead"
            :key="i"
            class="flex-1 border-r border-slate-200 px-4 py-3 last:border-r-0 dark:border-white/10"
          >
            {{ col }}
          </div>
        </div>

        <div>
          <div
            v-for="(row, rowIndex) in tbody"
            :key="rowIndex"
            class="flex text-slate-700 transition-colors odd:bg-white even:bg-slate-50 hover:bg-slate-100 dark:text-slate-200 dark:odd:bg-slate-950 dark:even:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="flex-1 border-t border-r border-slate-200 px-4 py-3 last:border-r-0 dark:border-white/10"
            >
              {{ cell }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
