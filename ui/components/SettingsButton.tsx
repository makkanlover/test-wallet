import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../actions/store'
import { setTheme } from '../../actions/slices/settingsSlice'
import { Theme, ThemeType } from '../themes'

const SettingsButton: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch()
  const currentTheme = useSelector((state: RootState) => state.settings.theme)
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (newTheme: ThemeType) => {
    dispatch(setTheme(newTheme))
    setIsOpen(false)
  }

  return (
    <>
      <button
        css={buttonStyle(theme)}
        onClick={() => setIsOpen(true)}
        title="設定"
      >
        ⚙️
      </button>

      {isOpen && (
        <div css={overlayStyle} onClick={() => setIsOpen(false)}>
          <div css={modalStyle(theme)} onClick={(e) => e.stopPropagation()}>
            <h3 css={titleStyle(theme)}>設定</h3>
            
            <div css={sectionStyle}>
              <label css={labelStyle(theme)}>テーマ</label>
              <div css={themeOptionsStyle}>
                {[
                  { key: 'light', label: 'ライト' },
                  { key: 'dark', label: 'ダーク' },
                  { key: 'modern', label: 'モダン' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    css={themeOptionStyle(theme, currentTheme === key)}
                    onClick={() => handleThemeChange(key as ThemeType)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              css={closeButtonStyle(theme)}
              onClick={() => setIsOpen(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const buttonStyle = (theme: Theme) => css`
  position: fixed;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background-color: ${theme.colors.primary};
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: ${theme.shadows.lg};
  transition: transform 0.2s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
  }
`

const overlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`

const modalStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  min-width: 300px;
`

const titleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text};
  font-size: 1.25rem;
`

const sectionStyle = css`
  margin-bottom: 1.5rem;
`

const labelStyle = (theme: Theme) => css`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
  font-weight: 500;
`

const themeOptionsStyle = css`
  display: flex;
  gap: 0.5rem;
`

const themeOptionStyle = (theme: Theme, isActive: boolean) => css`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${isActive ? theme.colors.primary : theme.colors.background};
  color: ${isActive ? 'white' : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${isActive ? theme.colors.primary : theme.colors.border};
  }
`

const closeButtonStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.secondary};
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`

export default SettingsButton