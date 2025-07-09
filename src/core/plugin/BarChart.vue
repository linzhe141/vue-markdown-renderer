<template>
  <div ref="chartContainer" class="echarts-container"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

const chartContainer = ref(null);
let myChart = null;

const renderChart = () => {
  if (!chartContainer.value) return;

  if (myChart) {
    myChart.dispose(); // Dispose previous instance to prevent memory leaks
  }

  myChart = echarts.init(chartContainer.value);

  const option = {
    // Fixed title
    title: {
      text: "My Fixed Bar Chart",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: props.chartData.categories, // Data from props
      axisLabel: {
        rotate: 45,
      },
      name: "Item Categories", // Fixed x-axis label
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      type: "value",
      name: "Values Represented", // Fixed y-axis label
      nameLocation: "middle",
      nameGap: 40,
    },
    series: [
      {
        name: "Quantity", // Fixed series name
        type: "bar",
        data: props.chartData.seriesData, // Data from props
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#4CAF50" }, // Green gradient
            { offset: 0.5, color: "#8BC34A" },
            { offset: 1, color: "#CDDC39" },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#388E3C" },
              { offset: 0.7, color: "#689F38" },
              { offset: 1, color: "#AFB42B" },
            ]),
          },
        },
      },
    ],
    // No extraOptions prop merging here
  };

  myChart.setOption(option);
};

const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
};

onMounted(() => {
  renderChart();
  window.addEventListener("resize", resizeChart);
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
  window.removeEventListener("resize", resizeChart);
});

// Watch only for changes in chartData to re-render the chart
watch(
  () => props.chartData,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<style scoped>
.echarts-container {
  width: 100%;
  height: 400px; /* Adjust height as needed */
}
</style>
