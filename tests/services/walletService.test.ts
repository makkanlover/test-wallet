import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from '../../actions/services/walletService';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = WalletService.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = WalletService.getInstance();
      const instance2 = WalletService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateAddress', () => {
    it('有効なアドレスの場合はtrueを返す', () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      
      const result = service.validateAddress(validAddress);
      
      expect(result).toBe(true);
    });

    it('無効なアドレスの場合はfalseを返す', () => {
      const invalidAddress = '0x123';
      
      const result = service.validateAddress(invalidAddress);
      
      expect(result).toBe(false);
    });

    it('空文字の場合はfalseを返す', () => {
      const result = service.validateAddress('');
      
      expect(result).toBe(false);
    });

    it('nullの場合はfalseを返す', () => {
      const result = service.validateAddress(null as any);
      
      expect(result).toBe(false);
    });
  });

  describe('validatePrivateKey', () => {
    it('有効なプライベートキーの場合はtrueを返す', () => {
      const validPrivateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      
      const result = service.validatePrivateKey(validPrivateKey);
      
      expect(result).toBe(true);
    });

    it('0xプレフィックスなしの有効なプライベートキーの場合はtrueを返す', () => {
      const validPrivateKey = '1234567890123456789012345678901234567890123456789012345678901234';
      
      const result = service.validatePrivateKey(validPrivateKey);
      
      expect(result).toBe(true);
    });

    it('短すぎるプライベートキーの場合はfalseを返す', () => {
      const shortPrivateKey = '0x123456';
      
      const result = service.validatePrivateKey(shortPrivateKey);
      
      expect(result).toBe(false);
    });

    it('無効な文字が含まれている場合はfalseを返す', () => {
      const invalidPrivateKey = '0x123456789012345678901234567890123456789012345678901234567890123g';
      
      const result = service.validatePrivateKey(invalidPrivateKey);
      
      expect(result).toBe(false);
    });

    it('空文字の場合はfalseを返す', () => {
      const result = service.validatePrivateKey('');
      
      expect(result).toBe(false);
    });

    it('nullの場合はfalseを返す', () => {
      const result = service.validatePrivateKey(null as any);
      
      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('接続を切断する', async () => {
      await service.disconnect();
      
      expect(service.getProvider()).toBeNull();
      expect(service.getWallet()).toBeNull();
      expect(service.getSigner()).toBeNull();
    });
  });

  describe('getProvider', () => {
    it('初期状態ではnullを返す', () => {
      const provider = service.getProvider();
      
      expect(provider).toBeNull();
    });
  });

  describe('getWallet', () => {
    it('初期状態ではnullを返す', () => {
      const wallet = service.getWallet();
      
      expect(wallet).toBeNull();
    });
  });

  describe('getSigner', () => {
    it('初期状態ではnullを返す', () => {
      const signer = service.getSigner();
      
      expect(signer).toBeNull();
    });
  });
});