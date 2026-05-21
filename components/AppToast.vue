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
  border-radius: 40px;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
  max-width: 90vw;
  display: flex;
  align-items: center;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-item.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

.toast-item.danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.toast-item.info {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #1d4ed8;
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
  transition: all 0.45s var(--spring-smooth);
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
