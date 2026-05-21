<template>
  <div class="app-empty">
    <div class="empty-illustration">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 12h8m-4-4v8" opacity="0.3" />
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-message">{{ message }}</p>
    <div class="empty-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;
  background: transparent;
  margin: 16px 0;
  animation: fadeIn 0.5s ease both;
  min-height: 240px;
}

.empty-illustration {
  margin-bottom: 20px;
  opacity: 0.6;
  filter: drop-shadow(0 0 10px rgba(88, 28, 135, 0.3));
}

.empty-illustration :deep(svg) {
  width: 80px;
  height: 80px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 8px;
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(88, 28, 135, 0.4);
}

.empty-message {
  font-size: 13px;
  color: var(--ink-light);
  margin: 0 0 24px;
  max-width: 240px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 720px) {
  .app-empty {
    padding: 40px 20px;
  }

  .empty-illustration :deep(svg) {
    width: 72px;
    height: 72px;
  }
}
</style>
