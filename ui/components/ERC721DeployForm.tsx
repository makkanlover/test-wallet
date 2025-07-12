import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { deployContract, estimateDeployGas } from '../../actions/thunks/contractThunks'
import { Theme } from '../themes'

interface FormData {
  name: string
  symbol: string
  baseURI: string
}

const ERC721DeployForm: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const contract = useSelector((state: RootState) => state.contract)
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      symbol: '',
      baseURI: ''
    }
  })

  const watchedName = watch('name')
  const watchedSymbol = watch('symbol')
  const watchedBaseURI = watch('baseURI')

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(deployContract({
        type: 'erc721',
        name: data.name,
        symbol: data.symbol,
        baseURI: data.baseURI
      })).unwrap()
      
      reset()
    } catch (error) {
      console.error('ERC721デプロイエラー:', error)
    }
  }

  const handleEstimateGas = async () => {
    if (watchedName && watchedSymbol) {
      dispatch(estimateDeployGas({
        type: 'erc721',
        name: watchedName,
        symbol: watchedSymbol,
        baseURI: watchedBaseURI
      }))
    }
  }

  return (
    <div css={containerStyle}>
      <h3 css={titleStyle(theme)}>ERC721 NFTコレクション作成</h3>
      
      <div css={descriptionStyle(theme)}>
        <h4 css={descriptionTitleStyle(theme)}>🖼️ ERC721 NFTについて</h4>
        <ul css={descriptionListStyle(theme)}>
          <li>非代替性トークン（NFT）の標準規格</li>
          <li>各トークンは一意で、個別の価値を持つ</li>
          <li>デジタルアート、コレクティブル、ゲームアイテムなどに使用</li>
          <li>メタデータURIを設定してトークンの属性や画像を管理</li>
          <li>作成者がオーナーとなり、新しいNFTを発行可能</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>コレクション名</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.name)}
            placeholder="例: My NFT Collection"
            {...register('name', {
              required: 'コレクション名は必須です',
              maxLength: {
                value: 50,
                message: 'コレクション名は50文字以内で入力してください'
              }
            })}
          />
          {errors.name && (
            <div css={errorStyle(theme)}>{errors.name.message}</div>
          )}
        </div>

        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>シンボル</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.symbol)}
            placeholder="例: MNFT"
            {...register('symbol', {
              required: 'シンボルは必須です',
              pattern: {
                value: /^[A-Z0-9]{2,10}$/,
                message: 'シンボルは2-10文字の大文字英数字で入力してください'
              }
            })}
          />
          {errors.symbol && (
            <div css={errorStyle(theme)}>{errors.symbol.message}</div>
          )}
        </div>

        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>ベースURI（オプション）</label>
          <input
            type="url"
            css={inputStyle(theme, !!errors.baseURI)}
            placeholder="例: https://api.example.com/metadata/"
            {...register('baseURI', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: '有効なHTTP/HTTPSのURLを入力してください'
              }
            })}
          />
          <div css={helpTextStyle(theme)}>
            メタデータを格納するAPIのベースURLです。空白の場合は後で設定できます。
          </div>
          {errors.baseURI && (
            <div css={errorStyle(theme)}>{errors.baseURI.message}</div>
          )}
        </div>

        <div css={previewStyle(theme)}>
          <h4 css={previewTitleStyle(theme)}>プレビュー</h4>
          <div css={previewContentStyle}>
            <div css={previewItemStyle}>
              <span css={previewLabelStyle(theme)}>名前:</span>
              <span css={previewValueStyle(theme)}>{watchedName || '未入力'}</span>
            </div>
            <div css={previewItemStyle}>
              <span css={previewLabelStyle(theme)}>シンボル:</span>
              <span css={previewValueStyle(theme)}>{watchedSymbol || '未入力'}</span>
            </div>
            <div css={previewItemStyle}>
              <span css={previewLabelStyle(theme)}>ベースURI:</span>
              <span css={previewValueStyle(theme)}>{watchedBaseURI || '未設定'}</span>
            </div>
            <div css={previewItemStyle}>
              <span css={previewLabelStyle(theme)}>例URL:</span>
              <span css={previewValueStyle(theme)}>
                {watchedBaseURI ? `${watchedBaseURI}1.json` : '設定後に表示'}
              </span>
            </div>
          </div>
        </div>

        <div css={metadataExampleStyle(theme)}>
          <h4 css={metadataExampleTitleStyle(theme)}>📄 メタデータの例</h4>
          <pre css={codeBlockStyle(theme)}>
{`{
  "name": "My NFT #1",
  "description": "This is my first NFT",
  "image": "https://example.com/images/1.png",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}`}
          </pre>
        </div>

        {contract.gasEstimate && (
          <div css={gasEstimateStyle(theme)}>
            <h4 css={gasEstimateTitleStyle(theme)}>デプロイ見積もり</h4>
            <div css={gasDetailsStyle}>
              <div css={gasItemStyle}>
                <span>ガス制限: {Number(contract.gasEstimate.gasLimit).toLocaleString()}</span>
              </div>
              <div css={gasItemStyle}>
                <span>ガス価格: {contract.gasEstimate.gasPrice} Gwei</span>
              </div>
              <div css={gasItemStyle}>
                <span>推定手数料: {contract.gasEstimate.estimatedFee} ETH</span>
              </div>
            </div>
          </div>
        )}

        {contract.error && (
          <div css={errorContainerStyle(theme)}>
            {contract.error}
          </div>
        )}

        <div css={actionsStyle}>
          <button
            type="button"
            css={buttonStyle(theme, 'secondary')}
            onClick={handleEstimateGas}
            disabled={
              contract.isLoading ||
              !watchedName ||
              !watchedSymbol ||
              !!errors.name ||
              !!errors.symbol ||
              !!errors.baseURI
            }
          >
            ガス見積もり
          </button>
          
          <button
            type="submit"
            css={buttonStyle(theme, 'primary')}
            disabled={
              contract.isLoading ||
              !!errors.name ||
              !!errors.symbol ||
              !!errors.baseURI
            }
          >
            {contract.isLoading ? 'デプロイ中...' : 'デプロイ'}
          </button>
        </div>
      </form>
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

const descriptionStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1.5rem;
`

const descriptionTitleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const descriptionListStyle = (theme: Theme) => css`
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

const helpTextStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`

const previewStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1.5rem;
`

const previewTitleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const previewContentStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const previewItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  word-break: break-all;
`

const previewLabelStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
  min-width: 80px;
`

const previewValueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
  text-align: right;
  margin-left: 0.5rem;
`

const metadataExampleStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: 1.5rem;
`

const metadataExampleTitleStyle = (theme: Theme) => css`
  font-size: 1rem;
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.text};
`

const codeBlockStyle = (theme: Theme) => css`
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm};
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: ${theme.colors.text};
  overflow-x: auto;
  margin: 0;
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

const actionsStyle = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const buttonStyle = (theme: Theme, variant: 'primary' | 'secondary') => css`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${variant === 'primary' ? theme.colors.primary : theme.colors.secondary};
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export default ERC721DeployForm