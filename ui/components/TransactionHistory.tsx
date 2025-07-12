import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../actions/store'
import { clearHistory } from '../../actions/slices/transactionSlice'
import { Theme } from '../themes'

const TransactionHistory: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const { history } = useSelector((state: RootState) => state.transaction)

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '🟡'
      case 'confirmed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '⚪'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'native':
        return 'ネイティブ'
      case 'erc20':
        return 'ERC20'
      case 'nft':
        return 'NFT'
      default:
        return '不明'
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('履歴をすべて削除しますか？この操作は取り消せません。')) {
      dispatch(clearHistory())
    }
  }

  if (history.length === 0) {
    return (
      <div css={containerStyle}>
        <div css={headerStyle}>
          <h3 css={titleStyle(theme)}>トランザクション履歴</h3>
        </div>
        <div css={emptyStateStyle(theme)}>
          <div css={emptyIconStyle}>📋</div>
          <h4 css={emptyTitleStyle(theme)}>履歴がありません</h4>
          <p css={emptyMessageStyle(theme)}>
            トランザクションを送信すると、ここに履歴が表示されます。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <h3 css={titleStyle(theme)}>トランザクション履歴</h3>
        <button
          css={clearButtonStyle(theme)}
          onClick={handleClearHistory}
          title="履歴をクリア"
        >
          🗑️ クリア
        </button>
      </div>

      <div css={historyListStyle}>
        {history.map((tx) => (
          <div key={tx.hash} css={transactionItemStyle(theme)}>
            <div css={transactionHeaderStyle}>
              <div css={transactionTypeStyle}>
                <span css={statusIconStyle}>
                  {getStatusIcon(tx.status)}
                </span>
                <span css={typeTextStyle(theme)}>
                  {getTypeLabel(tx.type)}
                </span>
                {tx.tokenSymbol && (
                  <span css={tokenSymbolStyle(theme)}>
                    {tx.tokenSymbol}
                  </span>
                )}
              </div>
              <div css={timestampStyle(theme)}>
                {formatTimestamp(tx.timestamp)}
              </div>
            </div>

            <div css={transactionDetailsStyle}>
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>ハッシュ:</span>
                <span css={hashStyle(theme)} title={tx.hash}>
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                </span>
              </div>
              
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>送信先:</span>
                <span css={addressStyle(theme)} title={tx.to}>
                  {tx.to.slice(0, 10)}...{tx.to.slice(-8)}
                </span>
              </div>
              
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>
                  {tx.type === 'nft' ? 'トークンID:' : '金額:'}
                </span>
                <span css={valueStyle(theme)}>
                  {tx.type === 'nft' && tx.tokenId ? 
                    `#${tx.tokenId}` : 
                    `${tx.value} ${tx.tokenSymbol || 'ETH'}`
                  }
                </span>
              </div>

              {tx.gasUsed && tx.gasPrice && (
                <div css={detailRowStyle}>
                  <span css={detailLabelStyle(theme)}>ガス使用量:</span>
                  <span css={gasStyle(theme)}>
                    {Number(tx.gasUsed).toLocaleString()} (価格: {tx.gasPrice} Gwei)
                  </span>
                </div>
              )}
            </div>

            <div css={transactionActionsStyle}>
              <button
                css={actionButtonStyle(theme)}
                onClick={() => {
                  const networkId = tx.network || 'sepolia';
                  const url = networkId === 'amoy' ? 
                    `https://amoy.polygonscan.com/tx/${tx.hash}` :
                    `https://sepolia.etherscan.io/tx/${tx.hash}`
                  window.open(url, '_blank')
                }}
                title="Etherscanで確認"
              >
                🔗 詳細を見る
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const containerStyle = css`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const headerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const titleStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  margin: 0;
  color: ${theme.colors.text};
`

const clearButtonStyle = (theme: Theme) => css`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.surface};
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.border};
  }
`

const emptyStateStyle = (theme: Theme) => css`
  text-align: center;
  padding: ${theme.spacing.xl} 0;
  color: ${theme.colors.textSecondary};
`

const emptyIconStyle = css`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const emptyTitleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const emptyMessageStyle = (theme: Theme) => css`
  margin: 0;
  color: ${theme.colors.textSecondary};
`

const historyListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const transactionItemStyle = (theme: Theme) => css`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.surface};
`

const transactionHeaderStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`

const transactionTypeStyle = css`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const statusIconStyle = css`
  font-size: 1rem;
`

const typeTextStyle = (theme: Theme) => css`
  font-weight: 500;
  color: ${theme.colors.text};
`

const tokenSymbolStyle = (theme: Theme) => css`
  background-color: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
`

const timestampStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
`

const transactionDetailsStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`

const detailRowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const detailLabelStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  min-width: 80px;
`

const hashStyle = (theme: Theme) => css`
  font-family: monospace;
  font-size: 0.8rem;
  color: ${theme.colors.text};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

const addressStyle = (theme: Theme) => css`
  font-family: monospace;
  font-size: 0.8rem;
  color: ${theme.colors.text};
`

const valueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
`

const gasStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
`

const transactionActionsStyle = css`
  display: flex;
  justify-content: flex-end;
`

const actionButtonStyle = (theme: Theme) => css`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  background-color: transparent;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.primary};
    color: white;
  }
`

export default TransactionHistory