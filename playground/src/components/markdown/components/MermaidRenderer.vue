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
    class="not-prose relative my-6 w-0 min-w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-sm shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0f172a]"
  >
    <div
      class="flex items-center justify-between border-b border-black/5 bg-[#2f2f2f] px-4 py-2 text-slate-200 dark:border-white/10"
    >
      <span
        class="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase"
      >
        MERMAID
      </span>

      <div
        class="relative cursor-pointer rounded-full p-1.5 transition hover:bg-white/10"
        @click="copyHandle"
      >
        <template v-if="copied">
          <div class="absolute -top-9 right-0 z-10">
            <pre
              class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 shadow dark:bg-emerald-950 dark:text-emerald-300"
            >
Copied!
</pre
            >
          </div>
          <svg
            class="h-4 w-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </template>
        <template v-else>
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

    <div
      class="flex items-center justify-center overflow-auto bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-6 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)]"
    >
      <img
        :src="img"
        class="max-h-[34rem] w-full rounded-xl bg-white/80 object-contain p-2 dark:bg-white"
      />
    </div>
  </div>
</template>
