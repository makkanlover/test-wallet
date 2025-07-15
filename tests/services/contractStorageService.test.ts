import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ContractStorageService } from '../../actions/services/contractStorageService';

// テスト用のファイルパス
const TEST_CONTRACTS_FILE = path.join(process.cwd(), 'contracts.storage.test.json');

describe('ContractStorageService', () => {
  let service: ContractStorageService;

  beforeEach(() => {
    // テスト用のサービスインスタンスを作成
    ContractStorageService.resetInstance();
    service = ContractStorageService.getInstance(TEST_CONTRACTS_FILE);
  });

  afterEach(() => {
    // テストファイルをクリーンアップ
    if (fs.existsSync(TEST_CONTRACTS_FILE)) {
      fs.unlinkSync(TEST_CONTRACTS_FILE);
    }
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = ContractStorageService.getInstance(TEST_CONTRACTS_FILE);
      const instance2 = ContractStorageService.getInstance(TEST_CONTRACTS_FILE);
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveContract', () => {
    it('新しいコントラクトを保存する', () => {
      const contractData = {
        name: 'TestToken',
        symbol: 'TTK',
        contract_address: '0x1234567890123456789012345678901234567890',
        abi: [],
        type: 'ERC20' as const,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        network: 'sepolia',
        owner: '0x1234567890123456789012345678901234567890'
      };

      const result = service.saveContract(contractData);

      expect(result).toMatchObject({
        ...contractData,
        id: expect.any(String),
        deployedAt: expect.any(String)
      });

      // ファイルが作成されていることを確認
      expect(fs.existsSync(TEST_CONTRACTS_FILE)).toBe(true);
      
      // ファイルの内容を確認
      const fileContent = JSON.parse(fs.readFileSync(TEST_CONTRACTS_FILE, 'utf8'));
      expect(fileContent.contracts).toHaveLength(1);
      expect(fileContent.contracts[0]).toMatchObject(contractData);
    });

    it('既存のコントラクトリストに追加する', () => {
      const existingContract = {
        id: 'ERC20_TEST_1234567890',
        name: 'ExistingToken',
        symbol: 'ETK',
        contract_address: '0x1111111111111111111111111111111111111111',
        abi: [],
        type: 'ERC20' as const,
        deployedAt: '2023-01-01T00:00:00.000Z',
        transactionHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
        network: 'sepolia',
        owner: '0x1111111111111111111111111111111111111111'
      };

      const mockData = {
        contracts: [existingContract]
      };

      // 既存のファイルを作成
      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const newContractData = {
        name: 'NewToken',
        symbol: 'NTK',
        contract_address: '0x2222222222222222222222222222222222222222',
        abi: [],
        type: 'ERC20' as const,
        transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
        network: 'sepolia',
        owner: '0x2222222222222222222222222222222222222222'
      };

      const result = service.saveContract(newContractData);

      expect(result).toMatchObject({
        ...newContractData,
        id: expect.any(String),
        deployedAt: expect.any(String)
      });

      // ファイルに2つのコントラクトが保存されていることを確認
      const fileContent = JSON.parse(fs.readFileSync(TEST_CONTRACTS_FILE, 'utf8'));
      expect(fileContent.contracts).toHaveLength(2);
    });
  });

  describe('getAllContracts', () => {
    it('保存されたコントラクトリストを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getAllContracts();

      expect(result).toEqual(mockData.contracts);
    });

    it('データがない場合は空配列を返す', () => {
      const result = service.getAllContracts();

      expect(result).toEqual([]);
    });

    it('無効なJSONの場合は空配列を返す', () => {
      // 無効なJSONファイルを作成
      fs.writeFileSync(TEST_CONTRACTS_FILE, 'invalid json');

      const result = service.getAllContracts();

      expect(result).toEqual([]);
    });
  });

  describe('getContractsByType', () => {
    it('指定したタイプのコントラクトのみを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          },
          {
            id: 'ERC721_TEST_1234567890',
            name: 'TestNFT',
            symbol: 'TNF',
            contract_address: '0x2222222222222222222222222222222222222222',
            abi: [],
            type: 'ERC721' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
            network: 'sepolia',
            owner: '0x2222222222222222222222222222222222222222'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractsByType('ERC20');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ERC20');
    });
  });

  describe('getContractById', () => {
    it('IDで指定したコントラクトを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractById('ERC20_TEST_1234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });

    it('存在しないIDの場合はnullを返す', () => {
      const mockData = {
        contracts: []
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getContractByAddress', () => {
    it('アドレスで指定したコントラクトを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractByAddress('0x1234567890123456789012345678901234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });

    it('存在しないアドレスの場合はnullを返す', () => {
      const mockData = {
        contracts: []
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractByAddress('0x0000000000000000000000000000000000000000');

      expect(result).toBeNull();
    });

    it('大文字小文字を区別しないアドレス検索ができる', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.getContractByAddress('0X1234567890123456789012345678901234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });
  });

  describe('deleteContract', () => {
    it('指定したIDのコントラクトを削除する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.deleteContract('ERC20_TEST_1234567890');

      expect(result).toBe(true);
      
      // ファイルが空になっていることを確認
      const fileContent = JSON.parse(fs.readFileSync(TEST_CONTRACTS_FILE, 'utf8'));
      expect(fileContent.contracts).toHaveLength(0);
    });

    it('存在しないIDの場合はfalseを返す', () => {
      const mockData = {
        contracts: []
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      const result = service.deleteContract('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clearAllContracts', () => {
    it('すべてのコントラクトを削除する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'TestToken',
            symbol: 'TTK',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20' as const,
            deployedAt: '2023-01-01T00:00:00.000Z',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            network: 'sepolia',
            owner: '0x1234567890123456789012345678901234567890'
          }
        ]
      };

      fs.writeFileSync(TEST_CONTRACTS_FILE, JSON.stringify(mockData, null, 2));

      service.clearAllContracts();

      // ファイルが空になっていることを確認
      const fileContent = JSON.parse(fs.readFileSync(TEST_CONTRACTS_FILE, 'utf8'));
      expect(fileContent.contracts).toHaveLength(0);
    });
  });

  describe('ファイルシステム特有の動作', () => {
    it('ファイルが存在しない場合に空配列を返す', () => {
      const result = service.getAllContracts();
      expect(result).toEqual([]);
    });

    it('ファイルが存在しない場合でも保存が可能', () => {
      const contractData = {
        name: 'TestToken',
        symbol: 'TTK',
        contract_address: '0x1234567890123456789012345678901234567890',
        abi: [],
        type: 'ERC20' as const,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        network: 'sepolia',
        owner: '0x1234567890123456789012345678901234567890'
      };

      expect(fs.existsSync(TEST_CONTRACTS_FILE)).toBe(false);

      const result = service.saveContract(contractData);

      expect(result).toMatchObject(contractData);
      expect(fs.existsSync(TEST_CONTRACTS_FILE)).toBe(true);
    });

    it('空のファイルでも正常に動作する', () => {
      fs.writeFileSync(TEST_CONTRACTS_FILE, '');

      const result = service.getAllContracts();
      expect(result).toEqual([]);
    });
  });
});