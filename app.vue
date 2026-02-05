<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/composables/usePwaInstall'

useHead({
  meta: [
    { name: 'color-scheme', content: 'light' }
  ],
  htmlAttrs: {
    class: 'light'
  }
})

const { initPwaListener } = usePwaInstall()
</script>