<template>
  <div ref="chartContainer" class="echarts-container"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { ref, onMounted, onUnmounted } from "vue";

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
  height: 500px;
}
</style>
