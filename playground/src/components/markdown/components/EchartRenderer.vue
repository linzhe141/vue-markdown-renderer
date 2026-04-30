<template>
  <div
    class="not-prose my-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_22px_50px_-30px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[#0f172a]"
  >
    <div
      class="border-b border-slate-200/80 bg-slate-50 px-4 py-3 text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase dark:border-white/10 dark:bg-slate-950 dark:text-slate-400"
    >
      ECHARTS
    </div>
    <div
      class="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-2 py-4 dark:bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)]"
    >
      <div ref="chartContainer" class="echarts-container"></div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
});

const chartContainer = ref(null);
let myChart = null;

const renderChart = () => {
  if (!chartContainer.value) return;

  if (myChart) {
    myChart.dispose();
  }

  myChart = echarts.init(chartContainer.value);
  myChart.setOption(props.option);
};

onMounted(() => {
  renderChart();
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.echarts-container {
  width: 100%;
  height: 460px;
}
</style>
