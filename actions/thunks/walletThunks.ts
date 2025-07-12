import { createAsyncThunk } from '@reduxjs/toolkit'
import { WalletService } from '../services/walletService'
import { Network } from '../slices/walletSlice'

export const connectLocalWallet = createAsyncThunk(
  'wallet/connectLocal',
  async ({ privateKey, network }: { privateKey: string; network: Network }, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      
      if (!walletService.validatePrivateKey(privateKey)) {
        throw new Error('無効な秘密鍵です')
      }

      const result = await walletService.connectWithPrivateKey(privateKey, network)
      
      return {
        address: result.address,
        provider: result.provider,
        wallet: result.wallet,
        connectionType: 'local' as const
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

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async (_, { rejectWithValue }) => {
    try {
      const walletService = WalletService.getInstance()
      walletService.disconnect()
      return true
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ウォレット切断に失敗しました')
    }
  }
)