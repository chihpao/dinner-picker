interface ToastOptions {
  id?: string
  message: string
  type?: 'success' | 'danger' | 'info'
  duration?: number
}

export const useToast = () => {
  const toasts = useState<ToastOptions[]>('app-toasts', () => [])

  const showToast = (options: ToastOptions | string) => {
    const toastId = Math.random().toString(36).substring(2, 9)
    const duration = typeof options === 'object' ? (options.duration || 1000) : 1000
    
    const newToast: ToastOptions = typeof options === 'string' 
      ? { id: toastId, message: options, type: 'info', duration }
      : { id: toastId, type: 'info', ...options, duration }

    toasts.value = [...toasts.value, newToast]

    setTimeout(() => {
      removeToast(newToast.id!)
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message: string) => showToast({ message, type: 'success' })
  const danger = (message: string) => showToast({ message, type: 'danger' })
  const info = (message: string) => showToast({ message, type: 'info' })

  return {
    toasts,
    showToast,
    removeToast,
    success,
    danger,
    info
  }
}
