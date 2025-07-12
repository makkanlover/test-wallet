import { createAsyncThunk } from '@reduxjs/toolkit'
import { TransactionService } from '../services/transactionService'
import { TransactionHistory } from '../slices/transactionSlice'

export const sendNativeTransaction = createAsyncThunk(
  'transaction/sendNative',
  async ({ to, amount }: { to: string; amount: string }, { rejectWithValue }) => {
    try {
      const transactionService = TransactionService.getInstance()
      
      if (!transactionService.validateAddress(to)) {
        throw new Error('無効なアドレスです')
      }
      
      if (!transactionService.validateAmount(amount)) {
        throw new Error('無効な金額です')
      }

      const hash = await transactionService.sendNativeToken(to, amount)
      
      const transaction: TransactionHistory = {
        hash,
        from: '', // Will be filled by the component or service
        to,
        value: amount,
        type: 'native',
        status: 'pending',
        timestamp: Date.now()
      }
      
      return transaction
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'トランザクション送信に失敗しました')
    }
  }
)

export const sendERC20Transaction = createAsyncThunk(
  'transaction/sendERC20',
  async ({ 
    to, 
    amount, 
    contractAddress, 
    tokenSymbol, 
    decimals = 18 
  }: { 
    to: string
    amount: string
    contractAddress: string
    tokenSymbol: string
    decimals?: number
  }, { rejectWithValue }) => {
    try {
      const transactionService = TransactionService.getInstance()
      
      if (!transactionService.validateAddress(to)) {
        throw new Error('無効なアドレスです')
      }
      
      if (!transactionService.validateAddress(contractAddress)) {
        throw new Error('無効なコントラクトアドレスです')
      }
      
      if (!transactionService.validateAmount(amount)) {
        throw new Error('無効な金額です')
      }

      const hash = await transactionService.sendERC20Token(to, amount, contractAddress, decimals)
      
      const transaction: TransactionHistory = {
        hash,
        from: '', // Will be filled by the reducer
        to,
        value: amount,
        type: 'erc20',
        status: 'pending',
        timestamp: Date.now(),
        tokenSymbol
      }
      
      return transaction
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ERC20トークン送信に失敗しました')
    }
  }
)

export const mintNFTTransaction = createAsyncThunk(
  'transaction/mintNFT',
  async ({ 
    to, 
    tokenId, 
    contractAddress 
  }: { 
    to: string
    tokenId: string
    contractAddress: string
  }, { rejectWithValue }) => {
    try {
      const transactionService = TransactionService.getInstance()
      
      if (!transactionService.validateAddress(to)) {
        throw new Error('無効なアドレスです')
      }
      
      if (!transactionService.validateAddress(contractAddress)) {
        throw new Error('無効なコントラクトアドレスです')
      }

      const hash = await transactionService.mintNFT(to, tokenId, contractAddress)
      
      const transaction: TransactionHistory = {
        hash,
        from: '', // Will be filled by the reducer
        to,
        value: '1',
        type: 'nft',
        status: 'pending',
        timestamp: Date.now(),
        tokenId
      }
      
      return transaction
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'NFT発行に失敗しました')
    }
  }
)

export const estimateGas = createAsyncThunk(
  'transaction/estimateGas',
  async ({ 
    to, 
    amount, 
    type, 
    contractAddress, 
    decimals = 18 
  }: { 
    to: string
    amount: string
    type: 'native' | 'erc20'
    contractAddress?: string
    decimals?: number
  }, { rejectWithValue }) => {
    try {
      const transactionService = TransactionService.getInstance()
      
      if (type === 'native') {
        return await transactionService.estimateNativeGas(to, amount)
      } else if (type === 'erc20' && contractAddress) {
        return await transactionService.estimateERC20Gas(to, amount, contractAddress, decimals)
      } else {
        throw new Error('無効なトランザクションタイプです')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ガス見積もりに失敗しました')
    }
  }
)

export const getTokenInfo = createAsyncThunk(
  'transaction/getTokenInfo',
  async ({ contractAddress }: { contractAddress: string }, { rejectWithValue }) => {
    try {
      const transactionService = TransactionService.getInstance()
      
      if (!transactionService.validateAddress(contractAddress)) {
        throw new Error('無効なコントラクトアドレスです')
      }

      return await transactionService.getERC20TokenInfo(contractAddress)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'トークン情報取得に失敗しました')
    }
  }
)