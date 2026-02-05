<template>
  <div v-if="!isPwa" class="pwa-install-prompt">
    <div v-if="installPromptEvent">
      <button @click="installPwa">
        下載應用程式
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePwaMode } from '~/composables/usePwaMode'
import { usePwaInstall } from '~/composables/usePwaInstall'

const { isPwa } = usePwaMode()
const { installPromptEvent, installPwa } = usePwaInstall()
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
