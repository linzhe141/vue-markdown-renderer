<template>
  <div class="skeleton-rect"></div>
</template>

<style scoped>
.skeleton-rect {
  width: 100%;
  height: 500px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.dark .skeleton-rect {
  background: linear-gradient(90deg, #2c2c2c 25%, #3c3c3c 50%, #2c2c2c 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
