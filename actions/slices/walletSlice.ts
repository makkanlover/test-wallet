import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { connectLocalWallet, updateBalance, disconnectWallet } from '../thunks/walletThunks'

export interface Network {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  currency: string
}

export interface WalletState {
  address: string | null
  balance: string
  network: Network | null
  isConnected: boolean
  connectionType: 'local' | 'external' | null
  provider: any
  isLoading: boolean
  error: string | null
}

const getEnvVar = (key: string, defaultValue: string) => {
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
};

const networks: Record<string, Network> = {
  goerli: {
    id: 'goerli',
    name: 'Ethereum Goerli',
    rpcUrl: getEnvVar('VITE_ETHEREUM_RPC_URL', 'https://goerli.infura.io/v3/'),
    chainId: 5,
    currency: 'GoerliETH'
  },
  mumbai: {
    id: 'mumbai',
    name: 'Polygon Mumbai',
    rpcUrl: getEnvVar('VITE_POLYGON_RPC_URL', 'https://rpc-mumbai.maticvigil.com'),
    chainId: 80001,
    currency: 'MATIC'
  },
  'bsc-testnet': {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    rpcUrl: getEnvVar('VITE_BSC_RPC_URL', 'https://data-seed-prebsc-1-s1.binance.org:8545'),
    chainId: 97,
    currency: 'tBNB'
  }
}

const initialState: WalletState = {
  address: null,
  balance: '0',
  network: networks[getEnvVar('VITE_DEFAULT_NETWORK', 'goerli')],
  isConnected: false,
  connectionType: null,
  provider: null,
  isLoading: false,
  error: null,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload
    },
    setNetwork: (state, action: PayloadAction<string>) => {
      const network = networks[action.payload]
      if (network) {
        state.network = network
      }
    },
    setConnected: (state, action: PayloadAction<{ connected: boolean; type: 'local' | 'external' | null }>) => {
      state.isConnected = action.payload.connected
      state.connectionType = action.payload.type
    },
    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    reset: (state) => {
      state.address = null
      state.balance = '0'
      state.isConnected = false
      state.connectionType = null
      state.provider = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectLocalWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(connectLocalWallet.fulfilled, (state, action) => {
        state.isLoading = false
        state.address = action.payload.address
        state.provider = action.payload.provider
        state.isConnected = true
        state.connectionType = action.payload.connectionType
        state.error = null
      })
      .addCase(connectLocalWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateBalance.fulfilled, (state, action) => {
        state.balance = action.payload
      })
      .addCase(updateBalance.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null
        state.balance = '0'
        state.isConnected = false
        state.connectionType = null
        state.provider = null
        state.error = null
      })
  },
})

export const {
  setAddress,
  setBalance,
  setNetwork,
  setConnected,
  setProvider,
  setLoading,
  setError,
  reset,
} = walletSlice.actions

export default walletSlice.reducer