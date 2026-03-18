<template>
  <div v-if="!isPwa && !dismissed" class="pwa-install-wrapper">
    <div v-if="installPromptEvent" class="install-card">
      <div class="card-text">
        <strong>安裝 App</strong>
        <span>離線可用、開啟更快</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-sm primary" @click="installPwa" type="button">安裝</button>
        <button class="btn btn-sm" @click="dismiss" type="button">稍後</button>
      </div>
    </div>

    <div v-else-if="isIos && showIosPrompt" class="install-card ios">
      <div class="card-text">
        <strong>安裝到 iPhone / iPad</strong>
        <span>分享 -> 加入主畫面</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-sm" @click="dismissIosPrompt" type="button">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePwaMode } from '~/composables/usePwaMode'
import { usePwaInstall } from '~/composables/usePwaInstall'

const { isPwa } = usePwaMode()
const { installPromptEvent, installPwa, isIos } = usePwaInstall()

const showIosPrompt = ref(false)
const dismissed = ref(false)

const dismiss = () => {
  dismissed.value = true
  localStorage.setItem('pwa-prompt-dismissed-at', String(Date.now()))
}

const dismissIosPrompt = () => {
  showIosPrompt.value = false
  dismiss()
}

onMounted(() => {
  const dismissedAtRaw = localStorage.getItem('pwa-prompt-dismissed-at')
  const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0
  const oneDay = 24 * 60 * 60 * 1000
  dismissed.value = Boolean(dismissedAt && Date.now() - dismissedAt < oneDay)

  if (!dismissed.value && isIos.value) {
    showIosPrompt.value = true
  }
})
</script>

<style scoped>
.pwa-install-wrapper {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(var(--mobile-nav-height) + max(8px, env(safe-area-inset-bottom)));
  z-index: 120;
  pointer-events: none;
}

.install-card {
  pointer-events: auto;
  margin: 0 auto;
  max-width: 520px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-md);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.install-card.ios {
  border-color: #c7d2fe;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card-text strong {
  font-size: 13px;
  font-family: var(--font-pixel);
}

.card-text span {
  font-size: 12px;
  color: var(--ink-light);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 721px) {
  .pwa-install-wrapper {
    left: auto;
    right: 20px;
    bottom: 20px;
    width: 360px;
  }
}
</style>
