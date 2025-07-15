import React from 'react'
import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { deployContract, estimateDeployGas } from '../../actions/thunks/contractThunks'
import { useToast } from '../hooks/useToast'
import { Theme } from '../themes'

interface FormData {
  name: string
  symbol: string
  decimals: string
  totalSupply: string
}

const ERC20DeployForm: React.FC = () => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const contract = useSelector((state: RootState) => state.contract)
  const toast = useToast()
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      symbol: '',
      decimals: '18',
      totalSupply: '1000000'
    }
  })

  const watchedName = watch('name')
  const watchedSymbol = watch('symbol')
  const watchedDecimals = watch('decimals')
  const watchedTotalSupply = watch('totalSupply')

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(deployContract({
        type: 'erc20',
        name: data.name,
        symbol: data.symbol,
        decimals: parseInt(data.decimals),
        totalSupply: data.totalSupply
      })).unwrap()
      
      toast.showSuccess(`ERC20コントラクト "${data.name}" のデプロイが完了しました`)
      reset()
    } catch (error) {
      toast.showError(`ERC20デプロイに失敗しました: ${error}`)
    }
  }

  const handleEstimateGas = async () => {
    if (watchedName && watchedSymbol && watchedDecimals && watchedTotalSupply) {
      try {
        await dispatch(estimateDeployGas({
          type: 'erc20',
          name: watchedName,
          symbol: watchedSymbol,
          decimals: parseInt(watchedDecimals),
          totalSupply: watchedTotalSupply
        })).unwrap()
        
        toast.showInfo('ガス見積もりが完了しました')
      } catch (error) {
        toast.showError(`ガス見積もりに失敗しました: ${error}`)
      }
    }
  }

  return (
    <div css={containerStyle}>
      <h3 css={titleStyle(theme)}>ERC20トークン作成</h3>
      
      <div css={descriptionStyle(theme)}>
        <h4 css={descriptionTitleStyle(theme)}>📖 ERC20トークンについて</h4>
        <ul css={descriptionListStyle(theme)}>
          <li>代替可能なトークン（暗号通貨など）の標準規格</li>
          <li>各トークンは同じ価値を持ち、分割可能</li>
          <li>総供給量、名前、シンボル、小数点桁数を設定可能</li>
          <li>作成者がオーナーとなり、追加発行や焼却が可能</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div css={fieldStyle}>
          <label css={labelStyle(theme)}>トークン名</label>
          <input
            type="text"
            css={inputStyle(theme, !!errors.name)}
            placeholder="例: My Token"
            {...register('name', {
              required: 'トークン名は必須です',
              maxLength: {
                value: 50,
                message: 'トークン名は50文字以内で入力してください'
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
            placeholder="例: MTK"
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

        <div css={fieldRowStyle}>
          <div css={fieldStyle}>
            <label css={labelStyle(theme)}>小数点桁数</label>
            <select
              css={selectStyle(theme, !!errors.decimals)}
              {...register('decimals', {
                required: '小数点桁数は必須です'
              })}
            >
              {Array.from({ length: 19 }, (_, i) => (
                <option key={i} value={i.toString()}>
                  {i}
                </option>
              ))}
            </select>
            {errors.decimals && (
              <div css={errorStyle(theme)}>{errors.decimals.message}</div>
            )}
          </div>

          <div css={fieldStyle}>
            <label css={labelStyle(theme)}>総供給量</label>
            <input
              type="number"
              min="1"
              css={inputStyle(theme, !!errors.totalSupply)}
              placeholder="1000000"
              {...register('totalSupply', {
                required: '総供給量は必須です',
                pattern: {
                  value: /^[0-9]+$/,
                  message: '正の整数を入力してください'
                },
                validate: {
                  positive: (value) => parseInt(value) > 0 || '1以上の値を入力してください'
                }
              })}
            />
            {errors.totalSupply && (
              <div css={errorStyle(theme)}>{errors.totalSupply.message}</div>
            )}
          </div>
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
              <span css={previewLabelStyle(theme)}>小数点:</span>
              <span css={previewValueStyle(theme)}>{watchedDecimals}桁</span>
            </div>
            <div css={previewItemStyle}>
              <span css={previewLabelStyle(theme)}>総供給量:</span>
              <span css={previewValueStyle(theme)}>
                {watchedTotalSupply ? parseInt(watchedTotalSupply).toLocaleString() : '未入力'}
              </span>
            </div>
          </div>
        </div>

        {contract.gasEstimate && (
          <div css={gasEstimateStyle(theme)}>
            <h4 css={gasEstimateTitleStyle(theme)}>デプロイ見積もり</h4>
            <div css={gasDetailsStyle}>
              <div css={gasItemStyle}>
                <span>ガス制限: {Number(contract.gasEstimate.gasLimit).toLocaleString()}</span>
              </div>
              <div css={gasItemStyle}>
                <span>ガス価格 (基本): {contract.gasEstimate.gasPrice} Gwei</span>
              </div>
              {contract.gasEstimate.actualGasPrice && (
                <div css={gasItemStyle}>
                  <span css={actualGasStyle(theme)}>ガス価格 (実際): {contract.gasEstimate.actualGasPrice} Gwei</span>
                </div>
              )}
              <div css={gasItemStyle}>
                <span>推定手数料 (基本): {contract.gasEstimate.estimatedFee} ETH</span>
              </div>
              {contract.gasEstimate.actualEstimatedFee && (
                <div css={gasItemStyle}>
                  <span css={actualGasStyle(theme)}>推定手数料 (実際): {contract.gasEstimate.actualEstimatedFee} ETH</span>
                </div>
              )}
            </div>
            {contract.gasEstimate.actualGasPrice && (
              <div css={gasNoteStyle(theme)}>
                <small>実際の値にはガス倍率設定が適用されています</small>
              </div>
            )}
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
              !watchedDecimals ||
              !watchedTotalSupply ||
              !!errors.name ||
              !!errors.symbol ||
              !!errors.decimals ||
              !!errors.totalSupply
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
              !!errors.decimals ||
              !!errors.totalSupply
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
  flex: 1;
`

const fieldRowStyle = css`
  display: flex;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0;
  }
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
`

const previewLabelStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.textSecondary};
`

const previewValueStyle = (theme: Theme) => css`
  font-size: 0.8rem;
  color: ${theme.colors.text};
  font-weight: 500;
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

const actualGasStyle = (theme: Theme) => css`
  color: ${theme.colors.primary};
  font-weight: 600;
`

const gasNoteStyle = (theme: Theme) => css`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.xs};
  background-color: ${theme.colors.primary}15;
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
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

export default ERC20DeployForm