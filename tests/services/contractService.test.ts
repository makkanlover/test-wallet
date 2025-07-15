import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractService } from '../../actions/services/contractService';

describe('ContractService', () => {
  let service: ContractService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = ContractService.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = ContractService.getInstance();
      const instance2 = ContractService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateContractParams', () => {
    it('有効なERC20パラメータの場合はvalidを返す', () => {
      const validParams = {
        name: 'TestToken',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: '1000000'
      };

      const result = service.validateContractParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('有効なERC721パラメータの場合はvalidを返す', () => {
      const validParams = {
        name: 'TestNFT',
        symbol: 'TNF',
        type: 'erc721' as const,
        baseURI: 'https://example.com/metadata/'
      };

      const result = service.validateContractParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('無効なパラメータの場合はinvalidを返す', () => {
      const invalidParams = {
        name: '',
        symbol: '',
        type: 'erc20' as const,
        totalSupply: ''
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('nameが空の場合はエラーを返す', () => {
      const invalidParams = {
        name: '',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: '1000000'
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
    });

    it('symbolが空の場合はエラーを返す', () => {
      const invalidParams = {
        name: 'TestToken',
        symbol: '',
        type: 'erc20' as const,
        totalSupply: '1000000'
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('シンボルは必須です');
    });

    it('ERC20でtotalSupplyが空の場合は検証をスキップする', () => {
      const validParams = {
        name: 'TestToken',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: ''
      };

      const result = service.validateContractParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('ERC20でtotalSupplyが負の値の場合はエラーを返す', () => {
      const invalidParams = {
        name: 'TestToken',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: '-1000'
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('総供給量は正の数値である必要があります');
    });

    it('ERC20でtotalSupplyが数値でない場合はエラーを返す', () => {
      const invalidParams = {
        name: 'TestToken',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: 'invalid'
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('総供給量は正の数値である必要があります');
    });

    it('ERC20でdecimalsが範囲外の場合はエラーを返す', () => {
      const invalidParams = {
        name: 'TestToken',
        symbol: 'TTK',
        type: 'erc20' as const,
        totalSupply: '1000000',
        decimals: 25
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('小数点桁数は0-18の範囲で設定してください');
    });

    it('ERC721でbaseURIが無効な場合はエラーを返す', () => {
      const invalidParams = {
        name: 'TestNFT',
        symbol: 'TNF',
        type: 'erc721' as const,
        baseURI: 'invalid-url'
      };

      const result = service.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });
  });

  describe('getDeployedContracts', () => {
    it('初期状態では空配列を返す', () => {
      const contracts = service.getDeployedContracts();
      
      expect(contracts).toEqual([]);
    });
  });

  describe('getDeployedContractsByType', () => {
    it('初期状態では空配列を返す', () => {
      const contracts = service.getDeployedContractsByType('erc20');
      
      expect(contracts).toEqual([]);
    });
  });

  describe('getDeployedContractById', () => {
    it('初期状態ではnullを返す', () => {
      const contract = service.getDeployedContractById('test-id');
      
      expect(contract).toBeNull();
    });
  });

  describe('getDeployedContractByAddress', () => {
    it('初期状態ではnullを返す', () => {
      const contract = service.getDeployedContractByAddress('0x1234567890123456789012345678901234567890');
      
      expect(contract).toBeNull();
    });
  });
});