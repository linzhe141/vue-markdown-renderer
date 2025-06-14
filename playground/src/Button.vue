<script setup>
defineProps({
  disabled: Boolean,
});
</script>

<template>
  <button
    :disabled
    class="flex rounded-sm border border-[#262626] bg-[#0a0a0a] px-4 py-3 text-white hover:bg-[#262626]"
    :class="{
      'cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
    }"
  >
    <div v-if="disabled" class="mr-2 size-6 animate-spin" v-on="$attrs">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8"
        ></path>
      </svg>
    </div>
    <slot></slot>
  </button>
</template>
