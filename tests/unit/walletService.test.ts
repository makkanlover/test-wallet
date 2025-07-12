import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from '../../actions/services/walletService';
import { MOCK_ADDRESS, MOCK_BALANCE, mockEthers } from '../mocks/ethers';
import { ethers } from 'ethers';

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = WalletService.getInstance();
    vi.clearAllMocks();
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
      (ethers.isAddress as any).mockReturnValue(true);
      
      const result = walletService.validateAddress('0x1234567890123456789012345678901234567890');
      expect(result).toBe(true);
      expect(ethers.isAddress).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
    });

    it('無効なアドレスでfalseが返される', () => {
      (ethers.isAddress as any).mockReturnValue(false);
      
      const result = walletService.validateAddress('invalid-address');
      expect(result).toBe(false);
    });

    it('例外が発生した場合falseが返される', () => {
      (ethers.isAddress as any).mockImplementation(() => {
        throw new Error('Invalid address');
      });
      
      const result = walletService.validateAddress('0x123');
      expect(result).toBe(false);
    });
  });

  describe('validatePrivateKey', () => {
    it('有効な秘密鍵でtrueが返される', () => {
      const result = walletService.validatePrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
    });

    it('0xプレフィックスがない秘密鍵でも処理される', () => {
      const result = walletService.validatePrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
    });

    it('無効な秘密鍵でfalseが返される', () => {
      const result = walletService.validatePrivateKey('invalid-key');
      expect(result).toBe(false);
    });
  });

  describe('connectLocalWallet', () => {
    const testNetwork = {
      id: 'sepolia',
      name: 'Ethereum Sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/',
      chainId: 11155111,
      currency: 'SepoliaETH'
    };

    it('環境変数の秘密鍵で正常に接続される', async () => {
      const result = await walletService.connectLocalWallet(testNetwork);
      
      expect(result.address).toBe(MOCK_ADDRESS);
      expect(result.provider).toBeDefined();
      expect(result.wallet).toBeDefined();
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith(testNetwork.rpcUrl);
    });

    it('環境変数に秘密鍵がない場合エラーが発生', async () => {
      // 一時的に環境変数をクリア
      const originalKey = process.env.PRIVATE_KEY;
      delete process.env.PRIVATE_KEY;

      await expect(
        walletService.connectLocalWallet(testNetwork)
      ).rejects.toThrow('秘密鍵が.envファイルに設定されていません');

      // 環境変数を復元
      if (originalKey) process.env.PRIVATE_KEY = originalKey;
    });
  });
});