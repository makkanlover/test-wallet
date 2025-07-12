import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from '../../actions/services/walletService';

// ethersのモック
vi.mock('ethers', () => ({
  JsonRpcProvider: vi.fn(),
  Wallet: vi.fn(),
  formatEther: vi.fn(),
  parseEther: vi.fn(),
  getBigInt: vi.fn(),
  parseUnits: vi.fn(),
  formatUnits: vi.fn(),
  isAddress: vi.fn(),
}));

import { ethers } from 'ethers';

describe('WalletService', () => {
  let walletService: WalletService;
  const mockProvider = {
    getBalance: vi.fn(),
    estimateGas: vi.fn(),
    getFeeData: vi.fn(),
  };
  const mockWallet = {
    getAddress: vi.fn(),
    sendTransaction: vi.fn(),
  };

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
      (ethers.Wallet as any).mockImplementation(() => ({}));
      
      const result = walletService.validatePrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
    });

    it('0xプレフィックスがない秘密鍵でも処理される', () => {
      (ethers.Wallet as any).mockImplementation(() => ({}));
      
      const result = walletService.validatePrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(result).toBe(true);
      expect(ethers.Wallet).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });

    it('無効な秘密鍵でfalseが返される', () => {
      (ethers.Wallet as any).mockImplementation(() => {
        throw new Error('Invalid private key');
      });
      
      const result = walletService.validatePrivateKey('invalid-key');
      expect(result).toBe(false);
    });
  });
});