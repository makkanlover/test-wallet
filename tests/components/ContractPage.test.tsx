import { screen, fireEvent } from '@testing-library/react';
import { render } from '../utils/testUtils';
import ContractPage from '../../ui/pages/ContractPage';

describe('ContractPage', () => {
  it('未接続状態でメッセージが表示される', () => {
    render(<ContractPage />);
    
    expect(screen.getByText('ウォレットが接続されていません')).toBeInTheDocument();
    expect(screen.getByText('コントラクトをデプロイするには、まずウォレットを接続してください。')).toBeInTheDocument();
  });

  it('接続済み状態で開発中の警告とタブが表示される', () => {
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

    render(<ContractPage />, { preloadedState });
    
    expect(screen.getByText('コントラクト作成')).toBeInTheDocument();
    expect(screen.getByText('🚧 開発中の機能')).toBeInTheDocument();
    expect(screen.getByText('現在、コントラクトのデプロイ機能は開発中です。')).toBeInTheDocument();
    
    expect(screen.getByText('🪙 ERC20作成')).toBeInTheDocument();
    expect(screen.getByText('🖼️ ERC721作成')).toBeInTheDocument();
    expect(screen.getByText('📋 コントラクト一覧')).toBeInTheDocument();
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

    render(<ContractPage />, { preloadedState });
    
    // デフォルトではERC20タブが選択
    expect(screen.getByText('ERC20トークン作成')).toBeInTheDocument();
    
    // ERC721タブをクリック
    const erc721Tab = screen.getByText('🖼️ ERC721作成');
    fireEvent.click(erc721Tab);
    expect(screen.getByText('ERC721 NFTコレクション作成')).toBeInTheDocument();
    
    // コントラクト一覧タブをクリック
    const listTab = screen.getByText('📋 コントラクト一覧');
    fireEvent.click(listTab);
    expect(screen.getByText('デプロイ済みコントラクト')).toBeInTheDocument();
  });

  it('コントラクト一覧が空の場合のメッセージが表示される', () => {
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
      contract: {
        contracts: [],
        isLoading: false,
        error: null,
        deployedContract: null,
        gasEstimate: null,
      }
    };

    render(<ContractPage />, { preloadedState });
    
    // コントラクト一覧タブをクリック
    const listTab = screen.getByText('📋 コントラクト一覧');
    fireEvent.click(listTab);
    
    expect(screen.getByText('コントラクトがありません')).toBeInTheDocument();
    expect(screen.getByText('コントラクトをデプロイすると、ここに一覧が表示されます。')).toBeInTheDocument();
  });

  it('ERC20フォームの基本要素が表示される', () => {
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

    render(<ContractPage />, { preloadedState });
    
    expect(screen.getByText('📖 ERC20トークンについて')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: My Token')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: MTK')).toBeInTheDocument();
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
    expect(screen.getByText('ガス見積もり')).toBeInTheDocument();
    expect(screen.getByText('デプロイ')).toBeInTheDocument();
  });
});