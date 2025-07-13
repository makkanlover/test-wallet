import { describe, it, expect } from 'vitest';
import contractReducer, {
  setContracts,
  addContract,
  updateContract,
  removeContract,
  setSelectedContract,
  setDeployLoading,
  setDeployError,
  setGasEstimate,
  clearDeployError,
  ContractState
} from '../../actions/slices/contractSlice';

describe('contractSlice', () => {
  const initialState: ContractState = {
    contracts: [],
    selectedContract: null,
    isDeployLoading: false,
    deployError: null,
    gasEstimate: null
  };

  const mockContract = {
    id: 'ERC20_TEST_1234567890',
    name: 'Test Token',
    symbol: 'TEST',
    contract_address: '0x1234567890123456789012345678901234567890',
    abi: [{ name: 'transfer', type: 'function' }],
    type: 'ERC20' as const,
    network: 'sepolia',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    deployedAt: '2024-01-01T00:00:00.000Z',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  };

  it('初期状態が正しい', () => {
    expect(contractReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('setContractsでコントラクトリストが設定される', () => {
    const contracts = [mockContract];
    const actual = contractReducer(initialState, setContracts(contracts));
    
    expect(actual.contracts).toEqual(contracts);
  });

  it('addContractで新しいコントラクトが追加される', () => {
    const actual = contractReducer(initialState, addContract(mockContract));
    
    expect(actual.contracts).toHaveLength(1);
    expect(actual.contracts[0]).toEqual(mockContract);
  });

  it('updateContractでコントラクト情報が更新される', () => {
    const stateWithContract = {
      ...initialState,
      contracts: [mockContract]
    };

    const updatedContract = {
      ...mockContract,
      name: 'Updated Token'
    };

    const actual = contractReducer(
      stateWithContract, 
      updateContract({ id: mockContract.id, updates: { name: 'Updated Token' } })
    );
    
    expect(actual.contracts[0].name).toBe('Updated Token');
    expect(actual.contracts[0].id).toBe(mockContract.id);
  });

  it('removeContractでコントラクトが削除される', () => {
    const stateWithContract = {
      ...initialState,
      contracts: [mockContract]
    };

    const actual = contractReducer(stateWithContract, removeContract(mockContract.id));
    
    expect(actual.contracts).toHaveLength(0);
  });

  it('setSelectedContractで選択中のコントラクトが設定される', () => {
    const actual = contractReducer(initialState, setSelectedContract(mockContract));
    
    expect(actual.selectedContract).toEqual(mockContract);
  });

  it('setDeployLoadingでデプロイローディング状態が設定される', () => {
    const actual = contractReducer(initialState, setDeployLoading(true));
    
    expect(actual.isDeployLoading).toBe(true);
  });

  it('setDeployErrorでデプロイエラーが設定される', () => {
    const error = 'デプロイに失敗しました';
    const actual = contractReducer(initialState, setDeployError(error));
    
    expect(actual.deployError).toBe(error);
  });

  it('clearDeployErrorでデプロイエラーがクリアされる', () => {
    const stateWithError = {
      ...initialState,
      deployError: 'エラーメッセージ'
    };

    const actual = contractReducer(stateWithError, clearDeployError());
    
    expect(actual.deployError).toBeNull();
  });

  it('setGasEstimateでガス見積もりが設定される', () => {
    const gasEstimate = {
      gasLimit: '2100000',
      gasPrice: '20.0',
      estimatedFee: '0.042'
    };

    const actual = contractReducer(initialState, setGasEstimate(gasEstimate));
    
    expect(actual.gasEstimate).toEqual(gasEstimate);
  });

  it('存在しないコントラクトのupdateContractは何も変更しない', () => {
    const actual = contractReducer(
      initialState, 
      updateContract({ id: 'NONEXISTENT_ID', updates: { name: 'Test' } })
    );
    
    expect(actual).toEqual(initialState);
  });

  it('存在しないコントラクトのremoveContractは何も変更しない', () => {
    const actual = contractReducer(initialState, removeContract('NONEXISTENT_ID'));
    
    expect(actual).toEqual(initialState);
  });
});