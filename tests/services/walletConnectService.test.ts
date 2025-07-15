import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletConnectService } from '../../actions/services/walletConnectService';

// WalletConnectのモック
vi.mock('@walletconnect/universal-provider', () => ({
  UniversalProvider: {
    init: vi.fn().mockResolvedValue({
      on: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      session: undefined
    })
  }
}));

describe('WalletConnectService', () => {
  let service: WalletConnectService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = WalletConnectService.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = WalletConnectService.getInstance();
      const instance2 = WalletConnectService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('disconnect', () => {
    it('接続を切断する', async () => {
      await service.disconnect();
      
      expect(service.getProvider()).toBeNull();
      expect(service.getSigner()).toBeNull();
    });
  });

  describe('isConnected', () => {
    it('初期状態ではfalseを返す', () => {
      const isConnected = service.isConnected();
      expect(isConnected).toBe(false);
    });
  });

  describe('getConnectedAccounts', () => {
    it('初期状態では空配列を返す', () => {
      const accounts = service.getConnectedAccounts();
      expect(accounts).toEqual([]);
    });
  });

  describe('getConnectedChains', () => {
    it('初期状態では空配列を返す', () => {
      const chains = service.getConnectedChains();
      expect(chains).toEqual([]);
    });
  });

  describe('getProvider', () => {
    it('初期状態ではnullを返す', () => {
      const provider = service.getProvider();
      expect(provider).toBeNull();
    });
  });

  describe('getSigner', () => {
    it('初期状態ではnullを返す', () => {
      const signer = service.getSigner();
      expect(signer).toBeNull();
    });
  });
});