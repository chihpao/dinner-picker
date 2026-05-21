<template>
  <Teleport to="body">
    <Transition name="success-overlay">
      <div v-if="visible" class="success-overlay" @click="dismiss">
        <div class="success-content">
          <div class="success-icon">
            <svg viewBox="0 0 64 64" fill="none" class="shatter-fragments">
              <polygon points="32,32 20,5 45,0" fill="#000" />
              <polygon points="32,32 55,15 64,35" fill="#E11D48" />
              <polygon points="32,32 45,55 25,64" fill="#000" />
              <polygon points="32,32 5,45 0,20" fill="#E11D48" />
              <polygon points="32,32 15,10 35,-5" fill="#000" />
              <polygon points="32,32 60,5 64,25" fill="#E11D48" />
              <polygon points="32,32 50,60 30,64" fill="#000" />
              <polygon points="32,32 5,25 -5,10" fill="#E11D48" />
            </svg>
          </div>
          <div class="success-amount">
            <span class="success-currency">NT$</span>
            <span class="success-digits">{{ formattedAmount }}</span>
          </div>
          <span class="success-label">{{ label }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  amount?: number
  label?: string
  duration?: number
}>(), {
  amount: 0,
  label: '已記錄',
  duration: 900,
})

const emit = defineEmits<{
  complete: []
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const formattedAmount = computed(() => {
  return Math.abs(props.amount).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
})

const show = () => {
  visible.value = true
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([30, 50, 30])
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
    emit('complete')
  }, props.duration)
}

const dismiss = () => {
  visible.value = false
  if (timer) clearTimeout(timer)
  emit('complete')
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

defineExpose({ show })
</script>

<style scoped>
.success-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 3, 5, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: blackFlashBg 150ms cubic-bezier(0, 1, 0, 1) forwards;
}

@keyframes blackFlashBg {
  0% { background: #fff; filter: invert(1) contrast(200%); }
  40% { background: #000; filter: invert(0) contrast(150%); }
  100% { background: rgba(3, 3, 5, 0.95); filter: none; }
}

.success-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: successBounceIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.success-icon {
  width: 120px;
  height: 120px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: -1;
}

.shatter-fragments {
  width: 100%;
  height: 100%;
  animation: shatter 300ms cubic-bezier(0, 1, 0, 1) forwards;
  filter: drop-shadow(0 0 10px rgba(225, 29, 72, 0.6));
}

@keyframes shatter {
  0% { transform: scale(0) rotate(-45deg); opacity: 1; }
  100% { transform: scale(2.5) rotate(20deg); opacity: 0; }
}

.success-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  animation: amountImpact 200ms cubic-bezier(0, 1, 0, 1) both;
  position: relative;
  z-index: 1;
}

.success-currency {
  font-family: var(--font-pixel);
  font-size: 18px;
  opacity: 0.6;
  color: var(--danger);
}

.success-digits {
  font-family: var(--font-pixel);
  font-size: 48px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.05em;
  text-shadow: 0 0 20px rgba(225, 29, 72, 0.6), 2px 2px 0px #000;
}

.success-label {
  font-family: var(--font-pixel);
  font-size: 14px;
  color: var(--danger);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(225, 29, 72, 0.5);
  animation: amountImpact 200ms cubic-bezier(0, 1, 0, 1) 50ms both;
}

@keyframes successBounceIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes amountImpact {
  0% { transform: scale(1.5) skewX(-10deg); opacity: 0; }
  100% { transform: scale(1) skewX(0); opacity: 1; }
}

.success-overlay-enter-active {
  transition: opacity 100ms ease;
}
.success-overlay-leave-active {
  transition: opacity 300ms ease;
}
.success-overlay-enter-from,
.success-overlay-leave-to {
  opacity: 0;
}
</style>
