import { ref, onMounted } from 'vue'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
    const supa = useSupabase()
    const user = useState<User | null>('user', () => null)
    const loading = useState('auth-loading', () => true)

    const authRedirectUrl = (pathname = '/') => {
        if (import.meta.client) {
            return `${window.location.origin}${pathname}`
        }
        return ''
    }

    const getCurrentUser = async () => {
        const { data } = await supa.auth.getSession()
        return data?.session?.user ?? null
    }

    const signInWithGoogle = async (redirectTo = '/') => {
        await supa.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: authRedirectUrl(redirectTo),
            },
        })
    }

    const signOut = async () => {
        await supa.auth.signOut()
        user.value = null
        // Clear local storage if needed
        if (import.meta.client) {
            localStorage.removeItem('sb-ypszjizmmvoyxgkcvmzk-auth-token')
        }
        window.location.reload()
    }

    const initAuth = async () => {
        if (import.meta.server) return

        // Handle OAuth callback
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
            await supa.auth.exchangeCodeForSession(code)
            url.searchParams.delete('code')
            url.searchParams.delete('state')
            window.history.replaceState({}, document.title, url.toString())
        }

        user.value = await getCurrentUser()
        loading.value = false

        supa.auth.onAuthStateChange(async (_event, session) => {
            user.value = session?.user ?? null
        })
    }

    return {
        user,
        loading,
        signInWithGoogle,
        signOut,
        initAuth
    }
}
