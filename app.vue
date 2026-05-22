<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/composables/usePwaInstall'

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
</script>