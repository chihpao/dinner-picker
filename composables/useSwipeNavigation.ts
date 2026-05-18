import { useRouter, useRoute } from 'vue-router'

export function useSwipeNavigation() {
  const router = useRouter()
  const route = useRoute()

  const pageOrder = ['/', '/total/entry', '/total', '/total/accounts']
  let touchStartX = 0
  let touchEndX = 0
  const minSwipeDistance = 50

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.changedTouches?.[0]
    if (touch) {
      touchStartX = touch.screenX
    }
  }

  const handleTouchMove = (e: TouchEvent) => {}

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches?.[0]
    if (touch) {
      touchEndX = touch.screenX
      handleSwipe()
    }
  }

  const handleSwipe = () => {
    const currentIndex = pageOrder.indexOf(route.path)
    if (currentIndex === -1) return

    const swipeDistance = touchEndX - touchStartX
    const prevPage = pageOrder[currentIndex - 1]
    const nextPage = pageOrder[currentIndex + 1]

    if (swipeDistance > minSwipeDistance && currentIndex > 0 && prevPage) {
      router.push(prevPage)
    } else if (swipeDistance < -minSwipeDistance && currentIndex < pageOrder.length - 1 && nextPage) {
      router.push(nextPage)
    }
  }

  const initSwipe = (element: HTMLElement | null) => {
    if (!element) return
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)
  }

  const destroySwipe = (element: HTMLElement | null) => {
    if (!element) return
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  }

  return { initSwipe, destroySwipe }
}
