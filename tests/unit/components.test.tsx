import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@emotion/react';
import WalletInfoPage from '../../ui/pages/WalletInfoPage';
import WalletConnectionModal from '../../ui/components/WalletConnectionModal';
import walletReducer from '../../actions/slices/walletSlice';
import transactionReducer from '../../actions/slices/transactionSlice';
import contractReducer from '../../actions/slices/contractSlice';
import settingsReducer from '../../actions/slices/settingsSlice';
import { lightTheme } from '../../ui/themes';

// モックストアを作成
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      wallet: walletReducer,
      transaction: transactionReducer,
      contract: contractReducer,
      settings: settingsReducer,
    },
    preloadedState: initialState,
  });
};

// テスト用ラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode; store: any }> = ({ children, store }) => (
  <Provider store={store}>
    <ThemeProvider theme={lightTheme}>
      {children}
    </ThemeProvider>
  </Provider>
);

describe('React Components', () => {
  describe('WalletInfoPage', () => {
    it('未接続状態で正しく表示される', () => {
      const store = createMockStore({
        wallet: {
          address: null,
          balance: '0',
          network: {
            id: 'sepolia',
            name: 'Ethereum Sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/',
            chainId: 11155111,
            currency: 'SepoliaETH'
          },
          isConnected: false,
          connectionType: null,
          provider: null,
          isLoading: false,
          error: null,
        }
      });

      render(
        <TestWrapper store={store}>
          <WalletInfoPage />
        </TestWrapper>
      );

      expect(screen.getByText('ウォレット情報')).toBeInTheDocument();
      expect(screen.getByText('❌ 未接続')).toBeInTheDocument();
      expect(screen.getByText('ローカルウォレット接続')).toBeInTheDocument();
    });

    it('接続済み状態で正しく表示される', () => {
      const mockAddress = '0x742d35Cc8Bb5e54DFBE08774c9F49c1CeFb2a8C3';
      const store = createMockStore({
        wallet: {
          address: mockAddress,
          balance: '1.5',
          network: {
            id: 'sepolia',
            name: 'Ethereum Sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/',
            chainId: 11155111,
            currency: 'SepoliaETH'
          },
          isConnected: true,
          connectionType: 'local',
          provider: {},
          isLoading: false,
          error: null,
        }
      });

      render(
        <TestWrapper store={store}>
          <WalletInfoPage />
        </TestWrapper>
      );

      expect(screen.getByText('✅ 接続済み')).toBeInTheDocument();
      expect(screen.getByText('接続タイプ: ローカル')).toBeInTheDocument();
      expect(screen.getByText(mockAddress)).toBeInTheDocument();
      expect(screen.getByText('1.5 SepoliaETH')).toBeInTheDocument();
      expect(screen.getByText('残高更新')).toBeInTheDocument();
      expect(screen.getByText('切断')).toBeInTheDocument();
    });

    it('エラー状態で正しく表示される', () => {
      const errorMessage = 'ネットワークエラーが発生しました';
      const store = createMockStore({
        wallet: {
          address: null,
          balance: '0',
          network: {
            id: 'sepolia',
            name: 'Ethereum Sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/',
            chainId: 11155111,
            currency: 'SepoliaETH'
          },
          isConnected: false,
          connectionType: null,
          provider: null,
          isLoading: false,
          error: errorMessage,
        }
      });

      render(
        <TestWrapper store={store}>
          <WalletInfoPage />
        </TestWrapper>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('WalletConnectionModal', () => {
    it('モーダルが正しく表示される', () => {
      const mockOnClose = vi.fn();
      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <WalletConnectionModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.getByText('ローカルウォレット接続')).toBeInTheDocument();
      expect(screen.getByText('環境変数から秘密鍵を取得してローカルウォレットに接続します。')).toBeInTheDocument();
      expect(screen.getByText('ネットワーク')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ethereum Sepolia')).toBeInTheDocument();
    });

    it('閉じられた状態では表示されない', () => {
      const mockOnClose = vi.fn();
      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <WalletConnectionModal isOpen={false} onClose={mockOnClose} />
        </TestWrapper>
      );

      expect(screen.queryByText('ローカルウォレット接続')).not.toBeInTheDocument();
    });

    it('キャンセルボタンでモーダルが閉じられる', () => {
      const mockOnClose = vi.fn();
      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <WalletConnectionModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('キャンセル'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('ネットワークを選択できる', async () => {
      const mockOnClose = vi.fn();
      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <WalletConnectionModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      const networkSelect = screen.getByDisplayValue('Ethereum Sepolia');
      fireEvent.change(networkSelect, { target: { value: 'amoy' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Polygon Amoy')).toBeInTheDocument();
      });
    });
  });
});