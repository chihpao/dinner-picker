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
    // Listen for appinstalled event (fired when PWA is installed)
    window.addEventListener('appinstalled', checkPwaDisplayMode)
    // Listen for beforeinstallprompt to know if PWA is installable
    // (though this doesn't directly tell us if it's *currently* running as PWA,
    // it's good for related install UI)
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
