import { usePwaInstall } from '~/composables/usePwaInstall'

export default defineNuxtPlugin((nuxtApp) => {
    const { initPwaListener } = usePwaInstall()
    if (import.meta.client) {
        initPwaListener()
    }
})
