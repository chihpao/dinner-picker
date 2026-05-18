import { ref } from 'vue'

const installPromptEvent = ref<any>(null)
const isAppInstalled = ref(false)
const swRegistered = ref(false)
const manifestStatus = ref<string>('checking')

export function usePwaInstall() {

    const initPwaListener = async () => {
        if (!import.meta.client) return

        try {
            const res = await fetch('/dinner-picker/manifest.webmanifest')
            manifestStatus.value = res.ok ? 'OK' : `Error ${res.status}`
        } catch (err: any) {
            manifestStatus.value = `Fetch Fail: ${err.message}`
        }

        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration()
            swRegistered.value = !!reg
        }

        if (window._pwaListenerAttached) return
        window._pwaListenerAttached = true

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            installPromptEvent.value = e
        })

        window.addEventListener('appinstalled', () => {
            installPromptEvent.value = null
            isAppInstalled.value = true
        })
    }

    const installPwa = async () => {
        if (!installPromptEvent.value) return

        installPromptEvent.value.prompt()
        await installPromptEvent.value.userChoice
        installPromptEvent.value = null
    }

    const isIos = ref(false)
    if (import.meta.client) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        isIos.value = /iphone|ipad|ipod/.test(userAgent);
    }

    return {
        installPromptEvent,
        isAppInstalled,
        swRegistered,
        manifestStatus,
        isIos,
        initPwaListener,
        installPwa
    }
}

declare global {
    interface Window {
        _pwaListenerAttached?: boolean
    }
}
