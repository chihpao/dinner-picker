<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item"
        :class="toast.type"
        @click="removeToast(toast.id!)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg v-else-if="toast.type === 'danger'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  width: auto;
  min-width: 240px;
}

.toast-item {
  pointer-events: auto;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: 0;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 90vw;
  display: flex;
  align-items: center;
  backdrop-filter: blur(8px);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-item.success {
  background: rgba(147, 51, 234, 0.15);
  border-color: rgba(168, 85, 247, 0.4);
  border-left: 3px solid var(--primary-light);
  color: #C084FC;
  box-shadow: 0 0 16px rgba(147, 51, 234, 0.3);
}

.toast-item.danger {
  background: rgba(229, 62, 62, 0.15);
  border-color: rgba(229, 62, 62, 0.4);
  border-left: 3px solid var(--danger);
  color: #EF4444;
  box-shadow: 0 0 16px rgba(229, 62, 62, 0.3);
}

.toast-item.info {
  background: rgba(34, 211, 238, 0.15);
  border-color: rgba(34, 211, 238, 0.4);
  border-left: 3px solid var(--cursed-cyan);
  color: #22D3EE;
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.3);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-message {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.toast-enter-active {
  transition: all 0.15s var(--ease-snappy);
}

.toast-leave-active {
  transition: all var(--duration-fast) ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.85);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.92);
}

@media (max-width: 640px) {
  .toast-container {
    top: 20px;
  }
  
  .toast-item {
    padding: 10px 20px;
  }
}
</style>
