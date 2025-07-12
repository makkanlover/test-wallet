import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../utils/testUtils';
import WalletInfoPage from '../../ui/pages/WalletInfoPage';

describe('WalletInfoPage', () => {
  it('未接続状態が正しく表示される', () => {
    render(<WalletInfoPage />);
    
    expect(screen.getByText('ウォレット情報')).toBeInTheDocument();
    expect(screen.getByText('❌ 未接続')).toBeInTheDocument();
    expect(screen.getByText('ローカルウォレット接続')).toBeInTheDocument();
    expect(screen.getByText('外部ウォレット接続（開発中）')).toBeInTheDocument();
  });

  it('接続済み状態が正しく表示される', () => {
    const preloadedState = {
      wallet: {
        address: '0x1234567890123456789012345678901234567890',
        balance: '1.5',
        network: {
          id: 'goerli',
          name: 'Ethereum Goerli',
          rpcUrl: 'https://goerli.infura.io/v3/',
          chainId: 5,
          currency: 'GoerliETH'
        },
        isConnected: true,
        connectionType: 'local',
        provider: null,
        isLoading: false,
        error: null,
      }
    };

    render(<WalletInfoPage />, { preloadedState });
    
    expect(screen.getByText('✅ 接続済み')).toBeInTheDocument();
    expect(screen.getByText('接続タイプ: ローカル')).toBeInTheDocument();
    expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument();
    expect(screen.getByText('1.5 GoerliETH')).toBeInTheDocument();
    expect(screen.getByText('Ethereum Goerli')).toBeInTheDocument();
    expect(screen.getByText('残高更新')).toBeInTheDocument();
    expect(screen.getByText('切断')).toBeInTheDocument();
  });

  it('ローカルウォレット接続モーダルが開閉できる', async () => {
    render(<WalletInfoPage />);
    
    const connectButton = screen.getByText('ローカルウォレット接続');
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('ローカルウォレット接続')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0x... または 64文字のHex文字列')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('0x... または 64文字のHex文字列')).not.toBeInTheDocument();
    });
  });

  it('エラー状態が正しく表示される', () => {
    const preloadedState = {
      wallet: {
        address: null,
        balance: '0',
        network: null,
        isConnected: false,
        connectionType: null,
        provider: null,
        isLoading: false,
        error: 'ウォレット接続に失敗しました',
      }
    };

    render(<WalletInfoPage />, { preloadedState });
    
    expect(screen.getByText('ウォレット接続に失敗しました')).toBeInTheDocument();
  });

  it('ローディング状態が正しく表示される', () => {
    const preloadedState = {
      wallet: {
        address: null,
        balance: '0',
        network: null,
        isConnected: false,
        connectionType: null,
        provider: null,
        isLoading: true,
        error: null,
      }
    };

    render(<WalletInfoPage />, { preloadedState });
    
    expect(screen.getByText('接続中...')).toBeInTheDocument();
  });
});