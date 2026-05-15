<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="(toast, index) in toasts" 
        :key="index" 
        class="toast-item"
        :class="toast.type"
      >
        <span class="toast-icon">
          <template v-if="toast.type === 'success'">✔️</template>
          <template v-else-if="toast.type === 'danger'">❌</template>
          <template v-else>ℹ️</template>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  width: 90%;
  max-width: 400px;
}

.toast-item {
  background: var(--bg-paper);
  border: 2px solid var(--ink);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 4px 4px 0 var(--ink);
  pointer-events: auto;
  font-family: var(--font-pixel);
  font-size: 14px;
}

.toast-item.success {
  border-color: var(--success);
  color: var(--success);
  box-shadow: 4px 4px 0 var(--success);
}

.toast-item.danger {
  border-color: var(--danger);
  color: var(--danger);
  box-shadow: 4px 4px 0 var(--danger);
}

.toast-icon {
  font-size: 16px;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s var(--ease-snappy);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
