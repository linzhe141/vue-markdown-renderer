<script setup lang="ts">
import { computed } from "vue";
import PreviewableImage from "../../PreviewableImage.vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    title?: string;
  }>(),
  {
    src: "",
    alt: "",
    title: "",
  }
);

const imageLabel = computed(() => props.alt || props.title || "Markdown image");
</script>

<template>
  <figure
    class="group not-prose my-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-white/10 dark:bg-[#111111]"
  >
    <PreviewableImage
      :src="props.src"
      :alt="props.alt || imageLabel"
      :title="props.title || imageLabel"
      :label="imageLabel"
      button-class="group block w-full cursor-zoom-in overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-left outline-none dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)]"
      img-class="max-h-[28rem] w-full object-contain transition duration-300 group-hover:scale-[1.01]"
      empty-text="Image source is missing"
    />
  </figure>
</template>
