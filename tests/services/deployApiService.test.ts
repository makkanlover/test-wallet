import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deployContract, estimateGas } from '../../actions/services/deployApiService';

// global fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('deployApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('deployContract', () => {
    it('ERC20コントラクトのデプロイが成功する', async () => {
      const mockResponse = {
        success: true,
        contractAddress: '0x1234567890123456789012345678901234567890',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        verified: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const params = {
        type: 'erc20',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        verify: true
      };

      const result = await deployContract(params);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      expect(result).toEqual(mockResponse);
    });

    it('デプロイが失敗した場合エラーを投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const params = {
        type: 'erc20',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        verify: false
      };

      await expect(deployContract(params)).rejects.toThrow('HTTP error! status: 500');
    });

    it('ネットワークエラーの場合エラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const params = {
        type: 'erc20',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        verify: false
      };

      await expect(deployContract(params)).rejects.toThrow('Network error');
    });
  });

  describe('estimateGas', () => {
    it('ガス見積もりが成功する', async () => {
      const mockResponse = {
        success: true,
        gasLimit: '2100000',
        gasPrice: '20.0',
        estimatedFee: '0.042'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const params = {
        type: 'erc20',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        network: 'sepolia'
      };

      const result = await estimateGas(params);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/estimate-gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      expect(result).toEqual(mockResponse);
    });

    it('ガス見積もりが失敗した場合エラーレスポンスを返す', async () => {
      const mockResponse = {
        success: false,
        error: 'Gas estimation failed'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const params = {
        type: 'erc20',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        network: 'sepolia'
      };

      const result = await estimateGas(params);

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Gas estimation failed');
    });
  });
});