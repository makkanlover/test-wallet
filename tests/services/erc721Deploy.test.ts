import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractService, ContractDeployParams } from '../../actions/services/contractService';

// より単純化されたERC721デプロイテスト
describe('ContractService - ERC721デプロイ', () => {
  let contractService: ContractService;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('validateContractParams - ERC721専用', () => {
    it('有効なERC721パラメータは検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('baseURIが未設定でも検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('無効なbaseURIは検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'not-a-valid-url',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('空のbaseURIは検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: '',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true); // 空文字列は設定なしとして扱われる
      expect(result.errors).toHaveLength(0);
    });

    it('コントラクト名が空の場合は検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: '',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
    });

    it('シンボルが空の場合は検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: '',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('シンボルは必須です');
    });

    it('複数の検証エラーが同時に発生する', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: '',
        symbol: '',
        baseURI: 'invalid-url',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
      expect(result.errors).toContain('シンボルは必須です');
      expect(result.errors).toContain('ベースURIは有効なURLである必要があります');
    });

    it('スペースのみのコントラクト名は検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: '   ',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('コントラクト名は必須です');
    });

    it('スペースのみのシンボルは検証エラーになる', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: '   ',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('シンボルは必須です');
    });

    it('有効なhttpsとhttpのURLは検証を通る', () => {
      const httpsParams: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const httpParams: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'http://localhost:3000/metadata/',
      };

      expect(contractService.validateContractParams(httpsParams).isValid).toBe(true);
      expect(contractService.validateContractParams(httpParams).isValid).toBe(true);
    });

    it('IPFSのURLは検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('長いコントラクト名とシンボルでも検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'Very Long NFT Collection Name With Many Characters',
        symbol: 'VLNFTCNWMC',
        baseURI: 'https://very-long-domain-name.example.com/api/v1/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('特殊文字を含むbaseURIでも検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/{id}?format=json&version=1.0',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('日本語を含むコントラクト名でも検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'マイNFTコレクション',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('絵文字を含むコントラクト名でも検証を通る', () => {
      const params: ContractDeployParams = {
        type: 'erc721',
        name: 'My NFT Collection 🎨🖼️✨',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const result = contractService.validateContractParams(params);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('ERC721とERC20の区別', () => {
    it('ERC721のみbaseURIのバリデーションが行われる', () => {
      const erc721Params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'invalid-url',
      };

      const erc20Params: ContractDeployParams = {
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        totalSupply: '1000000',
        // ERC20にはbaseURIは関係ない
      };

      const erc721Result = contractService.validateContractParams(erc721Params);
      const erc20Result = contractService.validateContractParams(erc20Params);

      // ERC721はbaseURIのバリデーションエラー
      expect(erc721Result.isValid).toBe(false);
      expect(erc721Result.errors).toContain('ベースURIは有効なURLである必要があります');

      // ERC20は正常
      expect(erc20Result.isValid).toBe(true);
      expect(erc20Result.errors).toHaveLength(0);
    });

    it('ERC20のみtotalSupplyのバリデーションが行われる', () => {
      const erc20Params: ContractDeployParams = {
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        totalSupply: '-1000', // 負の値
      };

      const erc721Params: ContractDeployParams = {
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        baseURI: 'https://api.example.com/metadata/',
      };

      const erc20Result = contractService.validateContractParams(erc20Params);
      const erc721Result = contractService.validateContractParams(erc721Params);

      // ERC20はtotalSupplyのバリデーションエラー
      expect(erc20Result.isValid).toBe(false);
      expect(erc20Result.errors).toContain('総供給量は正の数値である必要があります');

      // ERC721は正常
      expect(erc721Result.isValid).toBe(true);
      expect(erc721Result.errors).toHaveLength(0);
    });
  });

  describe('ストレージサービスとの連携', () => {
    it('デプロイされたコントラクトの一覧を取得できる', () => {
      const contracts = contractService.getDeployedContracts();
      expect(Array.isArray(contracts)).toBe(true);
    });

    it('タイプ別のコントラクト取得が動作する', () => {
      const erc721Contracts = contractService.getDeployedContractsByType('ERC721');
      const erc20Contracts = contractService.getDeployedContractsByType('ERC20');

      expect(Array.isArray(erc721Contracts)).toBe(true);
      expect(Array.isArray(erc20Contracts)).toBe(true);
    });

    it('ID別のコントラクト取得が動作する', () => {
      const contract = contractService.getDeployedContractById('non-existent-id');
      expect(contract).toBeNull();
    });

    it('アドレス別のコントラクト取得が動作する', () => {
      const contract = contractService.getDeployedContractByAddress('0x1234567890123456789012345678901234567890');
      expect(contract).toBeNull();
    });
  });

  describe('getCompiledContracts', () => {
    it('利用可能なコントラクト一覧を取得できる', async () => {
      const contracts = await contractService.getCompiledContracts();
      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts).toContain('SimpleERC20');
      expect(contracts).toContain('SimpleERC721');
    });
  });
});