<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    label?: string;
    subtitle?: string;
    alt?: string;
    title?: string;
    emptyText?: string;
    imgClass?: string;
    buttonClass?: string;
    previewImgClass?: string;
  }>(),
  {
    src: "",
    label: "Markdown image",
    subtitle: "",
    alt: "",
    title: "",
    emptyText: "Image source is missing",
    imgClass: "",
    buttonClass: "",
    previewImgClass: "",
  }
);

const previewOpen = ref(false);

const imageLabel = computed(() => props.alt || props.title || props.label);

function openPreview() {
  if (!props.src) return;
  previewOpen.value = true;
}

function closePreview() {
  previewOpen.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closePreview();
  }
}

watch(previewOpen, (value) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = value ? "hidden" : "";
});

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", onKeydown);
  }
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <div>
    <button
      type="button"
      :class="buttonClass"
      :disabled="!props.src"
      @click="openPreview"
    >
      <img
        v-if="props.src"
        :src="props.src"
        :alt="props.alt || imageLabel"
        :title="props.title || imageLabel"
        :class="imgClass"
        loading="lazy"
      />
      <div
        v-else
        class="flex min-h-56 items-center justify-center px-6 py-10 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ emptyText }}
      </div>
    </button>

    <teleport to="body">
      <transition name="image-preview-fade">
        <div
          v-if="previewOpen"
          class="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          @click="closePreview"
        >
          <div
            class="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] shadow-2xl"
            @click.stop
          >
            <button
              type="button"
              class="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
              aria-label="Close image preview"
              @click="closePreview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 6l12 12M6 18L18 6"
                />
              </svg>
            </button>

            <div
              class="flex max-h-[88vh] items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0%,#020617_75%)] p-6 md:p-8"
            >
              <img
                :src="props.src"
                :alt="props.alt || imageLabel"
                :title="props.title || imageLabel"
                :class="previewImgClass || 'max-h-[72vh] w-auto max-w-full rounded-2xl object-contain'"
              />
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-5 py-4 text-white/85"
            >
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">
                  {{ imageLabel }}
                </div>
                <div
                  v-if="props.subtitle || props.src"
                  class="truncate text-xs text-white/55"
                >
                  {{ props.subtitle || props.src }}
                </div>
              </div>
              <span class="shrink-0 text-xs text-white/60">ESC to close</span>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.image-preview-fade-enter-active,
.image-preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.image-preview-fade-enter-from,
.image-preview-fade-leave-to {
  opacity: 0;
}
</style>
