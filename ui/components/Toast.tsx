import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useEffect, useState } from 'react'
import { Theme } from '../themes'
import { Toast as ToastType } from '../../actions/slices/toastSlice'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const theme = useTheme() as Theme
  const [isHovered, setIsHovered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(toast.duration || 5000)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    let startTime = Date.now()
    let timer: NodeJS.Timeout

    const tick = () => {
      if (isPaused || isHovered) {
        startTime = Date.now()
        timer = setTimeout(tick, 100)
        return
      }

      const elapsed = Date.now() - startTime
      const remaining = (toast.duration || 5000) - elapsed

      setTimeRemaining(Math.max(0, remaining))

      if (remaining <= 0) {
        onRemove(toast.id)
      } else {
        timer = setTimeout(tick, 100)
      }
    }

    timer = setTimeout(tick, 100)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove, isPaused, isHovered])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  const progressPercentage = toast.duration && toast.duration > 0 
    ? ((toast.duration - timeRemaining) / toast.duration) * 100
    : 0

  return (
    <div 
      css={toastContainerStyle(theme, toast.type)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div css={toastContentStyle}>
        <div css={toastIconStyle}>
          {getIcon()}
        </div>
        <div css={toastMessageStyle(theme)}>
          {toast.message}
        </div>
        <div css={toastControlsStyle}>
          {toast.duration && toast.duration > 0 && (
            <button
              css={pauseButtonStyle(theme)}
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? '再生' : '一時停止'}
              title={isPaused ? '自動消滅を再開' : '自動消滅を一時停止'}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          )}
          <button
            css={closeButtonStyle(theme)}
            onClick={() => onRemove(toast.id)}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      </div>
      
      {toast.duration && toast.duration > 0 && (
        <div css={progressBarContainerStyle(theme)}>
          <div 
            css={progressBarStyle(theme, toast.type)}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      
      {toast.actions && toast.actions.length > 0 && (
        <div css={actionsStyle}>
          {toast.actions.map((action, index) => (
            <button
              key={index}
              css={actionButtonStyle(theme)}
              onClick={() => {
                action.action()
                onRemove(toast.id)
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const toastContainerStyle = (theme: Theme, type: ToastType['type']) => {
  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.success + '10',
          border: theme.colors.success
        }
      case 'error':
        return {
          bg: theme.colors.error + '10',
          border: theme.colors.error
        }
      case 'warning':
        return {
          bg: theme.colors.warning + '10',
          border: theme.colors.warning
        }
      case 'info':
      default:
        return {
          bg: theme.colors.primary + '10',
          border: theme.colors.primary
        }
    }
  }

  const colors = getTypeColors()

  return css`
    background-color: ${colors.bg};
    border: 1px solid ${colors.border};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.sm};
    box-shadow: ${theme.shadows.md};
    min-width: 300px;
    max-width: 500px;
    animation: slideIn 0.3s ease-out;

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
}

const toastContentStyle = css`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`

const toastControlsStyle = css`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`

const toastIconStyle = css`
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
`

const toastMessageStyle = (theme: Theme) => css`
  flex: 1;
  color: ${theme.colors.text};
  font-size: 0.9rem;
  line-height: 1.4;
`

const closeButtonStyle = (theme: Theme) => css`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.textSecondary}20;
  }
`

const pauseButtonStyle = (theme: Theme) => css`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  padding: 2px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.textSecondary}20;
    transform: scale(1.1);
  }
`

const progressBarContainerStyle = (theme: Theme) => css`
  height: 3px;
  background-color: ${theme.colors.border};
  border-radius: 2px;
  margin-top: 0.75rem;
  overflow: hidden;
`

const progressBarStyle = (theme: Theme, type: ToastType['type']) => {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success
      case 'error':
        return theme.colors.error
      case 'warning':
        return theme.colors.warning
      case 'info':
      default:
        return theme.colors.primary
    }
  }

  return css`
    height: 100%;
    background-color: ${getTypeColor()};
    transition: width 0.1s linear;
    border-radius: 2px;
  `
}

const actionsStyle = css`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid currentColor;
  opacity: 0.3;
`

const actionButtonStyle = (theme: Theme) => css`
  background: none;
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 0.8rem;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.primary};
    color: white;
  }
`

export default Toast