import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionService } from '../../actions/services/transactionService';

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = TransactionService.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = TransactionService.getInstance();
      const instance2 = TransactionService.getInstance();
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

  describe('validateAmount', () => {
    it('有効な金額の場合はtrueを返す', () => {
      const validAmount = '1.5';
      
      const result = service.validateAmount(validAmount);
      
      expect(result).toBe(true);
    });

    it('整数の場合はtrueを返す', () => {
      const validAmount = '100';
      
      const result = service.validateAmount(validAmount);
      
      expect(result).toBe(true);
    });

    it('小数点以下の値でもtrueを返す', () => {
      const validAmount = '1.123456789012345678';
      
      const result = service.validateAmount(validAmount);
      
      expect(result).toBe(true);
    });

    it('長い小数点以下の値でもtrueを返す', () => {
      const validAmount = '1.1234567890123456789';
      
      const result = service.validateAmount(validAmount);
      
      expect(result).toBe(true);
    });

    it('負の値の場合はfalseを返す', () => {
      const invalidAmount = '-1.5';
      
      const result = service.validateAmount(invalidAmount);
      
      expect(result).toBe(false);
    });

    it('ゼロの場合はfalseを返す', () => {
      const invalidAmount = '0';
      
      const result = service.validateAmount(invalidAmount);
      
      expect(result).toBe(false);
    });

    it('空文字の場合はfalseを返す', () => {
      const result = service.validateAmount('');
      
      expect(result).toBe(false);
    });

    it('数値でない場合はfalseを返す', () => {
      const invalidAmount = 'invalid';
      
      const result = service.validateAmount(invalidAmount);
      
      expect(result).toBe(false);
    });

    it('非常に大きな小数点以下の値でもtrueを返す', () => {
      const validAmount = '1.1234567890123456789';
      
      const result = service.validateAmount(validAmount);
      
      expect(result).toBe(true);
    });

    it('nullの場合はfalseを返す', () => {
      const result = service.validateAmount(null as any);
      
      expect(result).toBe(false);
    });
  });
});