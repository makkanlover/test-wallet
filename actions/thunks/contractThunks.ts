import { createAsyncThunk } from '@reduxjs/toolkit'
import { ContractService, ContractDeployParams } from '../services/contractService'
import { ContractStorageService } from '../services/contractStorageService'

export const deployContract = createAsyncThunk(
  'contract/deploy',
  async (params: ContractDeployParams, { rejectWithValue }) => {
    try {
      const contractService = ContractService.getInstance()
      
      const validation = contractService.validateContractParams(params)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      if (params.type === 'erc20') {
        return await contractService.deployERC20Contract(params)
      } else if (params.type === 'erc721') {
        return await contractService.deployERC721Contract(params)
      } else {
        throw new Error('サポートされていないコントラクトタイプです')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'コントラクトデプロイに失敗しました')
    }
  }
)

export const estimateDeployGas = createAsyncThunk(
  'contract/estimateGas',
  async (params: ContractDeployParams, { rejectWithValue }) => {
    try {
      const contractService = ContractService.getInstance()
      return await contractService.estimateDeployGas(params)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'ガス見積もりに失敗しました')
    }
  }
)

export const loadStoredContracts = createAsyncThunk(
  'contract/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const storageService = ContractStorageService.getInstance()
      return storageService.getAllContracts()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'コントラクト読み込みに失敗しました')
    }
  }
)