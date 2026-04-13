import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastEntry = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

export type ToastContextValue = {
  push: (toast: Omit<ToastEntry, 'id'>) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
