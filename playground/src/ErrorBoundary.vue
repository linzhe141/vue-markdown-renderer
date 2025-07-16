<script setup>
defineProps(["error"]);
</script>
<template>
  <div class="m-2 mt-10 rounded border border-dashed border-red-400 p-3">
    <pre class="overflow-auto whitespace-break-spaces text-red-400"
      >{{ error }}
    </pre>
  </div>
</template>
