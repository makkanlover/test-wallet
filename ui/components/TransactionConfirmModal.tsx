import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { Theme } from '../themes'
import { GasEstimate } from '../../actions/slices/transactionSlice'

interface TransactionData {
  type: 'native' | 'erc20' | 'nft'
  to: string
  amount: string
  currency?: string
  contractAddress?: string
  tokenSymbol?: string
  tokenId?: string
}

interface TransactionConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  transactionData: TransactionData
  gasEstimate: GasEstimate | null
  isLoading: boolean
}

const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
  gasEstimate,
  isLoading
}) => {
  const theme = useTheme() as Theme

  if (!isOpen) return null

  const getTransactionTitle = () => {
    switch (transactionData.type) {
      case 'native':
        return 'ネイティブトークン送信'
      case 'erc20':
        return 'ERC20トークン送信'
      case 'nft':
        return 'NFT発行'
      default:
        return 'トランザクション'
    }
  }

  return (
    <div css={overlayStyle} onClick={onClose}>
      <div css={modalStyle(theme)} onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div css={loadingOverlayStyle}>
            <div css={loadingSpinnerStyle}></div>
            <div css={loadingTextStyle(theme)}>トランザクションを送信中...</div>
          </div>
        )}
        <h3 css={titleStyle(theme)}>{getTransactionTitle()}の確認</h3>
        
        <div css={detailsStyle}>
          <div css={detailItemStyle}>
            <span css={labelStyle(theme)}>送信先:</span>
            <span css={valueStyle(theme)}>{transactionData.to}</span>
          </div>
          
          {transactionData.type === 'native' && (
            <div css={detailItemStyle}>
              <span css={labelStyle(theme)}>送信量:</span>
              <span css={valueStyle(theme)}>
                {transactionData.amount} {transactionData.currency}
              </span>
            </div>
          )}
          
          {transactionData.type === 'erc20' && (
            <>
              <div css={detailItemStyle}>
                <span css={labelStyle(theme)}>トークン:</span>
                <span css={valueStyle(theme)}>{transactionData.tokenSymbol}</span>
              </div>
              <div css={detailItemStyle}>
                <span css={labelStyle(theme)}>送信量:</span>
                <span css={valueStyle(theme)}>
                  {transactionData.amount} {transactionData.tokenSymbol}
                </span>
              </div>
              <div css={detailItemStyle}>
                <span css={labelStyle(theme)}>コントラクト:</span>
                <span css={valueStyle(theme)}>{transactionData.contractAddress}</span>
              </div>
            </>
          )}
          
          {transactionData.type === 'nft' && (
            <>
              <div css={detailItemStyle}>
                <span css={labelStyle(theme)}>トークンID:</span>
                <span css={valueStyle(theme)}>{transactionData.tokenId}</span>
              </div>
              <div css={detailItemStyle}>
                <span css={labelStyle(theme)}>コントラクト:</span>
                <span css={valueStyle(theme)}>{transactionData.contractAddress}</span>
              </div>
            </>
          )}
        </div>

        {gasEstimate && (
          <div css={gasEstimateStyle(theme)}>
            <h4 css={gasEstimateTitleStyle(theme)}>ガス見積もり</h4>
            <div css={gasDetailsStyle}>
              <div css={gasItemStyle}>
                <span>ガス制限: {Number(gasEstimate.gasLimit).toLocaleString()}</span>
              </div>
              <div css={gasItemStyle}>
                <span>ガス価格: {gasEstimate.gasPrice} Gwei</span>
              </div>
              <div css={gasItemStyle}>
                <span>推定手数料: {gasEstimate.estimatedFee} ETH</span>
              </div>
            </div>
          </div>
        )}

        <div css={warningStyle(theme)}>
          ⚠️ トランザクションは取り消すことができません。内容をよく確認してから実行してください。
        </div>

        <div css={actionsStyle}>
          <button
            css={buttonStyle(theme, 'secondary')}
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            css={buttonStyle(theme, 'primary')}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '送信中...' : '確認して送信'}
          </button>
        </div>
      </div>
    </div>
  )
}

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
  position: relative;
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  min-width: 400px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`

const titleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text};
  font-size: 1.25rem;
`

const detailsStyle = css`
  margin-bottom: 1.5rem;
`

const detailItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  word-break: break-all;
`

const labelStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  min-width: 80px;
  margin-right: 1rem;
`

const valueStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
  text-align: right;
  flex: 1;
`

const gasEstimateStyle = (theme: Theme) => css`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1rem;
`

const gasEstimateTitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
  font-size: 1rem;
`

const gasDetailsStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const gasItemStyle = css`
  font-size: 0.85rem;
`

const warningStyle = (theme: Theme) => css`
  background-color: ${theme.colors.warning}15;
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.warning};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`

const actionsStyle = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const buttonStyle = (theme: Theme, variant: 'primary' | 'secondary') => css`
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

const loadingOverlayStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  z-index: 10;
`

const loadingSpinnerStyle = css`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const loadingTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text};
  font-size: 1rem;
  font-weight: 500;
`

export default TransactionConfirmModal