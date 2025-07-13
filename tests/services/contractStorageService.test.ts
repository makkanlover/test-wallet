import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  saveContract, 
  getContracts, 
  getContractById, 
  removeContract 
} from '../../actions/services/contractStorageService';

// localStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('contractStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveContract', () => {
    it('新しいコントラクトを保存する', () => {
      // 既存データなし
      mockLocalStorage.getItem.mockReturnValue(null);

      const contractData = {
        id: 'ERC20_TEST_1234567890',
        name: 'Test Token',
        symbol: 'TEST',
        contract_address: '0x1234567890123456789012345678901234567890',
        abi: [{ name: 'transfer', type: 'function' }],
        type: 'ERC20',
        network: 'sepolia',
        owner: '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      saveContract(contractData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contracts',
        JSON.stringify({ contracts: [contractData] })
      );
    });

    it('既存のコントラクトリストに追加する', () => {
      const existingData = {
        contracts: [{
          id: 'ERC20_OLD_1234567890',
          name: 'Old Token',
          symbol: 'OLD',
          contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          abi: [],
          type: 'ERC20',
          network: 'sepolia',
          owner: '0x1234567890123456789012345678901234567890'
        }]
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      const newContractData = {
        id: 'ERC20_NEW_1234567890',
        name: 'New Token',
        symbol: 'NEW',
        contract_address: '0x9876543210987654321098765432109876543210',
        abi: [],
        type: 'ERC20',
        network: 'sepolia',
        owner: '0x1234567890123456789012345678901234567890'
      };

      saveContract(newContractData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contracts',
        JSON.stringify({ 
          contracts: [existingData.contracts[0], newContractData] 
        })
      );
    });
  });

  describe('getContracts', () => {
    it('保存されたコントラクトリストを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'Test Token',
            symbol: 'TEST',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          }
        ]
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getContracts();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('contracts');
      expect(result).toEqual(mockData.contracts);
    });

    it('データがない場合は空配列を返す', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getContracts();

      expect(result).toEqual([]);
    });

    it('無効なJSONの場合は空配列を返す', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = getContracts();

      expect(result).toEqual([]);
    });
  });

  describe('getContractById', () => {
    it('IDで指定したコントラクトを取得する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'Test Token',
            symbol: 'TEST',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          },
          {
            id: 'ERC20_OTHER_1234567890',
            name: 'Other Token',
            symbol: 'OTHER',
            contract_address: '0x9876543210987654321098765432109876543210',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          }
        ]
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getContractById('ERC20_TEST_1234567890');

      expect(result).toEqual(mockData.contracts[0]);
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const mockData = { contracts: [] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      const result = getContractById('NONEXISTENT_ID');

      expect(result).toBeUndefined();
    });
  });

  describe('removeContract', () => {
    it('指定したIDのコントラクトを削除する', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'Test Token',
            symbol: 'TEST',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          },
          {
            id: 'ERC20_OTHER_1234567890',
            name: 'Other Token',
            symbol: 'OTHER',
            contract_address: '0x9876543210987654321098765432109876543210',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          }
        ]
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      removeContract('ERC20_TEST_1234567890');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contracts',
        JSON.stringify({ 
          contracts: [mockData.contracts[1]] // 1つ目が削除されている
        })
      );
    });

    it('存在しないIDの場合は何も変更しない', () => {
      const mockData = {
        contracts: [
          {
            id: 'ERC20_TEST_1234567890',
            name: 'Test Token',
            symbol: 'TEST',
            contract_address: '0x1234567890123456789012345678901234567890',
            abi: [],
            type: 'ERC20',
            network: 'sepolia',
            owner: '0xabcdef1234567890abcdef1234567890abcdef12'
          }
        ]
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));

      removeContract('NONEXISTENT_ID');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contracts',
        JSON.stringify(mockData) // 変更されていない
      );
    });
  });
});