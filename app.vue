<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  meta: [
    { name: 'color-scheme', content: 'light' }
  ],
  htmlAttrs: {
    class: 'light'
  }
})
</script>