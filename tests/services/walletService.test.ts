import { WalletService } from '../../actions/services/walletService';
import { ethers } from 'ethers';

// ethersのモック
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(),
  Wallet: jest.fn(),
  formatEther: jest.fn(),
  parseEther: jest.fn(),
  getBigInt: jest.fn(),
  parseUnits: jest.fn(),
  formatUnits: jest.fn(),
  isAddress: jest.fn(),
}));

describe('WalletService', () => {
  let walletService: WalletService;
  const mockProvider = {
    getBalance: jest.fn(),
    estimateGas: jest.fn(),
    getFeeData: jest.fn(),
  };
  const mockWallet = {
    getAddress: jest.fn(),
    sendTransaction: jest.fn(),
  };

  beforeEach(() => {
    walletService = WalletService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスが返される', () => {
      const instance1 = WalletService.getInstance();
      const instance2 = WalletService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateAddress', () => {
    it('有効なアドレスでtrueが返される', () => {
      (ethers.isAddress as jest.Mock).mockReturnValue(true);
      
      const result = walletService.validateAddress('0x1234567890123456789012345678901234567890');
      expect(result).toBe(true);
      expect(ethers.isAddress).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
    });

    it('無効なアドレスでfalseが返される', () => {
      (ethers.isAddress as jest.Mock).mockReturnValue(false);
      
      const result = walletService.validateAddress('invalid-address');
      expect(result).toBe(false);
    });

    it('例外が発生した場合falseが返される', () => {
      (ethers.isAddress as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid address');
      });
      
      const result = walletService.validateAddress('0x123');
      expect(result).toBe(false);
    });
  });

  describe('validatePrivateKey', () => {
    it('有効な秘密鍵でtrueが返される', () => {
      (ethers.Wallet as jest.Mock).mockImplementation(() => ({})); // 正常に作成される
      
      const result = walletService.validatePrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
    });

    it('0xプレフィックスがない秘密鍵でも処理される', () => {
      (ethers.Wallet as jest.Mock).mockImplementation(() => ({}));
      
      const result = walletService.validatePrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
      expect(ethers.Wallet).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });

    it('無効な秘密鍵でfalseが返される', () => {
      (ethers.Wallet as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid private key');
      });
      
      const result = walletService.validatePrivateKey('invalid-key');
      expect(result).toBe(false);
    });
  });

  describe('connectWithPrivateKey', () => {
    const testNetwork = {
      id: 'goerli',
      name: 'Ethereum Goerli',
      rpcUrl: 'https://goerli.infura.io/v3/',
      chainId: 5,
      currency: 'GoerliETH'
    };

    it('正常に接続される', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      (ethers.JsonRpcProvider as jest.Mock).mockImplementation(() => mockProvider);
      (ethers.Wallet as jest.Mock).mockImplementation(() => mockWallet);
      mockWallet.getAddress.mockResolvedValue(testAddress);

      const result = await walletService.connectWithPrivateKey('0x123...', testNetwork);
      
      expect(result.address).toBe(testAddress);
      expect(result.provider).toBe(mockProvider);
      expect(result.wallet).toBe(mockWallet);
    });

    it('エラーが発生した場合例外がスローされる', async () => {
      (ethers.JsonRpcProvider as jest.Mock).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await expect(
        walletService.connectWithPrivateKey('0x123...', testNetwork)
      ).rejects.toThrow('ウォレット接続に失敗しました: Connection failed');
    });
  });

  describe('getBalance', () => {
    it('正常に残高が取得される', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const testBalance = '1500000000000000000'; // 1.5 ETH in wei
      
      // プロバイダーを設定
      walletService['provider'] = mockProvider as any;
      mockProvider.getBalance.mockResolvedValue(testBalance);
      (ethers.formatEther as jest.Mock).mockReturnValue('1.5');

      const result = await walletService.getBalance(testAddress);
      
      expect(result).toBe('1.5');
      expect(mockProvider.getBalance).toHaveBeenCalledWith(testAddress);
      expect(ethers.formatEther).toHaveBeenCalledWith(testBalance);
    });

    it('プロバイダーが初期化されていない場合例外がスローされる', async () => {
      walletService['provider'] = null;

      await expect(
        walletService.getBalance('0x123...')
      ).rejects.toThrow('プロバイダーが初期化されていません');
    });
  });

  describe('disconnect', () => {
    it('プロバイダーとウォレットがリセットされる', () => {
      walletService['provider'] = mockProvider as any;
      walletService['wallet'] = mockWallet as any;

      walletService.disconnect();

      expect(walletService['provider']).toBeNull();
      expect(walletService['wallet']).toBeNull();
    });
  });

  describe('getProvider', () => {
    it('現在のプロバイダーが返される', () => {
      walletService['provider'] = mockProvider as any;
      expect(walletService.getProvider()).toBe(mockProvider);
    });
  });

  describe('getWallet', () => {
    it('現在のウォレットが返される', () => {
      walletService['wallet'] = mockWallet as any;
      expect(walletService.getWallet()).toBe(mockWallet);
    });
  });
});