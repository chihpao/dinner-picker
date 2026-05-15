interface ToastOptions {
  message: string
  type?: 'success' | 'danger' | 'info'
  duration?: number
}

export const useToast = () => {
  const toasts = useState<ToastOptions[]>('app-toasts', () => [])

  const showToast = (options: ToastOptions | string) => {
    const toast: ToastOptions = typeof options === 'string' 
      ? { message: options, type: 'info', duration: 3000 }
      : { type: 'info', duration: 3000, ...options }

    toasts.value.push(toast)

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t !== toast)
    }, toast.duration)
  }

  const success = (message: string) => showToast({ message, type: 'success' })
  const danger = (message: string) => showToast({ message, type: 'danger' })
  const info = (message: string) => showToast({ message, type: 'info' })

  return {
    toasts,
    showToast,
    success,
    danger,
    info
  }
}
