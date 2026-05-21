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
    { name: 'theme-color', content: '#030305' }
  ],
  htmlAttrs: {
    class: 'dark mappa-theme'
  }
})

const { initPwaListener } = usePwaInstall()
</script>