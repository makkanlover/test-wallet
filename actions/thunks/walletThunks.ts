import { createAsyncThunk } from '@reduxjs/toolkit'
import { WalletService } from '../services/walletService'
import { Network } from '../slices/walletSlice'

export const connectLocalWallet = createAsyncThunk(
  'wallet/connectLocal',
  async ({ network, privateKey }: { network: Network; privateKey?: string }, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      const result = privateKey 
        ? await walletService.connectWithPrivateKey(privateKey, network)
        : await walletService.connectLocalWallet(network)
      
      return {
        address: result.address,
        provider: result.provider,
        wallet: result.wallet,
        connectionType: 'local' as const,
        walletName: result.walletName
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ウォレット接続に失敗しました')
    }
  }
)

export const updateBalance = createAsyncThunk(
  'wallet/updateBalance',
  async ({ address }: { address: string }, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      const balance = await walletService.getBalance(address)
      return balance
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '残高更新に失敗しました')
    }
  }
)

export const connectExternalWallet = createAsyncThunk(
  'wallet/connectExternal',
  async ({ network }: { network: Network }, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      const result = await walletService.connectExternalWallet(network)
      
      return {
        address: result.address,
        provider: result.provider,
        connectionType: 'external' as const,
        walletName: result.walletName
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '外部ウォレット接続に失敗しました')
    }
  }
)

export const connectWalletConnect = createAsyncThunk(
  'wallet/connectWalletConnect',
  async ({ network }: { network: Network }, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      const result = await walletService.connectWalletConnect(network)
      
      return {
        address: result.address,
        provider: result.provider,
        connectionType: 'walletconnect' as const,
        walletName: result.walletName
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'WalletConnect接続に失敗しました')
    }
  }
)

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      await walletService.disconnect()
      return true
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ウォレット切断に失敗しました')
    }
  }
)