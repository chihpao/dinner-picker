import { ref, onMounted, onUnmounted } from 'vue'

export function usePwaMode() {
  const isPwa = ref(false)

  const checkPwaDisplayMode = () => {
    if (process.client) {
      isPwa.value = window.matchMedia('(display-mode: standalone)').matches
    }
  }

  onMounted(() => {
    checkPwaDisplayMode()
    window.addEventListener('appinstalled', checkPwaDisplayMode)
    window.addEventListener('beforeinstallprompt', checkPwaDisplayMode)
  })

  onUnmounted(() => {
    window.removeEventListener('appinstalled', checkPwaDisplayMode)
    window.removeEventListener('beforeinstallprompt', checkPwaDisplayMode)
  })

  return {
    isPwa
  }
}
