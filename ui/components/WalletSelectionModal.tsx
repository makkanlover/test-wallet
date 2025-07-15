import { css } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { AppDispatch, RootState } from '../../actions/store';
import { connectLocalWallet, connectExternalWallet, connectWalletConnect } from '../../actions/thunks/walletThunks';
import { getEnvVar } from '../../actions/utils/env';
import { Theme } from '../themes';
import { WalletConnection } from '../../types/walletconnect';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  network: string;
  privateKey?: string;
}

const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({ isOpen, onClose }) => {
  const theme = useTheme() as Theme;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.wallet);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);
  
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      network: 'sepolia'
    }
  });

  const networks = [
    { id: 'sepolia', name: 'Ethereum Sepolia', rpcUrl: getEnvVar('ETHEREUM_RPC_URL', 'https://sepolia.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'), chainId: 11155111, currency: 'SepoliaETH' },
    { id: 'amoy', name: 'Polygon Amoy', rpcUrl: getEnvVar('POLYGON_RPC_URL', 'https://amoy.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'), chainId: 80002, currency: 'MATIC' }
  ];

  const walletConnections: WalletConnection[] = [
    {
      type: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      isInstalled: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
      connect: async () => {
        const selectedNetwork = networks.find(n => n.id === watch('network'));
        if (!selectedNetwork) return;
        
        await dispatch(connectExternalWallet({ network: selectedNetwork })).unwrap();
      }
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      isInstalled: true,
      connect: async () => {
        const selectedNetwork = networks.find(n => n.id === watch('network'));
        if (!selectedNetwork) return;
        
        await dispatch(connectWalletConnect({ network: selectedNetwork })).unwrap();
      }
    },
    {
      type: 'local',
      name: 'ローカルウォレット',
      icon: '🔑',
      isInstalled: true,
      connect: async () => {
        const selectedNetwork = networks.find(n => n.id === watch('network'));
        if (!selectedNetwork) return;
        
        const privateKey = watch('privateKey');
        if (privateKey) {
          await dispatch(connectLocalWallet({ 
            network: selectedNetwork, 
            privateKey 
          })).unwrap();
        } else {
          await dispatch(connectLocalWallet({ network: selectedNetwork })).unwrap();
        }
      }
    }
  ];

  const handleWalletSelect = (walletType: string) => {
    setSelectedWallet(walletType);
    setShowPrivateKeyInput(walletType === 'local');
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedWallet) return;
    
    const wallet = walletConnections.find(w => w.type === selectedWallet);
    if (!wallet) return;

    try {
      await wallet.connect();
      reset();
      onClose();
    } catch (error) {
      console.error('ウォレット接続エラー:', error);
    }
  };

  const handleClose = () => {
    setSelectedWallet(null);
    setShowPrivateKeyInput(false);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div css={overlayStyle} onClick={handleClose}>
      <div css={modalStyle(theme)} onClick={(e) => e.stopPropagation()}>
        <h3 css={titleStyle(theme)}>ウォレット接続</h3>
        
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

          <div css={fieldStyle}>
            <label css={labelStyle(theme)}>ウォレットを選択</label>
            <div css={walletListStyle}>
              {walletConnections.map(wallet => (
                <button
                  key={wallet.type}
                  type="button"
                  css={walletButtonStyle(theme, selectedWallet === wallet.type)}
                  onClick={() => handleWalletSelect(wallet.type)}
                  disabled={!wallet.isInstalled}
                >
                  <span css={walletIconStyle}>{wallet.icon}</span>
                  <span css={walletNameStyle}>
                    {wallet.name}
                    {!wallet.isInstalled && (
                      <span css={notInstalledStyle}> (未インストール)</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {showPrivateKeyInput && (
            <div css={fieldStyle}>
              <label css={labelStyle(theme)}>秘密鍵 (オプション)</label>
              <input
                type="password"
                css={inputStyle(theme)}
                placeholder="秘密鍵を入力、または空欄で環境変数を使用"
                {...register('privateKey')}
              />
              <div css={helpTextStyle(theme)}>
                <small>
                  秘密鍵を入力しない場合は、環境変数のPRIVATE_KEYが使用されます。
                </small>
              </div>
            </div>
          )}

          {error && (
            <div css={errorStyle(theme)}>{error}</div>
          )}

          <div css={actionsStyle}>
            <button
              type="button"
              css={buttonStyle(theme, 'secondary')}
              onClick={handleClose}
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              css={buttonStyle(theme, 'primary')}
              disabled={isLoading || !selectedWallet}
            >
              {isLoading ? '接続中...' : '接続'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
`;

const modalStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const titleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text};
  font-size: 1.25rem;
  text-align: center;
`;

const fieldStyle = css`
  margin-bottom: 1.5rem;
`;

const labelStyle = (theme: Theme) => css`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`;

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
`;

const walletListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const walletButtonStyle = (theme: Theme, isSelected: boolean) => css`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${isSelected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${isSelected ? theme.colors.primary + '10' : theme.colors.background};
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${isSelected ? theme.colors.primary + '20' : theme.colors.surface};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const walletIconStyle = css`
  font-size: 1.5rem;
`;

const walletNameStyle = css`
  flex: 1;
  text-align: left;
`;

const notInstalledStyle = css`
  font-size: 0.8rem;
  opacity: 0.6;
`;

const inputStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const helpTextStyle = (theme: Theme) => css`
  color: ${theme.colors.textSecondary};
  font-size: 0.8rem;
  margin-top: ${theme.spacing.xs};
  line-height: 1.4;
`;

const errorStyle = (theme: Theme) => css`
  color: ${theme.colors.error};
  font-size: 0.85rem;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.error}10;
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.md};
`;

const actionsStyle = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const buttonStyle = (theme: Theme, variant: 'primary' | 'secondary') => css`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
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
`;

export default WalletSelectionModal;