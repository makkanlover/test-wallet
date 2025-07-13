import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { deployContract, estimateDeployGas, loadStoredContracts } from '../thunks/contractThunks'
import { StoredContract } from '../services/contractStorageService'

export interface ContractInfo {
  address: string
  abi: any[]
  network: string
  type: 'erc20' | 'erc721'
  name: string
  symbol?: string
  decimals?: number
  id?: string
  deployedAt?: string
  transactionHash?: string
  owner?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  estimatedFee: string
}

export interface ContractState {
  contracts: ContractInfo[]
  isLoading: boolean
  error: string | null
  deployedContract: string | null
  gasEstimate: GasEstimate | null
}

const initialState: ContractState = {
  contracts: [],
  isLoading: false,
  error: null,
  deployedContract: null,
  gasEstimate: null,
}

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    addContract: (state, action: PayloadAction<ContractInfo>) => {
      state.contracts.push(action.payload)
    },
    removeContract: (state, action: PayloadAction<string>) => {
      state.contracts = state.contracts.filter(contract => contract.address !== action.payload)
    },
    setContracts: (state, action: PayloadAction<ContractInfo[]>) => {
      state.contracts = action.payload
    },
    setDeployedContract: (state, action: PayloadAction<string | null>) => {
      state.deployedContract = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setGasEstimate: (state, action: PayloadAction<GasEstimate | null>) => {
      state.gasEstimate = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deployContract.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deployContract.fulfilled, (state, action) => {
        state.isLoading = false
        state.deployedContract = action.payload.address
        // 新しいコントラクトを追加
        const newContract: ContractInfo = {
          address: action.payload.address,
          abi: [], // 実際の実装ではartifactsから取得
          network: 'testnet', // 現在のネットワークから取得
          type: action.payload.type,
          name: action.payload.name,
          symbol: action.payload.symbol
        }
        state.contracts.push(newContract)
      })
      .addCase(deployContract.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(estimateDeployGas.fulfilled, (state, action) => {
        state.gasEstimate = action.payload
      })
      .addCase(estimateDeployGas.rejected, (state, action) => {
        state.error = action.payload as string
        state.gasEstimate = null
      })
      .addCase(loadStoredContracts.fulfilled, (state, action) => {
        const storedContracts = action.payload as StoredContract[]
        state.contracts = storedContracts.map(contract => ({
          address: contract.contract_address,
          abi: contract.abi,
          network: contract.network,
          type: contract.type.toLowerCase() as 'erc20' | 'erc721',
          name: contract.name,
          symbol: contract.symbol,
          id: contract.id,
          deployedAt: contract.deployedAt,
          transactionHash: contract.transactionHash,
          owner: contract.owner
        }))
      })
  },
})

export const {
  addContract,
  removeContract,
  setContracts,
  setDeployedContract,
  setLoading,
  setError,
  setGasEstimate,
} = contractSlice.actions

export default contractSlice.reducer