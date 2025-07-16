<script setup>
defineProps(["error"]);
</script>

<template>
  <div class="m-2 mt-10 rounded border border-dashed border-red-400 p-3">
    <div class="font-bold text-red-500">Error Message:</div>
    <pre class="overflow-auto whitespace-break-spaces text-red-400">
      {{ error?.message || error }}
    </pre>

    <div class="mt-2 font-bold text-red-500">Stack Trace:</div>
    <pre class="overflow-auto whitespace-break-spaces text-red-400">
      {{ error?.stack }}
    </pre>
  </div>
</template>
