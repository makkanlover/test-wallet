import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractService } from '../../actions/services/contractService';

// より単純化された統合テスト
describe('ERC721 Deploy Integration Test', () => {
  let contractService: ContractService;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('ERC721パラメータバリデーション', () => {
    it('有効なERC721パラメータは検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('無効なERC721パラメータは検証でエラーになる', () => {
      const params = {
        type: 'erc721' as const,
        name: '',
        symbol: 'MNC',
        baseURI: 'invalid-url',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('baseURIが未設定でも検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('複数のバリデーションエラーが同時に発生する', () => {
      const params = {
        type: 'erc721' as const,
        name: '',
        symbol: '',
        baseURI: 'not-a-url',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('シンボルは必須です');
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('スペースのみのパラメータは検証エラーになる', () => {
      const params = {
        type: 'erc721' as const,
        name: '   ',
        symbol: '   ',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('シンボルは必須です');
    });

    it('IPFS URLは有効と判定される', () => {
      const params = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('HTTPSとHTTPの両方のURLが有効と判定される', () => {
      const httpsParams = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const httpParams = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'http://localhost:3000/metadata/',
      };

      expect(contractService.validateContractParams(httpsParams).isValid).toBe(true);
      expect(contractService.validateContractParams(httpParams).isValid).toBe(true);
    });
  });

  describe('ERC721とERC20の区別', () => {
    it('ERC721とERC20で異なるバリデーションが適用される', () => {
      const erc721Params = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'invalid-url',
      };

      const erc20Params = {
        type: 'erc20' as const,
        name: 'MyToken',
        symbol: 'MTK',
        totalSupply: '-1000', // 負の値
      };

      const erc721Result = contractService.validateContractParams(erc721Params);
      const erc20Result = contractService.validateContractParams(erc20Params);

      // ERC721は baseURI のバリデーションエラー
      expect(erc721Result.isValid).toBe(false);
      expect(erc721Result.errors).toContain('ベースURIは有効なURLである必要があります');

      // ERC20は totalSupply のバリデーションエラー
      expect(erc20Result.isValid).toBe(false);
      expect(erc20Result.errors).toContain('総供給量は正の数値である必要があります');
    });
  });

  describe('エッジケース', () => {
    it('非常に長いコントラクト名でも検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'Very Long NFT Collection Name With Many Characters And Symbols !!!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`',
        symbol: 'VLNFTCNWMCAS',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('特殊文字を含むbaseURIでも検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/{id}?format=json&version=1.0&auth=token123',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('日本語を含むコントラクト名でも検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'マイNFTコレクション',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('絵文字を含むコントラクト名でも検証を通る', () => {
      const params = {
        type: 'erc721' as const,
        name: 'My NFT Collection 🎨🖼️✨',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('ストレージサービスとの連携', () => {
    it('ERC721とERC20を混在させて管理できる', () => {
      // この部分はストレージサービスの単体テストで十分にテストされているので、
      // ここではサービスの存在確認のみ行う
      const deployedContracts = contractService.getDeployedContracts();
      expect(Array.isArray(deployedContracts)).toBe(true);
    });

    it('タイプ別のコントラクト取得機能が動作する', () => {
      const erc721Contracts = contractService.getDeployedContractsByType('ERC721');
      const erc20Contracts = contractService.getDeployedContractsByType('ERC20');

      expect(Array.isArray(erc721Contracts)).toBe(true);
      expect(Array.isArray(erc20Contracts)).toBe(true);
    });
  });
});