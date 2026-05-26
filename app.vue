<template>
  <NuxtLayout>
    <div :style="bgStyle" class="jjk-bg-layer"></div>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/composables/usePwaInstall'
import { ref, onMounted, computed } from 'vue'

useHead({
  meta: [
    { name: 'color-scheme', content: 'dark' },
    { name: 'theme-color', content: '#0A0A0F' }
  ],
  htmlAttrs: {
    class: 'dark mappa-theme'
  }
})

const { initPwaListener } = usePwaInstall()

const config = useRuntimeConfig()
const randomNum = ref(1)

onMounted(() => {
  randomNum.value = Math.floor(Math.random() * 3) + 1
})

const bgStyle = computed(() => {
  const base = config.app.baseURL === '/' ? '' : config.app.baseURL
  const path = `${base}/portrait0${randomNum.value}.jpg`.replace(/\/\//g, '/')
  return { backgroundImage: `url('${path}')` }
})
</script>

<style>
.jjk-bg-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  opacity: 0.15;
  mix-blend-mode: luminosity;
  transition: background-image 0.5s ease-in-out;
}

@media (min-width: 721px) {
  .jjk-bg-layer {
    display: none;
  }
}
</style>