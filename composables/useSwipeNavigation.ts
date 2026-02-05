import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useSwipeNavigation() {
  const router = useRouter()
  const route = useRoute()

  // Define the order of pages for swipe navigation
  const pageOrder = [
    '/',
    '/total/entry',
    '/total',
    '/total/accounts',
  ]

  let touchStartX = 0
  let touchEndX = 0
  const minSwipeDistance = 50 // Minimum distance for a valid swipe

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX
  }

  const handleTouchMove = (e: TouchEvent) => {
    // Optional: prevent default to avoid scrolling while swiping
    // e.preventDefault() 
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  }

  const handleSwipe = () => {
    const currentPath = route.path
    const currentIndex = pageOrder.indexOf(currentPath)

    if (currentIndex === -1) {
      // Current page is not part of swipe navigation
      return
    }

    const swipeDistance = touchEndX - touchStartX

    if (swipeDistance > minSwipeDistance) {
      // Swipe Right (Go to previous page)
      if (currentIndex > 0) {
        router.push(pageOrder[currentIndex - 1])
      }
    } else if (swipeDistance < -minSwipeDistance) {
      // Swipe Left (Go to next page)
      if (currentIndex < pageOrder.length - 1) {
        router.push(pageOrder[currentIndex + 1])
      }
    }
  }

  const initSwipe = (element: HTMLElement | null) => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchmove', handleTouchMove)
      element.addEventListener('touchend', handleTouchEnd)
    }
  }

  const destroySwipe = (element: HTMLElement | null) => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }

  onUnmounted(() => {
    // Ensure listeners are cleaned up if not explicitly destroyed
    // This assumes `initSwipe` is called on a ref, which will be cleaned by Vue
    // but explicit destroy is safer if element is outside Vue's direct control
  })

  return {
    initSwipe,
    destroySwipe
  }
}
