import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../actions/store'
import { Theme } from '../themes'
import ERC20DeployForm from '../components/ERC20DeployForm'
import ERC721DeployForm from '../components/ERC721DeployForm'
import ContractList from '../components/ContractList'

const ContractPage: React.FC = () => {
  const theme = useTheme() as Theme
  const wallet = useSelector((state: RootState) => state.wallet)
  const [activeTab, setActiveTab] = useState<'erc20' | 'erc721' | 'list'>('erc20')

  if (!wallet.isConnected) {
    return (
      <div css={containerStyle}>
        <div css={notConnectedStyle(theme)}>
          <h2 css={titleStyle(theme)}>ウォレットが接続されていません</h2>
          <p css={messageStyle(theme)}>
            コントラクトをデプロイするには、まずウォレットを接続してください。
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'erc20', label: 'ERC20作成', icon: '🪙' },
    { id: 'erc721', label: 'ERC721作成', icon: '🖼️' },
    { id: 'list', label: 'コントラクト一覧', icon: '📋' },
  ] as const

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>コントラクト作成</h2>
      
      <div css={noteStyle(theme)}>
        <h4 css={noteTitle(theme)}>🚧 開発中の機能</h4>
        <p css={noteText(theme)}>
          現在、コントラクトのデプロイ機能は開発中です。
          Hardhatでのコンパイルとartifacts生成が必要です。
          フォームの機能とUIのみ実装されています。
        </p>
      </div>
      
      <div css={tabsContainerStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            css={tabStyle(theme, activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            <span css={iconStyle}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div css={contentStyle}>
        {activeTab === 'erc20' && <ERC20DeployForm />}
        {activeTab === 'erc721' && <ERC721DeployForm />}
        {activeTab === 'list' && <ContractList />}
      </div>
    </div>
  )
}

const containerStyle = css`
  max-width: 800px;
  margin: 0 auto;
`

const notConnectedStyle = (theme: Theme) => css`
  text-align: center;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
`

const titleStyle = (theme: Theme) => css`
  font-size: 2rem;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text};
`

const messageStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.md} 0;
`

const noteStyle = (theme: Theme) => css`
  background-color: ${theme.colors.warning}15;
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`

const noteTitle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.warning};
`

const noteText = (theme: Theme) => css`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
`

const tabsContainerStyle = css`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const tabStyle = (theme: Theme, isActive: boolean) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${isActive ? theme.colors.primary : theme.colors.surface};
  color: ${isActive ? 'white' : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  border: 1px solid ${isActive ? theme.colors.primary : theme.colors.border};

  &:hover {
    background-color: ${isActive ? theme.colors.primary : theme.colors.border};
  }
`

const iconStyle = css`
  font-size: 1rem;
`

const contentStyle = css`
  min-height: 400px;
`

export default ContractPage