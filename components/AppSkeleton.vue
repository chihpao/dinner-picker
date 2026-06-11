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
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 60%);
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
  animation: domainExpansionRipple 1.5s cubic-bezier(0.19, 1, 0.22, 1) infinite;
}

@keyframes domainExpansionRipple {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
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
