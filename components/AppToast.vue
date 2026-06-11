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
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fill-opacity="0.2"/>
            </svg>
            <svg v-else-if="toast.type === 'danger'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
              <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
            </svg>
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
  gap: 12px;
  pointer-events: none;
  width: auto;
  min-width: 240px;
}

.toast-item {
  pointer-events: auto;
  background: rgba(10, 10, 12, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #27272a;
  border-radius: 0;
  padding: 12px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  max-width: 90vw;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  transform-origin: top center;
  cursor: pointer;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
}

.toast-item::before {
  content: '任務';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%) rotate(-15deg);
  font-family: var(--font-pixel);
  font-size: 28px;
  border: 2px solid;
  padding: 2px 8px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 0;
  font-weight: 800;
  letter-spacing: 0.1em;
  opacity: 0.5;
}

.toast-item.success::before {
  content: '祓除';
  color: rgba(124, 58, 237, 0.2);
  border-color: rgba(124, 58, 237, 0.2);
}

.toast-item.danger::before {
  content: '特級';
  color: rgba(225, 29, 72, 0.2);
  border-color: rgba(225, 29, 72, 0.2);
}

.toast-item.info::before {
  content: '指派';
  color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.2);
}

.toast-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  box-shadow: 0 0 10px currentColor;
}

.toast-item.success {
  border-color: rgba(124, 58, 237, 0.3);
  color: #c4b5fd;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.15);
}
.toast-item.success::after {
  background: #7c3aed;
  box-shadow: 0 0 12px #7c3aed;
}
.toast-item.success .toast-icon {
  color: #a78bfa;
  filter: drop-shadow(0 0 5px rgba(124, 58, 237, 0.5));
  animation: pulseCursedEnergy 1.5s infinite alternate;
}

.toast-item.danger {
  border-color: rgba(225, 29, 72, 0.3);
  color: #fecdd3;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(225, 29, 72, 0.15);
}
.toast-item.danger::after {
  background: #e11d48;
  box-shadow: 0 0 12px #e11d48;
}
.toast-item.danger .toast-icon {
  color: #fb7185;
  filter: drop-shadow(0 0 5px rgba(225, 29, 72, 0.5));
}

.toast-item.info {
  border-color: rgba(59, 130, 246, 0.3);
  color: #bfdbfe;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.15);
}
.toast-item.info::after {
  background: #3b82f6;
  box-shadow: 0 0 12px #3b82f6;
}
.toast-item.info .toast-icon {
  color: #93c5fd;
  filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-message {
  font-family: var(--font-pixel);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

@keyframes pulseCursedEnergy {
  0% { filter: drop-shadow(0 0 2px currentColor); transform: scale(0.95); }
  100% { filter: drop-shadow(0 0 8px currentColor); transform: scale(1.05); }
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9) skewX(-10deg);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95) skewX(10deg);
}

@media (max-width: 640px) {
  .toast-container {
    top: 20px;
  }
  .toast-item {
    padding: 12px 16px;
  }
}
</style>
