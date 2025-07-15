import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContractStorageService } from '../../actions/services/contractStorageService';

describe('ContractStorageService', () => {
  let service: ContractStorageService;
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    service = ContractStorageService.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンインスタンスを返す', () => {
      const instance1 = ContractStorageService.getInstance();
      const instance2 = ContractStorageService.getInstance();
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

      mockLocalStorage.getItem.mockReturnValue(null);

      const result = service.saveContract(contractData);

      expect(result).toMatchObject({
        ...contractData,
        id: expect.any(String),
        deployedAt: expect.any(String)
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'web3-wallet-contracts',
        expect.stringContaining(contractData.contract_address)
      );
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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

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

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'web3-wallet-contracts',
        expect.stringContaining(newContractData.contract_address)
      );
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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.getAllContracts();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('web3-wallet-contracts');
      expect(result).toEqual(mockData.contracts);
    });

    it('データがない場合は空配列を返す', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = service.getAllContracts();

      expect(result).toEqual([]);
    });

    it('無効なJSONの場合は空配列を返す', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = service.getAllContracts();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.getContractById('ERC20_TEST_1234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });

    it('存在しないIDの場合はnullを返す', () => {
      const mockData = {
        contracts: []
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.getContractByAddress('0x1234567890123456789012345678901234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });

    it('存在しないアドレスの場合はnullを返す', () => {
      const mockData = {
        contracts: []
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.getContractByAddress('0x0000000000000000000000000000000000000000');

      expect(result).toBeNull();
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

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.deleteContract('ERC20_TEST_1234567890');

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'web3-wallet-contracts',
        JSON.stringify({ contracts: [] })
      );
    });

    it('存在しないIDの場合はfalseを返す', () => {
      const mockData = {
        contracts: []
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = service.deleteContract('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clearAllContracts', () => {
    it('すべてのコントラクトを削除する', () => {
      service.clearAllContracts();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'web3-wallet-contracts',
        JSON.stringify({ contracts: [] })
      );
    });
  });
});