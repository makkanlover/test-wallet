import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractService } from '../../actions/services/contractService';

// より単純化されたthunkテスト
describe('contractThunks', () => {
  let contractService: ContractService;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('ContractService統合テスト', () => {
    it('ERC721パラメータのバリデーションが正常に動作する', () => {
      const validParams = {
        type: 'erc721' as const,
        name: 'TestNFT',
        symbol: 'TNF',
        baseURI: 'https://example.com/metadata/',
      };

      const result = contractService.validateContractParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('ERC20パラメータのバリデーションが正常に動作する', () => {
      const validParams = {
        type: 'erc20' as const,
        name: 'TestToken',
        symbol: 'TTK',
        decimals: 18,
        totalSupply: '1000000',
      };

      const result = contractService.validateContractParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('無効なERC721パラメータでバリデーションが失敗する', () => {
      const invalidParams = {
        type: 'erc721' as const,
        name: '',
        symbol: 'TNF',
        baseURI: 'invalid-url',
      };

      const result = contractService.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('無効なERC20パラメータでバリデーションが失敗する', () => {
      const invalidParams = {
        type: 'erc20' as const,
        name: 'TestToken',
        symbol: '',
        totalSupply: '-1000',
      };

      const result = contractService.validateContractParams(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('シンボルは必須です');
      expect(result.errors).toContain('総供給量は正の数値である必要があります');
    });

    it('サポートされていないコントラクトタイプのハンドリング', () => {
      const unsupportedParams = {
        type: 'unsupported' as any,
        name: 'Test',
        symbol: 'TST',
      };

      const result = contractService.validateContractParams(unsupportedParams);

      // unsupportedタイプでも基本的なバリデーションは行われる
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('ストレージサービスとの連携', () => {
    it('デプロイされたコントラクトの管理機能が動作する', () => {
      const allContracts = contractService.getDeployedContracts();
      const erc721Contracts = contractService.getDeployedContractsByType('ERC721');
      const erc20Contracts = contractService.getDeployedContractsByType('ERC20');

      expect(Array.isArray(allContracts)).toBe(true);
      expect(Array.isArray(erc721Contracts)).toBe(true);
      expect(Array.isArray(erc20Contracts)).toBe(true);
    });

    it('個別のコントラクト検索機能が動作する', () => {
      const contractById = contractService.getDeployedContractById('test-id');
      const contractByAddress = contractService.getDeployedContractByAddress('0x1234567890123456789012345678901234567890');

      expect(contractById).toBeNull();
      expect(contractByAddress).toBeNull();
    });
  });

  describe('コンパイル済みコントラクトの取得', () => {
    it('利用可能なコントラクト一覧を取得できる', async () => {
      const contracts = await contractService.getCompiledContracts();
      
      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts).toContain('SimpleERC20');
      expect(contracts).toContain('SimpleERC721');
    });
  });

  describe('ERC721特有の機能', () => {
    it('ERC721のbaseURIバリデーションが正しく動作する', () => {
      const testCases = [
        { baseURI: 'https://api.example.com/metadata/', expected: true },
        { baseURI: 'http://localhost:3000/metadata/', expected: true },
        { baseURI: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/', expected: true },
        { baseURI: 'invalid-url', expected: false },
        { baseURI: '', expected: true }, // 空文字列は設定なしとして扱われる
        { baseURI: undefined, expected: true }, // 未設定は許可
      ];

      testCases.forEach(({ baseURI, expected }) => {
        const params = {
          type: 'erc721' as const,
          name: 'TestNFT',
          symbol: 'TNF',
          ...(baseURI !== undefined && { baseURI }),
        };

        const result = contractService.validateContractParams(params);
        expect(result.isValid).toBe(expected);
      });
    });

    it('ERC721の複雑なbaseURIパターンをテストする', () => {
      const complexBaseURIs = [
        'https://api.example.com/metadata/{id}?format=json&version=1.0',
        'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/{id}',
        'https://myapp.com/nft/metadata/{tokenId}.json',
        'https://api.opensea.io/api/v1/metadata/0x495f947276749ce646f68ac8c248420045cb7b5e/{id}',
      ];

      complexBaseURIs.forEach(baseURI => {
        const params = {
          type: 'erc721' as const,
          name: 'TestNFT',
          symbol: 'TNF',
          baseURI,
        };

        const result = contractService.validateContractParams(params);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('複数のバリデーションエラーが適切に処理される', () => {
      const multipleErrorParams = {
        type: 'erc721' as const,
        name: '',
        symbol: '',
        baseURI: 'not-a-url',
      };

      const result = contractService.validateContractParams(multipleErrorParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('シンボルは必須です');
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('エッジケースの処理', () => {
      const edgeCases = [
        { name: '   ', symbol: 'TST', type: 'erc721' as const }, // スペースのみ
        { name: 'Test', symbol: '   ', type: 'erc721' as const }, // スペースのみ
        { name: 'Test', symbol: 'TST', type: 'erc20' as const, totalSupply: '0' }, // ゼロ
        { name: 'Test', symbol: 'TST', type: 'erc20' as const, totalSupply: 'abc' }, // 文字列
      ];

      edgeCases.forEach(params => {
        const result = contractService.validateContractParams(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});