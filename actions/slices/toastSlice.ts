import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  actions?: {
    label: string
    action: () => void
  }[]
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: []
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const toast: Toast = {
        id,
        duration: 5000, // デフォルト5秒
        ...action.payload
      }
      state.toasts.push(toast)
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearAllToasts: (state) => {
      state.toasts = []
    }
  }
})

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions
export default toastSlice.reducer