import { useDispatch } from 'react-redux'
import { addToast, Toast } from '../../actions/slices/toastSlice'

type ToastInput = Omit<Toast, 'id'>

export const useToast = () => {
  const dispatch = useDispatch()

  const showToast = (toast: ToastInput) => {
    dispatch(addToast(toast))
  }

  const showSuccess = (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration })
  }

  const showError = (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration })
  }

  const showWarning = (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration })
  }

  const showInfo = (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration })
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}