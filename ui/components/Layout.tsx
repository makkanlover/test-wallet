import React from 'react'
import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../actions/store'
import { Theme } from '../themes'
import SettingsButton from './SettingsButton'
import Navigation from './Navigation'

interface LayoutProps {
  children: React.ReactNode
  currentPage: 'wallet' | 'transaction' | 'contract' | 'settings'
  onPageChange: (page: 'wallet' | 'transaction' | 'contract' | 'settings') => void
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const theme = useTheme() as Theme
  const showSettingsButton = useSelector((state: RootState) => state.settings.showSettingsButton)

  return (
    <div css={containerStyle(theme)}>
      <Navigation currentPage={currentPage} onPageChange={onPageChange} />
      <main css={mainStyle(theme)}>
        {children}
      </main>
      {showSettingsButton && <SettingsButton />}
    </div>
  )
}

const containerStyle = (theme: Theme) => css`
  min-height: 100vh;
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const mainStyle = (theme: Theme) => css`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`

export default Layout