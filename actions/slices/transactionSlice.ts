import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sendNativeTransaction, sendERC20Transaction, mintNFTTransaction, estimateGas, getTokenInfo } from '../thunks/transactionThunks'

export interface TransactionHistory {
  hash: string
  from: string
  to: string
  value: string
  type: 'native' | 'erc20' | 'nft'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  gasUsed?: string
  gasPrice?: string
  tokenSymbol?: string
  tokenId?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  estimatedFee: string
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  balance: string
}

export interface TransactionState {
  history: TransactionHistory[]
  isLoading: boolean
  error: string | null
  pendingTx: string | null
  gasEstimate: GasEstimate | null
  tokenInfo: TokenInfo | null
}

const initialState: TransactionState = {
  history: [],
  isLoading: false,
  error: null,
  pendingTx: null,
  gasEstimate: null,
  tokenInfo: null,
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<TransactionHistory>) => {
      state.history.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<{ hash: string; updates: Partial<TransactionHistory> }>) => {
      const index = state.history.findIndex(tx => tx.hash === action.payload.hash)
      if (index !== -1) {
        state.history[index] = { ...state.history[index], ...action.payload.updates }
      }
    },
    setPendingTx: (state, action: PayloadAction<string | null>) => {
      state.pendingTx = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearHistory: (state) => {
      state.history = []
    },
    setGasEstimate: (state, action: PayloadAction<GasEstimate | null>) => {
      state.gasEstimate = action.payload
    },
    setTokenInfo: (state, action: PayloadAction<TokenInfo | null>) => {
      state.tokenInfo = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Native transaction
      .addCase(sendNativeTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendNativeTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.history.unshift(action.payload)
        state.pendingTx = action.payload.hash
      })
      .addCase(sendNativeTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // ERC20 transaction
      .addCase(sendERC20Transaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendERC20Transaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.history.unshift(action.payload)
        state.pendingTx = action.payload.hash
      })
      .addCase(sendERC20Transaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // NFT transaction
      .addCase(mintNFTTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(mintNFTTransaction.fulfilled, (state, action) => {
        state.isLoading = false
        state.history.unshift(action.payload)
        state.pendingTx = action.payload.hash
      })
      .addCase(mintNFTTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Gas estimation
      .addCase(estimateGas.fulfilled, (state, action) => {
        state.gasEstimate = action.payload
      })
      .addCase(estimateGas.rejected, (state, action) => {
        state.error = action.payload as string
        state.gasEstimate = null
      })
      // Token info
      .addCase(getTokenInfo.fulfilled, (state, action) => {
        state.tokenInfo = action.payload
      })
      .addCase(getTokenInfo.rejected, (state, action) => {
        state.error = action.payload as string
        state.tokenInfo = null
      })
  },
})

export const {
  addTransaction,
  updateTransaction,
  setPendingTx,
  setLoading,
  setError,
  clearHistory,
  setGasEstimate,
  setTokenInfo,
} = transactionSlice.actions

export default transactionSlice.reducer