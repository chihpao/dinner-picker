import { ref } from 'vue'

// Singleton state
const installPromptEvent = ref<any>(null)
const isAppInstalled = ref(false)
const swRegistered = ref(false)
const manifestStatus = ref<string>('checking')

export function usePwaInstall() {

    const initPwaListener = async () => {
        if (!import.meta.client) return

        // Check Manifest Availability
        try {
            const res = await fetch('/dinner-picker/manifest.webmanifest')
            manifestStatus.value = res.ok ? 'OK' : `Error ${res.status}`
        } catch (err: any) {
            manifestStatus.value = `Fetch Fail: ${err.message}`
        }

        // Check SW registration
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration()
            swRegistered.value = !!reg
            console.log('SW Registration checked:', reg)
        }

        // Prevent duplicate listeners
        if (window._pwaListenerAttached) return
        window._pwaListenerAttached = true

        console.log('Initializing PWA Install Listener')

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            console.log('Captured beforeinstallprompt event', e)
            installPromptEvent.value = e
        })

        window.addEventListener('appinstalled', () => {
            console.log('App installed')
            installPromptEvent.value = null
            isAppInstalled.value = true
        })
    }

    const installPwa = async () => {
        if (!installPromptEvent.value) {
            console.warn('No install prompt event available')
            return
        }

        installPromptEvent.value.prompt()
        const { outcome } = await installPromptEvent.value.userChoice
        console.log(`User response to install prompt: ${outcome}`)

        installPromptEvent.value = null
    }

    return {
        installPromptEvent,
        isAppInstalled,
        swRegistered,
        manifestStatus,
        initPwaListener,
        installPwa
    }
}

// Add type augmentation to window to avoid TS errors
declare global {
    interface Window {
        _pwaListenerAttached?: boolean
    }
}
