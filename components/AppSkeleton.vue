<template>
  <div class="skeleton" :class="[type, shape]" :style="style"></div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'text' | 'card' | 'avatar' | 'button' | 'icon'
  shape?: 'rect' | 'circle' | 'pill'
  width?: string
  height?: string
}>(), {
  type: 'text',
  shape: 'rect'
})

const style = computed(() => ({
  width: props.width,
  height: props.height
}))
</script>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.circle { border-radius: 50%; }
.pill { border-radius: 999px; }
.rect { border-radius: 8px; }

.avatar { width: 48px; height: 48px; }
.icon { width: 24px; height: 24px; }
.button { height: 40px; border-radius: 10px; }
.card { height: 120px; border-radius: 12px; }
.text { height: 16px; margin: 8px 0; }
</style>
