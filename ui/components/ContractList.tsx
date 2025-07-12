import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../actions/store'
import { removeContract } from '../../actions/slices/contractSlice'
import { Theme } from '../themes'

const ContractList: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const { contracts } = useSelector((state: RootState) => state.contract)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'erc20':
        return '🪙'
      case 'erc721':
        return '🖼️'
      default:
        return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'erc20':
        return 'ERC20 Token'
      case 'erc721':
        return 'ERC721 NFT'
      default:
        return 'Contract'
    }
  }

  const handleRemoveContract = (address: string) => {
    if (window.confirm('このコントラクトを一覧から削除しますか？\n（ブロックチェーン上のコントラクトは削除されません）')) {
      dispatch(removeContract(address))
    }
  }

  if (contracts.length === 0) {
    return (
      <div css={containerStyle}>
        <div css={emptyStateStyle(theme)}>
          <div css={emptyIconStyle}>📋</div>
          <h4 css={emptyTitleStyle(theme)}>コントラクトがありません</h4>
          <p css={emptyMessageStyle(theme)}>
            コントラクトをデプロイすると、ここに一覧が表示されます。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <h3 css={titleStyle(theme)}>デプロイ済みコントラクト</h3>
        <div css={countStyle(theme)}>
          {contracts.length}個のコントラクト
        </div>
      </div>

      <div css={contractListStyle}>
        {contracts.map((contract) => (
          <div key={contract.address} css={contractItemStyle(theme)}>
            <div css={contractHeaderStyle}>
              <div css={contractTypeStyle}>
                <span css={typeIconStyle}>
                  {getTypeIcon(contract.type)}
                </span>
                <span css={typeTextStyle(theme)}>
                  {getTypeLabel(contract.type)}
                </span>
              </div>
              <button
                css={removeButtonStyle(theme)}
                onClick={() => handleRemoveContract(contract.address)}
                title="一覧から削除"
              >
                🗑️
              </button>
            </div>

            <div css={contractDetailsStyle}>
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>名前:</span>
                <span css={detailValueStyle(theme)}>{contract.name}</span>
              </div>
              
              {contract.symbol && (
                <div css={detailRowStyle}>
                  <span css={detailLabelStyle(theme)}>シンボル:</span>
                  <span css={detailValueStyle(theme)}>{contract.symbol}</span>
                </div>
              )}
              
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>アドレス:</span>
                <span css={addressStyle(theme)} title={contract.address}>
                  {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                </span>
              </div>
              
              <div css={detailRowStyle}>
                <span css={detailLabelStyle(theme)}>ネットワーク:</span>
                <span css={networkStyle(theme)}>{contract.network}</span>
              </div>

              {contract.decimals && (
                <div css={detailRowStyle}>
                  <span css={detailLabelStyle(theme)}>小数点:</span>
                  <span css={detailValueStyle(theme)}>{contract.decimals}桁</span>
                </div>
              )}
            </div>

            <div css={contractActionsStyle}>
              <button
                css={actionButtonStyle(theme)}
                onClick={() => {
                  navigator.clipboard.writeText(contract.address)
                  alert('アドレスをクリップボードにコピーしました')
                }}
                title="アドレスをコピー"
              >
                📋 コピー
              </button>
              <button
                css={actionButtonStyle(theme)}
                onClick={() => {
                  const networkId = contract.network || 'sepolia';
                  const url = networkId === 'amoy' ? 
                    `https://amoy.polygonscan.com/address/${contract.address}` :
                    `https://sepolia.etherscan.io/address/${contract.address}`
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

      <div css={noteStyle(theme)}>
        <h4 css={noteTitleStyle(theme)}>💡 ヒント</h4>
        <ul css={noteListStyle(theme)}>
          <li>デプロイしたコントラクトは「トランザクション」タブで使用できます</li>
          <li>ERC20トークンの送信やNFTの発行が可能です</li>
          <li>コントラクトアドレスをメモしておくことをお勧めします</li>
          <li>一覧から削除してもブロックチェーン上のコントラクトは残ります</li>
        </ul>
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

const countStyle = (theme: Theme) => css`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  background-color: ${theme.colors.surface};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
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

const contractListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const contractItemStyle = (theme: Theme) => css`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.surface};
`

const contractHeaderStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`

const contractTypeStyle = css`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const typeIconStyle = css`
  font-size: 1.2rem;
`

const typeTextStyle = (theme: Theme) => css`
  font-weight: 500;
  color: ${theme.colors.text};
`

const removeButtonStyle = (theme: Theme) => css`
  background: none;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.error}15;
    border-color: ${theme.colors.error};
    color: ${theme.colors.error};
  }
`

const contractDetailsStyle = css`
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

const detailValueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
`

const addressStyle = (theme: Theme) => css`
  font-family: monospace;
  font-size: 0.8rem;
  color: ${theme.colors.text};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

const networkStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.primary};
  background-color: ${theme.colors.primary}20;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
`

const contractActionsStyle = css`
  display: flex;
  gap: 0.5rem;
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

const noteStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
`

const noteTitleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const noteListStyle = (theme: Theme) => css`
  margin: 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;

  li {
    margin-bottom: ${theme.spacing.xs};
  }
`

export default ContractList