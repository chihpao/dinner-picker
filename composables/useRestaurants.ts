import { computed } from 'vue'

export interface Restaurant {
    id: string
    name: string
    orderUrl: string
    lat: number
    lng: number
    distances?: {
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

    const processedRestaurants = computed(() => {
        const withDistance = restaurants.value.map(r => {
            const distances: Restaurant['distances'] = {}
            if (profile.value?.home) {
                distances.home = haversine(profile.value.home.lat, profile.value.home.lng, r.lat, r.lng)
            }
            if (profile.value?.work) {
                distances.work = haversine(profile.value.work.lat, profile.value.work.lng, r.lat, r.lng)
            }
            return { ...r, distances }
        })

        return withDistance.sort((a, b) => {
            // Sort by home distance primary, then work
            const da = a.distances?.home ?? a.distances?.work ?? Infinity
            const db = b.distances?.home ?? b.distances?.work ?? Infinity
            return da - db
        })
    })

    return {
        restaurants,
        profile,
        isLoading,
        processedRestaurants,
        fetchRestaurants
    }
}