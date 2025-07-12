import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { sendERC20Transaction, estimateGas, getTokenInfo } from '../../actions/thunks/transactionThunks'
import { Theme } from '../themes'
import GasEstimateDisplay from './GasEstimateDisplay'
import TransactionConfirmModal from './TransactionConfirmModal'

interface FormData {
  to: string
  amount: string
  contractAddress: string
}

const ERC20TransactionForm: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const transaction = useSelector((state: RootState) => state.transaction)
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      to: '',
      amount: '',
      contractAddress: ''
    }
  })

  const watchedTo = watch('to')
  const watchedAmount = watch('amount')
  const watchedContract = watch('contractAddress')

  useEffect(() => {
    if (watchedContract && !errors.contractAddress) {
      const timeoutId = setTimeout(() => {
        dispatch(getTokenInfo({ contractAddress: watchedContract }))
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [watchedContract, errors.contractAddress, dispatch])

  useEffect(() => {
    if (watchedTo && watchedAmount && watchedContract && 
        !errors.to && !errors.amount && !errors.contractAddress &&
        transaction.tokenInfo) {
      const timeoutId = setTimeout(() => {
        dispatch(estimateGas({
          to: watchedTo,
          amount: watchedAmount,
          type: 'erc20',
          contractAddress: watchedContract,
          decimals: transaction.tokenInfo.decimals
        }))
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [watchedTo, watchedAmount, watchedContract, errors, transaction.tokenInfo, dispatch])

  const onSubmit = (data: FormData) => {
    setFormData(data)
    setShowConfirmModal(true)
  }

  const confirmTransaction = async () => {
    if (!formData || !transaction.tokenInfo) return

    try {
      await dispatch(sendERC20Transaction({
        to: formData.to,
        amount: formData.amount,
        contractAddress: formData.contractAddress,
        tokenSymbol: transaction.tokenInfo.symbol,
        decimals: transaction.tokenInfo.decimals
      })).unwrap()
      
      reset()
      setShowConfirmModal(false)
      setFormData(null)
    } catch (error) {
      console.error('ERC20トークン送信エラー:', error)
    }
  }

  return (
    <div css={containerStyle}>
      <h3 css={titleStyle(theme)}>ERC20トークン送信</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>コントラクトアドレス</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.contractAddress)}
            placeholder="0x..."
            {...register('contractAddress', {
              required: 'コントラクトアドレスは必須です',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: '有効なコントラクトアドレスを入力してください'
              }
            })}
          />
          {errors.contractAddress && (
            <div css={errorStyle(theme)}>{errors.contractAddress.message}</div>
          )}
        </div>

        {transaction.tokenInfo && (
          <div css={tokenInfoStyle(theme)}>
            <h4 css={tokenInfoTitleStyle(theme)}>トークン情報</h4>
            <div css={tokenInfoGridStyle}>
              <div css={tokenInfoItemStyle}>
                <span css={tokenInfoLabelStyle(theme)}>名前:</span>
                <span css={tokenInfoValueStyle(theme)}>{transaction.tokenInfo.name}</span>
              </div>
              <div css={tokenInfoItemStyle}>
                <span css={tokenInfoLabelStyle(theme)}>シンボル:</span>
                <span css={tokenInfoValueStyle(theme)}>{transaction.tokenInfo.symbol}</span>
              </div>
              <div css={tokenInfoItemStyle}>
                <span css={tokenInfoLabelStyle(theme)}>残高:</span>
                <span css={tokenInfoValueStyle(theme)}>
                  {transaction.tokenInfo.balance} {transaction.tokenInfo.symbol}
                </span>
              </div>
              <div css={tokenInfoItemStyle}>
                <span css={tokenInfoLabelStyle(theme)}>小数点:</span>
                <span css={tokenInfoValueStyle(theme)}>{transaction.tokenInfo.decimals}</span>
              </div>
            </div>
          </div>
        )}

        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>送信先アドレス</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.to)}
            placeholder="0x..."
            {...register('to', {
              required: '送信先アドレスは必須です',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: '有効なEthereumアドレスを入力してください'
              }
            })}
          />
          {errors.to && (
            <div css={errorStyle(theme)}>{errors.to.message}</div>
          )}
        </div>

        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>
            送信量 {transaction.tokenInfo && `(${transaction.tokenInfo.symbol})`}
          </label>
          <input
            type="number"
            step="any"
            css={inputStyle(theme, !!errors.amount)}
            placeholder="0.0"
            {...register('amount', {
              required: '送信量は必須です',
              pattern: {
                value: /^[0-9]*\.?[0-9]+$/,
                message: '有効な数値を入力してください'
              },
              validate: {
                positive: (value) => parseFloat(value) > 0 || '0より大きい値を入力してください',
                balance: (value) => {
                  if (!transaction.tokenInfo) return true
                  const amount = parseFloat(value)
                  const balance = parseFloat(transaction.tokenInfo.balance)
                  return amount <= balance || '残高が不足しています'
                }
              }
            })}
          />
          {errors.amount && (
            <div css={errorStyle(theme)}>{errors.amount.message}</div>
          )}
        </div>

        {transaction.gasEstimate && (
          <GasEstimateDisplay gasEstimate={transaction.gasEstimate} />
        )}

        {transaction.error && (
          <div css={errorContainerStyle(theme)}>
            {transaction.error}
          </div>
        )}

        <button
          type="submit"
          css={submitButtonStyle(theme)}
          disabled={
            transaction.isLoading || 
            !watchedTo || 
            !watchedAmount || 
            !watchedContract ||
            !transaction.tokenInfo ||
            !!errors.to || 
            !!errors.amount || 
            !!errors.contractAddress
          }
        >
          {transaction.isLoading ? '送信中...' : '送信'}
        </button>
      </form>

      {showConfirmModal && formData && transaction.tokenInfo && (
        <TransactionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmTransaction}
          transactionData={{
            type: 'erc20',
            to: formData.to,
            amount: formData.amount,
            contractAddress: formData.contractAddress,
            tokenSymbol: transaction.tokenInfo.symbol
          }}
          gasEstimate={transaction.gasEstimate}
          isLoading={transaction.isLoading}
        />
      )}
    </div>
  )
}

const containerStyle = css`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const titleStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};
`

const fieldStyle = css`
  margin-bottom: 1.5rem;
`

const labelStyle = (theme: Theme) => css`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`

const inputStyle = (theme: Theme, hasError: boolean) => css`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`

const tokenInfoStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1.5rem;
`

const tokenInfoTitleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const tokenInfoGridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`

const tokenInfoItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const tokenInfoLabelStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
`

const tokenInfoValueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
`

const errorStyle = (theme: Theme) => css`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  margin-top: ${theme.spacing.xs};
`

const errorContainerStyle = (theme: Theme) => css`
  background-color: ${theme.colors.error}15;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  color: ${theme.colors.error};
  margin-bottom: 1rem;
`

const submitButtonStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export default ERC20TransactionForm