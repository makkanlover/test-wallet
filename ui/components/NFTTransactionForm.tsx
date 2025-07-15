import React, { useState } from 'react'
import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { mintNFTTransaction } from '../../actions/thunks/transactionThunks'
import { Theme } from '../themes'
import TransactionConfirmModal from './TransactionConfirmModal'

interface FormData {
  to: string
  tokenId: string
  contractAddress: string
}

const NFTTransactionForm: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const transaction = useSelector((state: RootState) => state.transaction)
  const contract = useSelector((state: RootState) => state.contract)
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      to: '',
      tokenId: '',
      contractAddress: ''
    }
  })

  const onSubmit = (data: FormData) => {
    setFormData(data)
    setShowConfirmModal(true)
  }

  const confirmTransaction = async () => {
    if (!formData) return

    try {
      await dispatch(mintNFTTransaction({
        to: formData.to,
        tokenId: formData.tokenId,
        contractAddress: formData.contractAddress
      })).unwrap()
      
      reset()
      setShowConfirmModal(false)
      setFormData(null)
    } catch (error) {
      console.error('NFT発行エラー:', error)
    }
  }

  return (
    <div css={containerStyle}>
      <h3 css={titleStyle(theme)}>NFT発行</h3>
      
      <div css={noteStyle(theme)}>
        <h4 css={noteTitle(theme)}>📝 注意事項</h4>
        <ul css={noteListStyle(theme)}>
          <li>NFTコントラクトが既にデプロイされている必要があります</li>
          <li>mint関数が実装されている必要があります</li>
          <li>発行者（あなた）がmint権限を持っている必要があります</li>
          <li>指定したトークンIDが既に存在しないことを確認してください</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>NFTコントラクトアドレス</label>
          {contract.contracts.some(c => c.type === 'erc721') ? (
            <select
              css={selectStyle(theme, !!errors.contractAddress)}
              {...register('contractAddress', {
                required: 'コントラクトアドレスは必須です'
              })}
            >
              <option value="">コントラクトを選択してください</option>
              {contract.contracts
                .filter(c => c.type === 'erc721')
                .map(c => (
                  <option key={c.address} value={c.address}>
                    {c.name} ({c.symbol}) - {c.address.slice(0, 10)}...{c.address.slice(-8)}
                  </option>
                ))
              }
            </select>
          ) : (
            <>
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
              <div css={noteStyle(theme)}>
                💡 ERC721コントラクトをデプロイすると、ここでドロップダウン選択ができるようになります
              </div>
            </>
          )}
          {errors.contractAddress && (
            <div css={errorStyle(theme)}>{errors.contractAddress.message}</div>
          )}
        </div>

        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>発行先アドレス</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.to)}
            placeholder="0x..."
            {...register('to', {
              required: '発行先アドレスは必須です',
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
          <label css={labelStyle(theme)}>トークンID</label>
          <input
            type="number"
            min="0"
            css={inputStyle(theme, !!errors.tokenId)}
            placeholder="1"
            {...register('tokenId', {
              required: 'トークンIDは必須です',
              pattern: {
                value: /^[0-9]+$/,
                message: '有効な数値を入力してください'
              },
              validate: {
                positive: (value) => parseInt(value) >= 0 || '0以上の値を入力してください'
              }
            })}
          />
          {errors.tokenId && (
            <div css={errorStyle(theme)}>{errors.tokenId.message}</div>
          )}
        </div>

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
            !!errors.to || 
            !!errors.tokenId || 
            !!errors.contractAddress
          }
        >
          {transaction.isLoading ? '発行中...' : 'NFTを発行'}
        </button>
      </form>

      {showConfirmModal && formData && (
        <TransactionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmTransaction}
          transactionData={{
            type: 'nft',
            to: formData.to,
            amount: '1',
            contractAddress: formData.contractAddress,
            tokenId: formData.tokenId
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

const noteStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1.5rem;
`

const noteTitle = (theme: Theme) => css`
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

const selectStyle = (theme: Theme, hasError: boolean) => css`
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

export default NFTTransactionForm