import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { Theme } from '../themes'

interface NavigationProps {
  currentPage: 'wallet' | 'transaction' | 'contract' | 'settings'
  onPageChange: (page: 'wallet' | 'transaction' | 'contract' | 'settings') => void
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const theme = useTheme() as Theme

  const tabs = [
    { id: 'wallet', label: 'ウォレット情報', icon: '💳' },
    { id: 'transaction', label: 'トランザクション', icon: '💸' },
    { id: 'contract', label: 'コントラクト', icon: '📄' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ] as const

  return (
    <nav css={navStyle(theme)}>
      <div css={navContainerStyle(theme)}>
        <h1 css={titleStyle(theme)}>Web3ウォレット</h1>
        <div css={tabsStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              css={tabStyle(theme, currentPage === tab.id)}
              onClick={() => onPageChange(tab.id)}
            >
              <span css={iconStyle}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

const navStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.sm};
`

const navContainerStyle = (theme: Theme) => css`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const titleStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  margin: 0;
`

const tabsStyle = css`
  display: flex;
  gap: 0.5rem;
`

const tabStyle = (theme: Theme, isActive: boolean) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${isActive ? theme.colors.primary : 'transparent'};
  color: ${isActive ? 'white' : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: ${isActive ? theme.colors.primary : theme.colors.border};
  }
`

const iconStyle = css`
  font-size: 1rem;
`

export default Navigation