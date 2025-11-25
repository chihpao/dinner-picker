import { ref, computed } from 'vue'

export interface Restaurant {
    id: string
    name: string
    orderUrl: string
    lat: number
    lng: number
    distances?: {
        current?: number
        home?: number
        work?: number
    }
}

export interface Profile {
    home?: { lat: number; lng: number }
    work?: { lat: number; lng: number }
}

export const useRestaurants = () => {
    const restaurants = useState<Restaurant[]>('restaurants', () => [])
    const profile = useState<Profile | null>('profile', () => null)
    const userLocation = useState<{ lat: number; lng: number } | null>('userLocation', () => null)
    const isLoading = useState('restaurants-loading', () => true)

    const fetchRestaurants = async () => {
        try {
            const [resData, profileData] = await Promise.all([
                $fetch<Restaurant[]>('/restaurants.json'),
                $fetch<Profile>('/profile.json')
            ])
            restaurants.value = resData || []
            profile.value = profileData || null
        } catch (e) {
            console.error('Failed to fetch data', e)
        } finally {
            isLoading.value = false
        }
    }

    const requestLocation = () => {
        if (!navigator.geolocation) {
            alert("您的瀏覽器不支援定位功能。")
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            },
            () => {
                alert("定位失敗，請檢查您的定位權限設定。")
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    const processedRestaurants = computed(() => {
        const withDistance = restaurants.value.map(r => {
            const distances: Restaurant['distances'] = {}
            if (userLocation.value) {
                distances.current = haversine(userLocation.value.lat, userLocation.value.lng, r.lat, r.lng)
            }
            if (profile.value?.home) {
                distances.home = haversine(profile.value.home.lat, profile.value.home.lng, r.lat, r.lng)
            }
            if (profile.value?.work) {
                distances.work = haversine(profile.value.work.lat, profile.value.work.lng, r.lat, r.lng)
            }
            return { ...r, distances }
        })

        const sortKey = userLocation.value ? 'current' : (profile.value?.home ? 'home' : 'work')

        return withDistance.sort((a, b) => {
            // @ts-ignore
            const da = a.distances?.[sortKey] ?? Infinity
            // @ts-ignore
            const db = b.distances?.[sortKey] ?? Infinity
            return da - db
        })
    })

    return {
        restaurants,
        profile,
        userLocation,
        isLoading,
        processedRestaurants,
        fetchRestaurants,
        requestLocation
    }
}
