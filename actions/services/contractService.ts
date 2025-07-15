import { ethers } from 'ethers'
import { WalletService } from './walletService'
import { getContractArtifact } from '../contracts/contractArtifacts'
import { ContractStorageService } from './contractStorageService'
import { DeployApiService, DeployApiParams } from './deployApiService'

export interface ContractDeployParams {
  type: 'erc20' | 'erc721'
  name: string
  symbol: string
  decimals?: number
  totalSupply?: string
  baseURI?: string
}

export interface DeployedContract {
  address: string
  transactionHash: string
  type: 'erc20' | 'erc721'
  name: string
  symbol: string
  owner: string
}

export class ContractService {
  private static instance: ContractService
  private walletService: WalletService
  private storageService: ContractStorageService
  private deployApiService: DeployApiService

  constructor() {
    this.walletService = WalletService.getInstance()
    this.storageService = ContractStorageService.getInstance()
    this.deployApiService = DeployApiService.getInstance()
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  async deployERC20Contract(params: ContractDeployParams, gasBufferMultiplier: number = 1.0): Promise<DeployedContract> {
    try {
      // API経由でデプロイ
      const deployParams: DeployApiParams = {
        type: 'erc20',
        name: params.name,
        symbol: params.symbol,
        decimals: params.decimals || 18,
        totalSupply: params.totalSupply || '1000000',
        network: 'sepolia', // TODO: 動的に取得
        verify: true, // verifyを有効にする
        gasBufferMultiplier
      }

      const deployResult = await this.deployApiService.deployContract(deployParams)
      
      if (!deployResult.success) {
        throw new Error(deployResult.error || 'デプロイに失敗しました')
      }

      const deployedContract: DeployedContract = {
        address: deployResult.contractAddress,
        transactionHash: deployResult.transactionHash,
        type: 'erc20' as const,
        name: params.name,
        symbol: params.symbol,
        owner: '' // デプロイAPIから取得する必要がある
      }

      return deployedContract
    } catch (error) {
      throw new Error(`ERC20コントラクトデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deployERC721Contract(params: ContractDeployParams, gasBufferMultiplier: number = 1.0): Promise<DeployedContract> {
    try {
      // API経由でデプロイ
      const deployParams: DeployApiParams = {
        type: 'erc721',
        name: params.name,
        symbol: params.symbol,
        baseURI: params.baseURI || 'https://example.com/metadata/',
        network: 'sepolia', // TODO: 動的に取得
        verify: true, // verifyを有効にする
        gasBufferMultiplier
      }

      const deployResult = await this.deployApiService.deployContract(deployParams)
      
      if (!deployResult.success) {
        throw new Error(deployResult.error || 'デプロイに失敗しました')
      }

      const deployedContract: DeployedContract = {
        address: deployResult.contractAddress,
        transactionHash: deployResult.transactionHash,
        type: 'erc721' as const,
        name: params.name,
        symbol: params.symbol,
        owner: '' // デプロイAPIから取得する必要がある
      }

      return deployedContract
    } catch (error) {
      throw new Error(`ERC721コントラクトデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateDeployGas(params: ContractDeployParams, gasBufferMultiplier: number = 1.0): Promise<{
    gasLimit: string
    gasPrice: string
    estimatedFee: string
    actualGasPrice?: string
    actualEstimatedFee?: string
  }> {
    // Hardhat Ignitionを使用する場合、ガス見積もりはHardhat側で行われる
    // ここでは概算値を返すか、実際にdry-runを実行してガス見積もりを取得する
    
    try {
      // API経由でガス見積もりを取得
      const response = await fetch('http://localhost:3000/api/estimate-gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: params.type,
          name: params.name,
          symbol: params.symbol,
          decimals: params.decimals || 18,
          totalSupply: params.totalSupply || '1000000',
          baseURI: params.baseURI,
          network: 'sepolia'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'ガス見積もりに失敗しました');
      }

      // バッファ適用後の実際の値を計算
      const baseGasPrice = parseFloat(result.gasPrice)
      const baseGasLimit = parseFloat(result.gasLimit)
      const actualGasPrice = baseGasPrice * gasBufferMultiplier
      const actualGasLimit = baseGasLimit * 1.1 // 10%のバッファ
      const actualEstimatedFee = (actualGasPrice * actualGasLimit / 1e9).toFixed(6) // Gweiからetherに変換

      return {
        gasLimit: result.gasLimit,
        gasPrice: result.gasPrice,
        estimatedFee: result.estimatedFee,
        actualGasPrice: actualGasPrice.toFixed(2),
        actualEstimatedFee
      };
      
    } catch (error) {
      throw new Error(`ガス見積もりに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  validateContractParams(params: ContractDeployParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!params.name || params.name.trim().length === 0) {
      errors.push('コントラクト名は必須です')
    }

    if (!params.symbol || params.symbol.trim().length === 0) {
      errors.push('シンボルは必須です')
    }

    if (params.type === 'erc20') {
      if (params.decimals !== undefined && (params.decimals < 0 || params.decimals > 18)) {
        errors.push('小数点桁数は0-18の範囲で設定してください')
      }

      if (params.totalSupply) {
        const supply = parseFloat(params.totalSupply)
        if (isNaN(supply) || supply <= 0) {
          errors.push('総供給量は正の数値である必要があります')
        }
      }
    }

    if (params.type === 'erc721') {
      if (params.baseURI && !this.isValidURL(params.baseURI)) {
        errors.push('ベースURIは有効なURLである必要があります')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async getCompiledContracts(): Promise<string[]> {
    // 利用可能なコントラクト一覧を返す
    return ['SimpleERC20', 'SimpleERC721']
  }

  getDeployedContracts() {
    return this.storageService.getAllContracts()
  }

  getDeployedContractsByType(type: 'ERC20' | 'ERC721') {
    return this.storageService.getContractsByType(type)
  }

  getDeployedContractById(id: string) {
    return this.storageService.getContractById(id)
  }

  getDeployedContractByAddress(address: string) {
    return this.storageService.getContractByAddress(address)
  }

  private isValidURL(string: string): boolean {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }
}