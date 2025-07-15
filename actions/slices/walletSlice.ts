import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { connectLocalWallet, connectExternalWallet, connectWalletConnect, updateBalance, disconnectWallet } from '../thunks/walletThunks'
import { getEnvVar } from '../utils/env'

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
  connectionType: 'local' | 'external' | 'walletconnect' | null
  walletName: string | null
  provider: any
  isLoading: boolean
  error: string | null
}

const networks: Record<string, Network> = {
  sepolia: {
    id: 'sepolia',
    name: 'Ethereum Sepolia',
    rpcUrl: getEnvVar('ETHEREUM_RPC_URL', 'https://sepolia.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'),
    chainId: 11155111,
    currency: 'SepoliaETH'
  },
  amoy: {
    id: 'amoy',
    name: 'Polygon Amoy',
    rpcUrl: getEnvVar('POLYGON_RPC_URL', 'https://amoy.infura.io/v3/ef0ca7db451949e8bd42c77df3160530'),
    chainId: 80002,
    currency: 'MATIC'
  }
}

const initialState: WalletState = {
  address: null,
  balance: '0',
  network: networks[getEnvVar('DEFAULT_NETWORK', 'sepolia')],
  isConnected: false,
  connectionType: null,
  walletName: null,
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
    setConnected: (state, action: PayloadAction<{ connected: boolean; type: 'local' | 'external' | 'walletconnect' | null; walletName?: string }>) => {
      state.isConnected = action.payload.connected
      state.connectionType = action.payload.type
      state.walletName = action.payload.walletName || null
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
      state.walletName = null
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
        state.walletName = action.payload.walletName || null
        state.error = null
      })
      .addCase(connectLocalWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(connectExternalWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(connectExternalWallet.fulfilled, (state, action) => {
        state.isLoading = false
        state.address = action.payload.address
        state.provider = action.payload.provider
        state.isConnected = true
        state.connectionType = action.payload.connectionType
        state.walletName = action.payload.walletName || null
        state.error = null
      })
      .addCase(connectExternalWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateBalance.fulfilled, (state, action) => {
        state.balance = action.payload
      })
      .addCase(updateBalance.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(connectWalletConnect.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(connectWalletConnect.fulfilled, (state, action) => {
        state.isLoading = false
        state.address = action.payload.address
        state.provider = action.payload.provider
        state.isConnected = true
        state.connectionType = action.payload.connectionType
        state.walletName = action.payload.walletName || null
        state.error = null
      })
      .addCase(connectWalletConnect.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null
        state.balance = '0'
        state.isConnected = false
        state.connectionType = null
        state.walletName = null
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