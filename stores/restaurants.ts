import { defineStore } from 'pinia'

export interface DirectoryItem {
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

export type Restaurant = DirectoryItem

export interface Profile {
  home?: { lat: number; lng: number }
  work?: { lat: number; lng: number }
}

export const useRestaurantsStore = defineStore('restaurants', () => {
  const restaurants = ref<DirectoryItem[]>([])
  const drinks = ref<DirectoryItem[]>([])
  const profile = ref<Profile | null>(null)
  const isLoading = ref(true)
  const activeTab = ref<'restaurants' | 'drinks'>('restaurants')

  const fetchRestaurants = async () => {
    isLoading.value = true
    const config = useRuntimeConfig()
    const base = config.app.baseURL
    try {
      const [resData, drinkData, profileData] = await Promise.all([
        $fetch<DirectoryItem[]>(`${base}restaurants.json`),
        $fetch<DirectoryItem[]>(`${base}drinks.json`),
        $fetch<Profile>(`${base}profile.json`)
      ])
      restaurants.value = resData || []
      drinks.value = drinkData || []
      profile.value = profileData || null
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  const currentItems = computed(() => {
    return activeTab.value === 'restaurants' ? restaurants.value : drinks.value
  })

  const processedItems = computed(() => {
    const withDistance = currentItems.value.map(item => {
      const distances: DirectoryItem['distances'] = {}
      if (profile.value?.home) {
        distances.home = haversine(profile.value.home.lat, profile.value.home.lng, item.lat, item.lng)
      }
      if (profile.value?.work) {
        distances.work = haversine(profile.value.work.lat, profile.value.work.lng, item.lat, item.lng)
      }
      return { ...item, distances }
    })

    return withDistance.sort((a, b) => {
      const da = a.distances?.home ?? a.distances?.work ?? Infinity
      const db = b.distances?.home ?? b.distances?.work ?? Infinity
      return da - db
    })
  })

  return {
    restaurants,
    drinks,
    profile,
    isLoading,
    activeTab,
    processedItems,
    fetchRestaurants
  }
})
