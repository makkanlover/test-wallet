import { css } from '@emotion/react'
import { useTheme } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { AppDispatch, RootState } from '../../actions/store'
import { connectLocalWallet } from '../../actions/thunks/walletThunks'
import { getEnvVar } from '../../actions/utils/env'
import { Theme } from '../themes'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  network: string
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme() as Theme
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.wallet)
  
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      network: 'sepolia'
    }
  })

  const networks = [
    { id: 'sepolia', name: 'Ethereum Sepolia', rpcUrl: getEnvVar('ETHEREUM_RPC_URL', 'https://sepolia.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'), chainId: 11155111, currency: 'SepoliaETH' },
    { id: 'amoy', name: 'Polygon Amoy', rpcUrl: getEnvVar('POLYGON_RPC_URL', 'https://amoy.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'), chainId: 80002, currency: 'MATIC' }
  ]

  const onSubmit = async (data: FormData) => {
    const selectedNetwork = networks.find(n => n.id === data.network)
    if (!selectedNetwork) return

    try {
      await dispatch(connectLocalWallet({
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
        
        <div css={infoStyle(theme)}>
          <p>環境変数から秘密鍵を取得してローカルウォレットに接続します。</p>
          <p><small>秘密鍵が設定されていない場合は、.envファイルにPRIVATE_KEYを設定してアプリを再起動してください。</small></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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

const infoStyle = (theme: Theme) => css`
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;

  p {
    margin: 0 0 ${theme.spacing.sm} 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  small {
    font-size: 0.8rem;
    opacity: 0.8;
  }
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