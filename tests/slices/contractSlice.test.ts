import { describe, it, expect, beforeEach } from 'vitest';
import contractReducer, {
  addContract,
  removeContract,
  setContracts,
  setDeployedContract,
  setLoading,
  setError,
  setGasEstimate,
} from '../../actions/slices/contractSlice';
import { ContractInfo } from '../../actions/slices/contractSlice';

describe('contractSlice', () => {
  const initialState = {
    contracts: [],
    isLoading: false,
    error: null,
    deployedContract: null,
    gasEstimate: null,
  };

  beforeEach(() => {
    // 各テストの前に状態をリセット
  });

  describe('初期状態', () => {
    it('正しい初期状態を持つ', () => {
      const actual = contractReducer(undefined, { type: 'unknown' });
      expect(actual).toEqual(initialState);
    });
  });

  describe('addContract', () => {
    it('ERC721コントラクトが正しく追加される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const actual = contractReducer(initialState, addContract(erc721Contract));

      expect(actual.contracts).toHaveLength(1);
      expect(actual.contracts[0]).toEqual(erc721Contract);
    });

    it('ERC20コントラクトが正しく追加される', () => {
      const erc20Contract: ContractInfo = {
        address: '0x9876543210987654321098765432109876543210',
        abi: [],
        network: 'sepolia',
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        decimals: 18,
        id: 'erc20-1',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const actual = contractReducer(initialState, addContract(erc20Contract));

      expect(actual.contracts).toHaveLength(1);
      expect(actual.contracts[0]).toEqual(erc20Contract);
    });

    it('複数のコントラクトが追加される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const erc20Contract: ContractInfo = {
        address: '0x9876543210987654321098765432109876543210',
        abi: [],
        network: 'sepolia',
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        decimals: 18,
        id: 'erc20-1',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      let state = contractReducer(initialState, addContract(erc721Contract));
      state = contractReducer(state, addContract(erc20Contract));

      expect(state.contracts).toHaveLength(2);
      expect(state.contracts[0]).toEqual(erc721Contract);
      expect(state.contracts[1]).toEqual(erc20Contract);
    });
  });

  describe('removeContract', () => {
    it('ERC721コントラクトが正しく削除される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const stateWithContract = contractReducer(initialState, addContract(erc721Contract));
      const actual = contractReducer(stateWithContract, removeContract('0x1234567890123456789012345678901234567890'));

      expect(actual.contracts).toHaveLength(0);
    });

    it('存在しないアドレスでの削除は何も変更しない', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const stateWithContract = contractReducer(initialState, addContract(erc721Contract));
      const actual = contractReducer(stateWithContract, removeContract('0x9999999999999999999999999999999999999999'));

      expect(actual.contracts).toHaveLength(1);
      expect(actual.contracts[0]).toEqual(erc721Contract);
    });

    it('複数のコントラクトから特定のものだけが削除される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const erc20Contract: ContractInfo = {
        address: '0x9876543210987654321098765432109876543210',
        abi: [],
        network: 'sepolia',
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        decimals: 18,
        id: 'erc20-1',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      let state = contractReducer(initialState, addContract(erc721Contract));
      state = contractReducer(state, addContract(erc20Contract));
      state = contractReducer(state, removeContract('0x1234567890123456789012345678901234567890'));

      expect(state.contracts).toHaveLength(1);
      expect(state.contracts[0]).toEqual(erc20Contract);
    });
  });

  describe('setContracts', () => {
    it('コントラクトリストが正しく設定される', () => {
      const contracts: ContractInfo[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          abi: [],
          network: 'sepolia',
          type: 'erc721',
          name: 'MyNFTCollection',
          symbol: 'MNC',
          id: 'erc721-1',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          deployedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          address: '0x9876543210987654321098765432109876543210',
          abi: [],
          network: 'sepolia',
          type: 'erc20',
          name: 'MyToken',
          symbol: 'MTK',
          decimals: 18,
          id: 'erc20-1',
          transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
          deployedAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      const actual = contractReducer(initialState, setContracts(contracts));

      expect(actual.contracts).toEqual(contracts);
    });

    it('空のリストで設定される', () => {
      const contracts: ContractInfo[] = [];
      const actual = contractReducer(initialState, setContracts(contracts));

      expect(actual.contracts).toEqual([]);
    });
  });

  describe('setDeployedContract', () => {
    it('デプロイされたコントラクトアドレスが設定される', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const actual = contractReducer(initialState, setDeployedContract(address));

      expect(actual.deployedContract).toBe(address);
    });

    it('nullで設定される', () => {
      const stateWithContract = contractReducer(initialState, setDeployedContract('0x1234567890123456789012345678901234567890'));
      const actual = contractReducer(stateWithContract, setDeployedContract(null));

      expect(actual.deployedContract).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('ローディング状態が正しく設定される', () => {
      const actual = contractReducer(initialState, setLoading(true));
      expect(actual.isLoading).toBe(true);
    });

    it('ローディング状態が正しく解除される', () => {
      const loadingState = contractReducer(initialState, setLoading(true));
      const actual = contractReducer(loadingState, setLoading(false));
      expect(actual.isLoading).toBe(false);
    });
  });

  describe('setGasEstimate', () => {
    it('ERC721のガス見積もりが正しく設定される', () => {
      const gasEstimate = {
        gasLimit: '500000',
        gasPrice: '20',
        estimatedFee: '0.01',
        actualGasPrice: '24.0',
        actualEstimatedFee: '0.012',
      };

      const actual = contractReducer(initialState, setGasEstimate(gasEstimate));

      expect(actual.gasEstimate).toEqual(gasEstimate);
    });

    it('ガス見積もりがnullで設定される', () => {
      const gasEstimate = {
        gasLimit: '500000',
        gasPrice: '20',
        estimatedFee: '0.01',
        actualGasPrice: '24.0',
        actualEstimatedFee: '0.012',
      };

      const stateWithGasEstimate = contractReducer(initialState, setGasEstimate(gasEstimate));
      const actual = contractReducer(stateWithGasEstimate, setGasEstimate(null));

      expect(actual.gasEstimate).toBeNull();
    });
  });

  describe('setError', () => {
    it('エラーが正しく設定される', () => {
      const error = 'ERC721 deployment failed';
      const actual = contractReducer(initialState, setError(error));

      expect(actual.error).toBe(error);
    });

    it('異なるエラーで上書きされる', () => {
      const firstError = 'ERC721 deployment failed';
      const secondError = 'Gas estimation failed';

      const stateWithFirstError = contractReducer(initialState, setError(firstError));
      const actual = contractReducer(stateWithFirstError, setError(secondError));

      expect(actual.error).toBe(secondError);
    });

    it('エラーがnullで設定される', () => {
      const error = 'ERC721 deployment failed';
      const stateWithError = contractReducer(initialState, setError(error));
      const actual = contractReducer(stateWithError, setError(null));

      expect(actual.error).toBeNull();
    });
  });

  describe('ERC721特有の機能', () => {
    it('ERC721コントラクトが正しく管理される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const actual = contractReducer(initialState, addContract(erc721Contract));

      expect(actual.contracts[0].type).toBe('erc721');
      expect(actual.contracts[0].name).toBe('MyNFTCollection');
      expect(actual.contracts[0].symbol).toBe('MNC');
    });

    it('ERC721とERC20コントラクトが混在しても正常に管理される', () => {
      const erc721Contract: ContractInfo = {
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        network: 'sepolia',
        type: 'erc721',
        name: 'MyNFTCollection',
        symbol: 'MNC',
        id: 'erc721-1',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      const erc20Contract: ContractInfo = {
        address: '0x9876543210987654321098765432109876543210',
        abi: [],
        network: 'sepolia',
        type: 'erc20',
        name: 'MyToken',
        symbol: 'MTK',
        decimals: 18,
        id: 'erc20-1',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        deployedAt: '2023-01-01T00:00:00.000Z',
      };

      let state = contractReducer(initialState, addContract(erc721Contract));
      state = contractReducer(state, addContract(erc20Contract));

      expect(state.contracts).toHaveLength(2);
      expect(state.contracts[0].type).toBe('erc721');
      expect(state.contracts[1].type).toBe('erc20');
      expect(state.contracts[1].decimals).toBe(18);
    });
  });
});