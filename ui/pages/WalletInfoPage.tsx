import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../actions/store'
import { updateBalance, disconnectWallet } from '../../actions/thunks/walletThunks'
import { Theme } from '../themes'
import WalletConnectionModal from '../components/WalletConnectionModal'

const WalletInfoPage: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const wallet = useSelector((state: RootState) => state.wallet)
  const [showConnectionModal, setShowConnectionModal] = useState(false)

  const handleUpdateBalance = async () => {
    if (wallet.address) {
      try {
        await dispatch(updateBalance({ address: wallet.address }))
      } catch (error) {
        console.error('残高更新エラー:', error)
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await dispatch(disconnectWallet())
    } catch (error) {
      console.error('ウォレット切断エラー:', error)
    }
  }

  return (
    <div css={containerStyle}>
      <h2 css={titleStyle(theme)}>ウォレット情報</h2>
      
      <div css={cardStyle(theme)}>
        <h3 css={cardTitleStyle(theme)}>接続状況</h3>
        <div css={statusStyle(wallet.isConnected, theme)}>
          {wallet.isConnected ? '✅ 接続済み' : '❌ 未接続'}
        </div>
        {wallet.connectionType && (
          <div css={connectionTypeStyle(theme)}>
            接続タイプ: {wallet.connectionType === 'local' ? 'ローカル' : '外部ウォレット'}
          </div>
        )}
      </div>

      {wallet.address && (
        <div css={cardStyle(theme)}>
          <h3 css={cardTitleStyle(theme)}>アドレス</h3>
          <div css={addressStyle(theme)}>{wallet.address}</div>
        </div>
      )}

      <div css={cardStyle(theme)}>
        <h3 css={cardTitleStyle(theme)}>残高</h3>
        <div css={balanceStyle(theme)}>
          {wallet.balance} {wallet.network?.currency || 'ETH'}
        </div>
      </div>

      {wallet.network && (
        <div css={cardStyle(theme)}>
          <h3 css={cardTitleStyle(theme)}>ネットワーク</h3>
          <div css={networkStyle(theme)}>
            <div>{wallet.network.name}</div>
            <div css={chainIdStyle(theme)}>Chain ID: {wallet.network.chainId}</div>
          </div>
        </div>
      )}

      {wallet.error && (
        <div css={cardStyle(theme)}>
          <div css={errorMessageStyle(theme)}>{wallet.error}</div>
        </div>
      )}

      <div css={actionsStyle}>
        {!wallet.isConnected ? (
          <>
            <button 
              css={buttonStyle(theme, 'primary')}
              onClick={() => setShowConnectionModal(true)}
              disabled={wallet.isLoading}
            >
              {wallet.isLoading ? '接続中...' : 'ローカルウォレット接続'}
            </button>
            <button css={buttonStyle(theme, 'secondary')} disabled>
              外部ウォレット接続（開発中）
            </button>
          </>
        ) : (
          <>
            <button 
              css={buttonStyle(theme, 'secondary')}
              onClick={handleUpdateBalance}
              disabled={wallet.isLoading}
            >
              残高更新
            </button>
            <button 
              css={buttonStyle(theme, 'warning')}
              onClick={handleDisconnect}
              disabled={wallet.isLoading}
            >
              切断
            </button>
          </>
        )}
      </div>

      <WalletConnectionModal 
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </div>
  )
}

const containerStyle = css`
  max-width: 800px;
  margin: 0 auto;
`

const titleStyle = (theme: Theme) => css`
  font-size: 2rem;
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text};
`

const cardStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
`

const cardTitleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text};
`

const statusStyle = (isConnected: boolean, theme: Theme) => css`
  font-size: 1rem;
  font-weight: 500;
  color: ${isConnected ? theme.colors.success : theme.colors.error};
`

const connectionTypeStyle = (theme: Theme) => css`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.sm};
`

const addressStyle = (theme: Theme) => css`
  font-family: monospace;
  font-size: 0.9rem;
  color: ${theme.colors.text};
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  word-break: break-all;
`

const balanceStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${theme.colors.primary};
`

const networkStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
`

const chainIdStyle = (theme: Theme) => css`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`

const actionsStyle = css`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

const errorMessageStyle = (theme: Theme) => css`
  color: ${theme.colors.error};
  font-weight: 500;
  text-align: center;
`

const buttonStyle = (theme: Theme, variant: 'primary' | 'secondary' | 'warning') => css`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${
    variant === 'primary' ? theme.colors.primary :
    variant === 'warning' ? theme.colors.warning :
    theme.colors.secondary
  };
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

export default WalletInfoPage