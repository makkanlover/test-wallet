import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../actions/store'
import { setTheme, setGasBufferMultiplier } from '../../actions/slices/settingsSlice'
import { Theme, ThemeType, themes } from '../themes'
import { useToast } from '../hooks/useToast'

const SettingsPage: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const settings = useSelector((state: RootState) => state.settings)
  const toast = useToast()
  
  const [tempGasMultiplier, setTempGasMultiplier] = useState(settings.gasBufferMultiplier)

  const handleThemeChange = (newTheme: ThemeType) => {
    dispatch(setTheme(newTheme))
    toast.showSuccess(`テーマを${getThemeDisplayName(newTheme)}に変更しました`)
  }

  const handleGasMultiplierChange = (value: number) => {
    const clampedValue = Math.max(1.0, Math.min(3.0, value))
    setTempGasMultiplier(clampedValue)
  }

  const applyGasMultiplier = () => {
    dispatch(setGasBufferMultiplier(tempGasMultiplier))
    toast.showSuccess(`ガス倍率を${tempGasMultiplier.toFixed(1)}倍に設定しました`)
  }

  const resetGasMultiplier = () => {
    const defaultValue = 1.2
    setTempGasMultiplier(defaultValue)
    dispatch(setGasBufferMultiplier(defaultValue))
    toast.showInfo('ガス倍率をデフォルトにリセットしました')
  }

  const getThemeDisplayName = (themeType: ThemeType): string => {
    switch (themeType) {
      case 'light':
        return 'ライト'
      case 'dark':
        return 'ダーク'
      case 'modern':
        return 'モダン'
      default:
        return themeType
    }
  }

  const getThemePreview = (themeType: ThemeType) => {
    const targetTheme = themes[themeType]
    return (
      <div css={themePreviewStyle(targetTheme)}>
        <div css={previewHeaderStyle(targetTheme)}>
          <div css={previewTitleStyle(targetTheme)}>{getThemeDisplayName(themeType)}</div>
        </div>
        <div css={previewContentStyle(targetTheme)}>
          <div css={previewCardStyle(targetTheme)}>
            <div css={previewTextStyle(targetTheme)}>プレビュー</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>設定</h2>

      {/* テーマ設定セクション */}
      <section css={sectionStyle(theme)}>
        <h3 css={sectionTitleStyle(theme)}>🎨 テーマカラー</h3>
        <p css={sectionDescriptionStyle(theme)}>
          アプリケーションの見た目を変更できます
        </p>
        
        <div css={themeGridStyle}>
          {(Object.keys(themes) as ThemeType[]).map((themeType) => (
            <button
              key={themeType}
              css={themeOptionStyle(theme, settings.theme === themeType)}
              onClick={() => handleThemeChange(themeType)}
            >
              {getThemePreview(themeType)}
              <div css={themeNameStyle(theme)}>
                {getThemeDisplayName(themeType)}
                {settings.theme === themeType && (
                  <span css={activeIndicatorStyle(theme)}> ✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ガス設定セクション */}
      <section css={sectionStyle(theme)}>
        <h3 css={sectionTitleStyle(theme)}>⛽ ガス料金設定</h3>
        <p css={sectionDescriptionStyle(theme)}>
          トランザクション実行時のガス料金にかける倍率を設定できます。
          高い値に設定すると確実に送信できますが、手数料が高くなります。
        </p>

        <div css={gasSettingContainerStyle}>
          <div css={gasInputContainerStyle}>
            <label css={gasLabelStyle(theme)}>
              ガス倍率: {tempGasMultiplier.toFixed(1)}倍
            </label>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={tempGasMultiplier}
              onChange={(e) => handleGasMultiplierChange(parseFloat(e.target.value))}
              css={gasSliderStyle(theme)}
            />
            <div css={gasRangeLabelsStyle(theme)}>
              <span>1.0倍 (節約)</span>
              <span>2.0倍 (標準)</span>
              <span>3.0倍 (高速)</span>
            </div>
          </div>

          <div css={gasPreviewStyle(theme)}>
            <h4 css={gasPreviewTitleStyle(theme)}>プレビュー</h4>
            <div css={gasExampleStyle(theme)}>
              見積もりガス料金: <strong>20 Gwei</strong><br/>
              実際の送信ガス料金: <strong>{(20 * tempGasMultiplier).toFixed(1)} Gwei</strong>
            </div>
          </div>

          <div css={gasActionsStyle}>
            <button
              css={gasButtonStyle(theme, 'secondary')}
              onClick={resetGasMultiplier}
            >
              デフォルトに戻す
            </button>
            <button
              css={gasButtonStyle(theme, 'primary')}
              onClick={applyGasMultiplier}
              disabled={tempGasMultiplier === settings.gasBufferMultiplier}
            >
              設定を適用
            </button>
          </div>
        </div>
      </section>

      {/* 現在の設定表示 */}
      <section css={sectionStyle(theme)}>
        <h3 css={sectionTitleStyle(theme)}>📋 現在の設定</h3>
        <div css={currentSettingsStyle(theme)}>
          <div css={settingItemStyle(theme)}>
            <span css={settingKeyStyle(theme)}>テーマ:</span>
            <span css={settingValueStyle(theme)}>{getThemeDisplayName(settings.theme)}</span>
          </div>
          <div css={settingItemStyle(theme)}>
            <span css={settingKeyStyle(theme)}>ガス倍率:</span>
            <span css={settingValueStyle(theme)}>{settings.gasBufferMultiplier.toFixed(1)}倍</span>
          </div>
        </div>
      </section>
    </div>
  )
}

const containerStyle = css`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const titleStyle = (theme: Theme) => css`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${theme.colors.text};
  text-align: center;
`

const sectionStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`

const sectionTitleStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

const sectionDescriptionStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
`

const themeGridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const themeOptionStyle = (theme: Theme, isActive: boolean) => css`
  border: 2px solid ${isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`

const themePreviewStyle = (targetTheme: Theme) => css`
  background-color: ${targetTheme.colors.background};
  border-radius: ${targetTheme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${targetTheme.colors.border};
  min-height: 100px;
`

const previewHeaderStyle = (targetTheme: Theme) => css`
  background-color: ${targetTheme.colors.primary};
  padding: ${targetTheme.spacing.sm};
`

const previewTitleStyle = (targetTheme: Theme) => css`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`

const previewContentStyle = (targetTheme: Theme) => css`
  padding: ${targetTheme.spacing.md};
`

const previewCardStyle = (targetTheme: Theme) => css`
  background-color: ${targetTheme.colors.surface};
  border: 1px solid ${targetTheme.colors.border};
  border-radius: ${targetTheme.borderRadius.sm};
  padding: ${targetTheme.spacing.sm};
`

const previewTextStyle = (targetTheme: Theme) => css`
  color: ${targetTheme.colors.text};
  font-size: 0.8rem;
`

const themeNameStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
  font-weight: 500;
  text-align: center;
`

const activeIndicatorStyle = (theme: Theme) => css`
  color: ${theme.colors.primary};
  font-weight: 600;
`

const gasSettingContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const gasInputContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const gasLabelStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
  font-weight: 500;
  font-size: 1.1rem;
`

const gasSliderStyle = (theme: Theme) => css`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${theme.colors.border};
  outline: none;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    box-shadow: ${theme.shadows.sm};
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: none;
    box-shadow: ${theme.shadows.sm};
  }
`

const gasRangeLabelsStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  margin-top: 0.25rem;
`

const gasPreviewStyle = (theme: Theme) => css`
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`

const gasPreviewTitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
  font-size: 1rem;
`

const gasExampleStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  line-height: 1.4;

  strong {
    color: ${theme.colors.text};
  }
`

const gasActionsStyle = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const gasButtonStyle = (theme: Theme, variant: 'primary' | 'secondary') => css`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${variant === 'primary' ? theme.colors.primary : theme.colors.secondary};
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const currentSettingsStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const settingItemStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const settingKeyStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`

const settingValueStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
  font-weight: 600;
`

export default SettingsPage