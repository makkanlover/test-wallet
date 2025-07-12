import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { sendNativeTransaction, estimateGas } from '../../actions/thunks/transactionThunks'
import { Theme } from '../themes'
import GasEstimateDisplay from './GasEstimateDisplay'
import TransactionConfirmModal from './TransactionConfirmModal'

interface FormData {
  to: string
  amount: string
}

const NativeTransactionForm: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const transaction = useSelector((state: RootState) => state.transaction)
  const wallet = useSelector((state: RootState) => state.wallet)
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      to: '',
      amount: ''
    }
  })

  const watchedTo = watch('to')
  const watchedAmount = watch('amount')

  useEffect(() => {
    if (watchedTo && watchedAmount && !errors.to && !errors.amount) {
      const timeoutId = setTimeout(() => {
        dispatch(estimateGas({
          to: watchedTo,
          amount: watchedAmount,
          type: 'native'
        }))
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [watchedTo, watchedAmount, errors.to, errors.amount, dispatch])

  const onSubmit = (data: FormData) => {
    setFormData(data)
    setShowConfirmModal(true)
  }

  const confirmTransaction = async () => {
    if (!formData) return

    try {
      await dispatch(sendNativeTransaction({
        to: formData.to,
        amount: formData.amount
      })).unwrap()
      
      reset()
      setShowConfirmModal(false)
      setFormData(null)
    } catch (error) {
      console.error('トランザクション送信エラー:', error)
    }
  }

  return (
    <div css={containerStyle}>
      <h3 css={titleStyle(theme)}>ネイティブトークン送信</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
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
            送信量 ({wallet.network?.currency || 'ETH'})
          </label>
          <input
            type="number"
            step="0.000000000000000001"
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
                maxDecimals: (value) => {
                  const decimals = value.split('.')[1]
                  return !decimals || decimals.length <= 18 || '小数点以下は18桁までです'
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
          disabled={transaction.isLoading || !watchedTo || !watchedAmount || !!errors.to || !!errors.amount}
        >
          {transaction.isLoading ? '送信中...' : '送信'}
        </button>
      </form>

      {showConfirmModal && formData && (
        <TransactionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmTransaction}
          transactionData={{
            type: 'native',
            to: formData.to,
            amount: formData.amount,
            currency: wallet.network?.currency || 'ETH'
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

export default NativeTransactionForm