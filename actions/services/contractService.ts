import { ethers } from 'ethers'
import { WalletService } from './walletService'

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

  constructor() {
    this.walletService = WalletService.getInstance()
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  async deployERC20Contract(params: ContractDeployParams): Promise<DeployedContract> {
    const wallet = this.walletService.getWallet()
    if (!wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    // SimpleERC20コントラクトのABI（コンパイル後に自動生成されるものの簡略版）
    const contractABI = [
      "constructor(string memory name, string memory symbol, uint8 decimals_, uint256 totalSupply, address owner)"
    ]

    // バイトコード（実際の環境では artifacts から読み込む）
    const contractBytecode = "0x608060405234801561001057600080fd5b5..." // 実際のバイトコードはartifactsから取得

    try {
      const decimals = params.decimals || 18
      const totalSupply = params.totalSupply || "1000000"
      const owner = await wallet.getAddress()

      // シンプルなERC20コントラクトの作成（実際の実装では artifacts を使用）
      const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet)
      
      // テスト用の簡易デプロイ（実際の実装ではartifactsのバイトコードを使用）
      throw new Error("コントラクトデプロイは開発中です。Hardhatでのコンパイルとartifacts生成が必要です。")

    } catch (error) {
      throw new Error(`ERC20コントラクトデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deployERC721Contract(params: ContractDeployParams): Promise<DeployedContract> {
    const wallet = this.walletService.getWallet()
    if (!wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      // 実際の実装では artifacts から読み込む
      throw new Error("コントラクトデプロイは開発中です。Hardhatでのコンパイルとartifacts生成が必要です。")

    } catch (error) {
      throw new Error(`ERC721コントラクトデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateDeployGas(params: ContractDeployParams): Promise<{
    gasLimit: string
    gasPrice: string
    estimatedFee: string
  }> {
    const provider = this.walletService.getProvider()
    
    if (!provider) {
      throw new Error('プロバイダーが初期化されていません')
    }

    try {
      // ガス見積もりの仮実装
      const gasLimit = ethers.getBigInt("500000") // デプロイには通常多くのガスが必要
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
      
      const estimatedFee = ethers.formatEther(gasLimit * gasPrice)

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedFee
      }
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

  private isValidURL(string: string): boolean {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }
}