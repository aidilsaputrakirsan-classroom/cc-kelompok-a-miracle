import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: '' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const closeToast = useCallback(() => {
    setToast({ message: '', type: '' })
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast, closeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
