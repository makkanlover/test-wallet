import { screen, fireEvent } from '@testing-library/react';
import { render } from '../utils/testUtils';
import TransactionPage from '../../ui/pages/TransactionPage';

describe('TransactionPage', () => {
  it('未接続状態でメッセージが表示される', () => {
    render(<TransactionPage />);
    
    expect(screen.getByText('ウォレットが接続されていません')).toBeInTheDocument();
    expect(screen.getByText('トランザクションを送信するには、まずウォレットを接続してください。')).toBeInTheDocument();
  });

  it('接続済み状態でタブが表示される', () => {
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

    render(<TransactionPage />, { preloadedState });
    
    expect(screen.getByText('トランザクション作成')).toBeInTheDocument();
    expect(screen.getByText('💰 ネイティブトークン')).toBeInTheDocument();
    expect(screen.getByText('🪙 ERC20トークン')).toBeInTheDocument();
    expect(screen.getByText('🖼️ NFT発行')).toBeInTheDocument();
    expect(screen.getByText('📋 履歴')).toBeInTheDocument();
  });

  it('タブの切り替えが正しく動作する', () => {
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

    render(<TransactionPage />, { preloadedState });
    
    // デフォルトではネイティブトークンタブが選択
    expect(screen.getByText('ネイティブトークン送信')).toBeInTheDocument();
    
    // ERC20タブをクリック
    const erc20Tab = screen.getByText('🪙 ERC20トークン');
    fireEvent.click(erc20Tab);
    expect(screen.getByText('ERC20トークン送信')).toBeInTheDocument();
    
    // NFTタブをクリック
    const nftTab = screen.getByText('🖼️ NFT発行');
    fireEvent.click(nftTab);
    expect(screen.getByText('NFT発行')).toBeInTheDocument();
    
    // 履歴タブをクリック
    const historyTab = screen.getByText('📋 履歴');
    fireEvent.click(historyTab);
    expect(screen.getByText('トランザクション履歴')).toBeInTheDocument();
  });

  it('履歴が空の場合のメッセージが表示される', () => {
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
      },
      transaction: {
        history: [],
        isLoading: false,
        error: null,
        pendingTx: null,
        gasEstimate: null,
        tokenInfo: null,
      }
    };

    render(<TransactionPage />, { preloadedState });
    
    // 履歴タブをクリック
    const historyTab = screen.getByText('📋 履歴');
    fireEvent.click(historyTab);
    
    expect(screen.getByText('履歴がありません')).toBeInTheDocument();
    expect(screen.getByText('トランザクションを送信すると、ここに履歴が表示されます。')).toBeInTheDocument();
  });
});