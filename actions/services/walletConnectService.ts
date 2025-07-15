import { ethers } from 'ethers';
import { UniversalProvider } from '@walletconnect/universal-provider';
import { WalletConnectOptions } from '../../types/walletconnect';
import { Network } from '../slices/walletSlice';

export class WalletConnectService {
  private static instance: WalletConnectService;
  private provider: UniversalProvider | null = null;
  private ethersProvider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  static getInstance(): WalletConnectService {
    if (!WalletConnectService.instance) {
      WalletConnectService.instance = new WalletConnectService();
    }
    return WalletConnectService.instance;
  }

  async initializeProvider(options: WalletConnectOptions): Promise<void> {
    try {
      this.provider = await UniversalProvider.init({
        projectId: options.projectId,
        metadata: options.metadata,
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'light',
          themeVariables: {
            '--wcm-z-index': '1000'
          }
        }
      });

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      throw new Error(`WalletConnect初期化に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return;

    this.provider.on('display_uri', (uri: string) => {
      console.log('QR Code URI:', uri);
    });

    this.provider.on('session_ping', (event: any) => {
      console.log('Session ping:', event);
    });

    this.provider.on('session_event', (event: any) => {
      console.log('Session event:', event);
    });

    this.provider.on('session_update', (event: any) => {
      console.log('Session update:', event);
    });

    this.provider.on('session_delete', (event: any) => {
      console.log('Session delete:', event);
      this.cleanup();
    });

    this.provider.on('accountsChanged', (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      // アカウント変更時の処理
    });

    this.provider.on('chainChanged', (chainId: string) => {
      console.log('Chain changed:', chainId);
      // チェーン変更時の処理
    });
  }

  async connect(network: Network): Promise<{
    address: string;
    provider: ethers.BrowserProvider;
    walletName: string;
  }> {
    try {
      if (!this.provider) {
        throw new Error('プロバイダーが初期化されていません');
      }

      // 接続要求
      const session = await this.provider.connect({
        namespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
              'eth_signTypedData_v4',
              'eth_accounts',
              'eth_requestAccounts',
              'eth_getBalance',
              'eth_sendRawTransaction',
              'eth_estimateGas',
              'eth_gasPrice',
              'eth_blockNumber',
              'eth_getTransactionCount',
              'eth_getTransactionByHash',
              'eth_getTransactionReceipt',
              'eth_chainId',
              'net_version'
            ],
            chains: [`eip155:${network.chainId}`],
            events: ['chainChanged', 'accountsChanged']
          }
        }
      });

      // Ethers.jsプロバイダーを作成
      this.ethersProvider = new ethers.BrowserProvider(this.provider);
      this.signer = await this.ethersProvider.getSigner();
      const address = await this.signer.getAddress();

      // 接続されたウォレットの名前を取得
      const walletName = session.peer?.metadata?.name || 'WalletConnect';

      return {
        address,
        provider: this.ethersProvider,
        walletName
      };
    } catch (error) {
      throw new Error(`WalletConnect接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider && this.provider.session) {
        await this.provider.disconnect();
      }
      this.cleanup();
    } catch (error) {
      console.error('WalletConnect切断エラー:', error);
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.provider = null;
    this.ethersProvider = null;
    this.signer = null;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.ethersProvider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  isConnected(): boolean {
    return this.provider?.session !== undefined;
  }

  getConnectedAccounts(): string[] {
    if (!this.provider?.session) return [];
    
    const accounts = this.provider.session.namespaces.eip155?.accounts || [];
    return accounts.map(account => account.split(':')[2]);
  }

  getConnectedChains(): number[] {
    if (!this.provider?.session) return [];
    
    const chains = this.provider.session.namespaces.eip155?.chains || [];
    return chains.map(chain => parseInt(chain.split(':')[1]));
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider || !this.provider.session) {
      throw new Error('WalletConnectが接続されていません');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (error) {
      throw new Error(`チェーン切り替えに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default WalletConnectService;