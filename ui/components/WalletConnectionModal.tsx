import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { connectLocalWallet } from '../../actions/thunks/walletThunks'
import { Theme } from '../themes'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  privateKey: string
  network: string
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.wallet)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      privateKey: '',
      network: 'goerli'
    }
  })

  const getEnvVar = (key: string, defaultValue: string) => {
    if (typeof window !== 'undefined' && import.meta?.env) {
      return import.meta.env[key] || defaultValue;
    }
    return process.env[key] || defaultValue;
  };

  const networks = [
    { id: 'goerli', name: 'Ethereum Goerli', rpcUrl: getEnvVar('VITE_ETHEREUM_RPC_URL', 'https://goerli.infura.io/v3/'), chainId: 5, currency: 'GoerliETH' },
    { id: 'mumbai', name: 'Polygon Mumbai', rpcUrl: getEnvVar('VITE_POLYGON_RPC_URL', 'https://rpc-mumbai.maticvigil.com'), chainId: 80001, currency: 'MATIC' },
    { id: 'bsc-testnet', name: 'BSC Testnet', rpcUrl: getEnvVar('VITE_BSC_RPC_URL', 'https://data-seed-prebsc-1-s1.binance.org:8545'), chainId: 97, currency: 'tBNB' }
  ]

  const onSubmit = async (data: FormData) => {
    const selectedNetwork = networks.find(n => n.id === data.network)
    if (!selectedNetwork) return

    try {
      await dispatch(connectLocalWallet({
        privateKey: data.privateKey,
        network: selectedNetwork
      })).unwrap()
      
      reset()
      onClose()
    } catch (error) {
      console.error('ウォレット接続エラー:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div css={overlayStyle} onClick={onClose}>
      <div css={modalStyle(theme)} onClick={(e) => e.stopPropagation()}>
        <h3 css={titleStyle(theme)}>ローカルウォレット接続</h3>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div css={fieldStyle}>
            <label css={labelStyle(theme)}>秘密鍵</label>
            <input
              type="password"
              css={inputStyle(theme, !!errors.privateKey)}
              placeholder="0x... または 64文字のHex文字列"
              {...register('privateKey', {
                required: '秘密鍵は必須です',
                pattern: {
                  value: /^(0x)?[0-9a-fA-F]{64}$/,
                  message: '有効な秘密鍵を入力してください'
                }
              })}
            />
            {errors.privateKey && (
              <div css={errorStyle(theme)}>{errors.privateKey.message}</div>
            )}
          </div>

          <div css={fieldStyle}>
            <label css={labelStyle(theme)}>ネットワーク</label>
            <select css={selectStyle(theme)} {...register('network')}>
              {networks.map(network => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div css={errorStyle(theme)}>{error}</div>
          )}

          <div css={actionsStyle}>
            <button
              type="button"
              css={buttonStyle(theme, 'secondary')}
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              css={buttonStyle(theme, 'primary')}
              disabled={isLoading}
            >
              {isLoading ? '接続中...' : '接続'}
            </button>
          </div>
        </form>
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
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  min-width: 400px;
  max-width: 500px;
`

const titleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text};
  font-size: 1.25rem;
`

const fieldStyle = css`
  margin-bottom: 1rem;
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
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`

const selectStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 0.9rem;
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

const actionsStyle = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

export default WalletConnectionModal