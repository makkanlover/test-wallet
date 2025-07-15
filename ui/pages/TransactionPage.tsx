import React, { useState } from 'react'
import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../actions/store'
import { Theme } from '../themes'
import NativeTransactionForm from '../components/NativeTransactionForm'
import ERC20TransactionForm from '../components/ERC20TransactionForm'
import NFTTransactionForm from '../components/NFTTransactionForm'
import TransactionHistory from '../components/TransactionHistory'

const TransactionPage: React.FC = () => {
  const theme = useTheme() as Theme
  const wallet = useSelector((state: RootState) => state.wallet)
  const [activeTab, setActiveTab] = useState<'native' | 'erc20' | 'nft' | 'history'>('native')

  if (!wallet.isConnected) {
    return (
      <div css={containerStyle}>
        <div css={notConnectedStyle(theme)}>
          <h2 css={titleStyle(theme)}>ウォレットが接続されていません</h2>
          <p css={messageStyle(theme)}>
            トランザクションを送信するには、まずウォレットを接続してください。
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'native', label: 'ネイティブトークン', icon: '💰' },
    { id: 'erc20', label: 'ERC20トークン', icon: '🪙' },
    { id: 'nft', label: 'NFT発行', icon: '🖼️' },
    { id: 'history', label: '履歴', icon: '📋' },
  ] as const

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>トランザクション作成</h2>
      
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
        {activeTab === 'native' && <NativeTransactionForm />}
        {activeTab === 'erc20' && <ERC20TransactionForm />}
        {activeTab === 'nft' && <NFTTransactionForm />}
        {activeTab === 'history' && <TransactionHistory />}
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

export default TransactionPage