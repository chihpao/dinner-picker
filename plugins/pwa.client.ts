export default defineNuxtPlugin(() => {
    // Use useState to share the event across components
    const installEvent = useState<Event | null>('pwa-install-event', () => null)

    if (import.meta.client) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            // Store the event so it can be used later
            installEvent.value = e
            console.log('Global beforeinstallprompt captured')
        })

        window.addEventListener('appinstalled', () => {
            installEvent.value = null
            console.log('App installed successfully')
        })
    }

    return {
        provide: {
            pwaInstallEvent: installEvent
        }
    }
})
