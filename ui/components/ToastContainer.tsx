import { css } from '@emotion/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../actions/store'
import { removeToast } from '../../actions/slices/toastSlice'
import Toast from './Toast'

const ToastContainer: React.FC = () => {
  const dispatch = useDispatch()
  const toasts = useSelector((state: RootState) => state.toast.toasts)

  const handleRemoveToast = (id: string) => {
    dispatch(removeToast(id))
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div css={containerStyle}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={handleRemoveToast}
        />
      ))}
    </div>
  )
}

const containerStyle = css`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 500px;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    max-width: none;
  }
`

export default ToastContainer