<template>
  <div class="app-empty">
    <div class="pixel-icon">
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
  padding: 48px 24px;
  text-align: center;
  background: var(--bg-paper);
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  margin: 16px 0;
}

.pixel-icon {
  margin-bottom: 20px;
  color: var(--border);
  filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.05));
}

.empty-title {
  font-family: var(--font-pixel);
  font-size: 18px;
  margin: 0 0 8px;
  color: var(--ink);
}

.empty-message {
  font-size: 14px;
  color: var(--ink-light);
  margin: 0 0 24px;
  max-width: 240px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 12px;
}
</style>
