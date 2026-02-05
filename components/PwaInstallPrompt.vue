<template>
  <div v-if="installEvent && !isPwa" class="pwa-install-prompt">
    <button @click="installPWA">
      下載應用程式
    </button>
  </div>
</template>

<script setup lang="ts">
import { usePwaMode } from '~/composables/usePwaMode'

const { isPwa } = usePwaMode()
const installEvent = useState<any>('pwa-install-event')

const installPWA = async () => {
  if (!installEvent.value) {
    return
  }
  installEvent.value.prompt()
  const { outcome } = await installEvent.value.userChoice
  if (outcome === 'accepted') {
    console.log('User accepted the PWA installation prompt')
  } else {
    console.log('User dismissed the PWA installation prompt')
  }
  installEvent.value = null // Hide the prompt after user choice
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 0; /* Position it at the bottom, or another subtle location */
  left: 0;
  right: 0;
  padding: 10px;
  background-color: #333;
  color: #fff;
  text-align: center;
  z-index: 999; /* Below the nav if nav is at top, above if nav is at bottom */
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
</style>
