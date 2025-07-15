import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ContractStorageService } from '../../actions/services/contractStorageService';

// テスト用のダミーcontracts.jsonファイルのパス
const TEST_CONTRACTS_FILE_PATH = path.join(process.cwd(), 'contracts.test.json');

describe('ContractStorageService - 起動時読み込み', () => {
  let contractStorageService: ContractStorageService;
  
  beforeEach(() => {
    // サービスインスタンスをリセット
    ContractStorageService.resetInstance();
    // テスト用のダミーデータを作成
    const testData = {
      contracts: [
        {
          id: 'ERC20_My Second Token_1752382464454',
          name: 'My Second Token',
          symbol: 'MST',
          contract_address: '0xaf0b1eA2be2183e633BfAD72F05A1E7e1e44a74f',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-13T04:54:24.454Z',
          transactionHash: '0x123...abc',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        },
        {
          id: 'ERC721_My NFT Collection_1752382564454',
          name: 'My NFT Collection',
          symbol: 'MNC',
          contract_address: '0xbf0b1eA2be2183e633BfAD72F05A1E7e1e44a74f',
          abi: [],
          type: 'ERC721' as const,
          deployedAt: '2025-07-13T04:55:24.454Z',
          transactionHash: '0x456...def',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    };
    
    // テスト用contracts.jsonファイルを作成
    fs.writeFileSync(TEST_CONTRACTS_FILE_PATH, JSON.stringify(testData, null, 2));
    
    // テスト用のファイルパスでContractStorageServiceを初期化
    contractStorageService = ContractStorageService.getInstance(TEST_CONTRACTS_FILE_PATH);
  });

  afterEach(() => {
    // テストファイルを削除
    if (fs.existsSync(TEST_CONTRACTS_FILE_PATH)) {
      fs.unlinkSync(TEST_CONTRACTS_FILE_PATH);
    }
  });

  describe('contracts.jsonからの読み込み', () => {
    it('既存のcontracts.jsonから全てのコントラクトを読み込める', () => {
      const contracts = contractStorageService.getAllContracts();
      
      expect(contracts).toHaveLength(2);
      expect(contracts[0].name).toBe('My Second Token');
      expect(contracts[0].symbol).toBe('MST');
      expect(contracts[0].type).toBe('ERC20');
      expect(contracts[1].name).toBe('My NFT Collection');
      expect(contracts[1].symbol).toBe('MNC');
      expect(contracts[1].type).toBe('ERC721');
    });

    it('ERC20コントラクトのみを取得できる', () => {
      const erc20Contracts = contractStorageService.getContractsByType('ERC20');
      
      expect(erc20Contracts).toHaveLength(1);
      expect(erc20Contracts[0].name).toBe('My Second Token');
      expect(erc20Contracts[0].symbol).toBe('MST');
      expect(erc20Contracts[0].type).toBe('ERC20');
    });

    it('ERC721コントラクトのみを取得できる', () => {
      const erc721Contracts = contractStorageService.getContractsByType('ERC721');
      
      expect(erc721Contracts).toHaveLength(1);
      expect(erc721Contracts[0].name).toBe('My NFT Collection');
      expect(erc721Contracts[0].symbol).toBe('MNC');
      expect(erc721Contracts[0].type).toBe('ERC721');
    });

    it('IDによるコントラクト取得ができる', () => {
      const contract = contractStorageService.getContractById('ERC20_My Second Token_1752382464454');
      
      expect(contract).not.toBeNull();
      expect(contract?.name).toBe('My Second Token');
      expect(contract?.symbol).toBe('MST');
      expect(contract?.type).toBe('ERC20');
    });

    it('アドレスによるコントラクト取得ができる', () => {
      const contract = contractStorageService.getContractByAddress('0xaf0b1eA2be2183e633BfAD72F05A1E7e1e44a74f');
      
      expect(contract).not.toBeNull();
      expect(contract?.name).toBe('My Second Token');
      expect(contract?.symbol).toBe('MST');
      expect(contract?.type).toBe('ERC20');
    });

    it('大文字小文字を区別しないアドレス検索ができる', () => {
      const contract = contractStorageService.getContractByAddress('0xAF0B1EA2BE2183E633BFAD72F05A1E7E1E44A74F');
      
      expect(contract).not.toBeNull();
      expect(contract?.name).toBe('My Second Token');
      expect(contract?.symbol).toBe('MST');
      expect(contract?.type).toBe('ERC20');
    });

    it('存在しないIDでnullが返される', () => {
      const contract = contractStorageService.getContractById('non-existent-id');
      
      expect(contract).toBeNull();
    });

    it('存在しないアドレスでnullが返される', () => {
      const contract = contractStorageService.getContractByAddress('0x1234567890123456789012345678901234567890');
      
      expect(contract).toBeNull();
    });
  });

  describe('空のcontracts.jsonのハンドリング', () => {
    beforeEach(() => {
      // 空のcontracts.jsonを作成
      fs.writeFileSync(TEST_CONTRACTS_FILE_PATH, JSON.stringify({ contracts: [] }, null, 2));
    });

    it('空のcontracts.jsonから空の配列が返される', () => {
      const contracts = contractStorageService.getAllContracts();
      
      expect(contracts).toHaveLength(0);
      expect(Array.isArray(contracts)).toBe(true);
    });

    it('空のcontracts.jsonからERC20コントラクトが0個取得される', () => {
      const erc20Contracts = contractStorageService.getContractsByType('ERC20');
      
      expect(erc20Contracts).toHaveLength(0);
      expect(Array.isArray(erc20Contracts)).toBe(true);
    });

    it('空のcontracts.jsonからERC721コントラクトが0個取得される', () => {
      const erc721Contracts = contractStorageService.getContractsByType('ERC721');
      
      expect(erc721Contracts).toHaveLength(0);
      expect(Array.isArray(erc721Contracts)).toBe(true);
    });
  });

  describe('contracts.jsonが存在しない場合のハンドリング', () => {
    beforeEach(() => {
      // contracts.jsonファイルを削除
      if (fs.existsSync(TEST_CONTRACTS_FILE_PATH)) {
        fs.unlinkSync(TEST_CONTRACTS_FILE_PATH);
      }
    });

    it('contracts.jsonが存在しない場合、空の配列が返される', () => {
      const contracts = contractStorageService.getAllContracts();
      
      expect(contracts).toHaveLength(0);
      expect(Array.isArray(contracts)).toBe(true);
    });

    it('contracts.jsonが存在しない場合、各タイプのコントラクトが0個取得される', () => {
      const erc20Contracts = contractStorageService.getContractsByType('ERC20');
      const erc721Contracts = contractStorageService.getContractsByType('ERC721');
      
      expect(erc20Contracts).toHaveLength(0);
      expect(erc721Contracts).toHaveLength(0);
    });

    it('contracts.jsonが存在しない場合、ID検索でnullが返される', () => {
      const contract = contractStorageService.getContractById('any-id');
      
      expect(contract).toBeNull();
    });

    it('contracts.jsonが存在しない場合、アドレス検索でnullが返される', () => {
      const contract = contractStorageService.getContractByAddress('0x1234567890123456789012345678901234567890');
      
      expect(contract).toBeNull();
    });
  });

  describe('不正なJSONファイルのハンドリング', () => {
    beforeEach(() => {
      // 不正なJSONファイルを作成
      fs.writeFileSync(TEST_CONTRACTS_FILE_PATH, 'invalid json content');
    });

    it('不正なJSONファイルから空の配列が返される', () => {
      const contracts = contractStorageService.getAllContracts();
      
      expect(contracts).toHaveLength(0);
      expect(Array.isArray(contracts)).toBe(true);
    });

    it('不正なJSONファイルから各タイプのコントラクトが0個取得される', () => {
      const erc20Contracts = contractStorageService.getContractsByType('ERC20');
      const erc721Contracts = contractStorageService.getContractsByType('ERC721');
      
      expect(erc20Contracts).toHaveLength(0);
      expect(erc721Contracts).toHaveLength(0);
    });

    it('不正なJSONファイルでID検索にnullが返される', () => {
      const contract = contractStorageService.getContractById('any-id');
      
      expect(contract).toBeNull();
    });

    it('不正なJSONファイルでアドレス検索にnullが返される', () => {
      const contract = contractStorageService.getContractByAddress('0x1234567890123456789012345678901234567890');
      
      expect(contract).toBeNull();
    });
  });

  describe('読み取り専用テスト', () => {
    it('複数回の読み込みで同じ結果が返される', () => {
      const contracts1 = contractStorageService.getAllContracts();
      const contracts2 = contractStorageService.getAllContracts();
      
      expect(contracts1).toEqual(contracts2);
      expect(contracts1).toHaveLength(2);
      expect(contracts2).toHaveLength(2);
    });

    it('契約データの一貫性が保たれる', () => {
      const allContracts = contractStorageService.getAllContracts();
      const erc20Contracts = contractStorageService.getContractsByType('ERC20');
      const erc721Contracts = contractStorageService.getContractsByType('ERC721');
      
      expect(allContracts).toHaveLength(2);
      expect(erc20Contracts).toHaveLength(1);
      expect(erc721Contracts).toHaveLength(1);
      
      // 全体のカウントが個別の合計と一致する
      expect(allContracts.length).toBe(erc20Contracts.length + erc721Contracts.length);
    });

    it('My Second Tokenコントラクトが正しく読み込まれる', () => {
      const mySecondToken = contractStorageService.getContractById('ERC20_My Second Token_1752382464454');
      
      expect(mySecondToken).not.toBeNull();
      expect(mySecondToken?.name).toBe('My Second Token');
      expect(mySecondToken?.symbol).toBe('MST');
      expect(mySecondToken?.type).toBe('ERC20');
      expect(mySecondToken?.contract_address).toBe('0xaf0b1eA2be2183e633BfAD72F05A1E7e1e44a74f');
      expect(mySecondToken?.network).toBe('sepolia');
      expect(mySecondToken?.owner).toBe('0x0eA1b1C4260DF8b76087011905955e869220e11D');
    });
  });
});