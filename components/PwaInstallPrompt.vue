<template>
  <div v-if="!isPwa" class="pwa-install-wrapper">
    <!-- Android / Desktop Install Prompt -->
    <div v-if="installPromptEvent" class="pwa-install-prompt">
      <button @click="installPwa">
        下載應用程式
      </button>
    </div>

    <!-- iOS Instructions -->
    <div v-else-if="isIos && showIosPrompt" class="ios-install-prompt">
      <div class="ios-content">
        <p><strong>安裝到 iPhone/iPad：</strong></p>
        <ol>
          <li>點擊瀏覽器下方的「分享」按鈕 <span class="ios-icon">⏏</span></li>
          <li>向下滑動並選擇「加入主畫面」 <span class="ios-icon">⊞</span></li>
        </ol>
        <button @click="dismissIosPrompt" class="dismiss-btn">我知道了</button>
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

const dismissIosPrompt = () => {
  showIosPrompt.value = false
  localStorage.setItem('pwa-ios-prompt-dismissed', 'true')
}

onMounted(() => {
  // Check if user previously dismissed the prompt
  const dismissed = localStorage.getItem('pwa-ios-prompt-dismissed')
  if (!dismissed && isIos.value) {
     showIosPrompt.value = true
  }
})
</script>

<style scoped>
.pwa-install-wrapper {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  pointer-events: none; /* Let clicks pass through wrapper */
}

.pwa-install-prompt, .ios-install-prompt {
  pointer-events: auto; /* Re-enable clicks for the prompts */
  background-color: #333;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 0 20px;
  max-width: 400px;
}

.pwa-install-prompt button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.ios-install-prompt {
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  border: 1px solid #ddd;
  text-align: left;
}

.ios-content p {
  margin: 0 0 8px 0;
  font-size: 15px;
}

.ios-content ol {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.ios-icon {
  font-size: 1.2em;
  vertical-align: middle;
}

.dismiss-btn {
  margin-top: 10px;
  width: 100%;
  padding: 6px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
</style>
