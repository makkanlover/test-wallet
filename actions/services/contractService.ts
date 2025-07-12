import { ethers } from 'ethers'
import { WalletService } from './walletService'
import { HardhatService } from './hardhatService'

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
  private hardhatService: HardhatService

  constructor() {
    this.walletService = WalletService.getInstance()
    this.hardhatService = HardhatService.getInstance()
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  async deployERC20Contract(params: ContractDeployParams): Promise<DeployedContract> {
    const signer = this.walletService.getSigner()
    if (!signer) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      // コントラクトがコンパイルされているか確認
      const isCompiled = await this.hardhatService.isContractCompiled('SimpleERC20')
      if (!isCompiled) {
        throw new Error('SimpleERC20コントラクトがコンパイルされていません。npx hardhat compile を実行してください。')
      }

      // artifactsからコントラクト情報を読み込み
      const artifact = await this.hardhatService.loadContractArtifact('SimpleERC20')
      
      const decimals = params.decimals || 18
      const totalSupply = ethers.parseUnits(params.totalSupply || "1000000", decimals)
      const owner = await signer.getAddress()

      // コントラクトファクトリを作成
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer)
      
      // コントラクトをデプロイ
      const contract = await factory.deploy(
        params.name,
        params.symbol,
        decimals,
        totalSupply,
        owner
      )

      // デプロイを待機
      await contract.waitForDeployment()
      const address = await contract.getAddress()
      const deployTransaction = contract.deploymentTransaction()
      
      if (!deployTransaction) {
        throw new Error('デプロイトランザクションが見つかりません')
      }

      return {
        address,
        transactionHash: deployTransaction.hash,
        type: 'erc20',
        name: params.name,
        symbol: params.symbol,
        owner
      }
    } catch (error) {
      throw new Error(`ERC20コントラクトデプロイに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deployERC721Contract(params: ContractDeployParams): Promise<DeployedContract> {
    const signer = this.walletService.getSigner()
    if (!signer) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      // コントラクトがコンパイルされているか確認
      const isCompiled = await this.hardhatService.isContractCompiled('SimpleERC721')
      if (!isCompiled) {
        throw new Error('SimpleERC721コントラクトがコンパイルされていません。npx hardhat compile を実行してください。')
      }

      // artifactsからコントラクト情報を読み込み
      const artifact = await this.hardhatService.loadContractArtifact('SimpleERC721')
      
      const owner = await signer.getAddress()
      const baseURI = params.baseURI || 'https://example.com/metadata/'

      // コントラクトファクトリを作成
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer)
      
      // コントラクトをデプロイ
      const contract = await factory.deploy(
        params.name,
        params.symbol,
        baseURI,
        owner
      )

      // デプロイを待機
      await contract.waitForDeployment()
      const address = await contract.getAddress()
      const deployTransaction = contract.deploymentTransaction()
      
      if (!deployTransaction) {
        throw new Error('デプロイトランザクションが見つかりません')
      }

      return {
        address,
        transactionHash: deployTransaction.hash,
        type: 'erc721',
        name: params.name,
        symbol: params.symbol,
        owner
      }
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
    const signer = this.walletService.getSigner()
    
    if (!provider || !signer) {
      throw new Error('プロバイダーまたはウォレットが初期化されていません')
    }

    try {
      const contractName = params.type === 'erc20' ? 'SimpleERC20' : 'SimpleERC721'
      
      // コントラクトがコンパイルされているか確認
      const isCompiled = await this.hardhatService.isContractCompiled(contractName)
      if (!isCompiled) {
        // コンパイルされていない場合は仮の値を返す
        const gasLimit = ethers.getBigInt("500000")
        const feeData = await provider.getFeeData()
        const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
        
        return {
          gasLimit: gasLimit.toString(),
          gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
          estimatedFee: ethers.formatEther(gasLimit * gasPrice)
        }
      }

      // artifactsからコントラクト情報を読み込み
      const artifact = await this.hardhatService.loadContractArtifact(contractName)
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer)
      
      let deployData: string
      if (params.type === 'erc20') {
        const decimals = params.decimals || 18
        const totalSupply = ethers.parseUnits(params.totalSupply || "1000000", decimals)
        const owner = await signer.getAddress()
        
        deployData = factory.interface.encodeDeploy([
          params.name,
          params.symbol,
          decimals,
          totalSupply,
          owner
        ])
      } else {
        const owner = await signer.getAddress()
        const baseURI = params.baseURI || 'https://example.com/metadata/'
        
        deployData = factory.interface.encodeDeploy([
          params.name,
          params.symbol,
          baseURI,
          owner
        ])
      }

      // ガス見積もり
      const gasLimit = await provider.estimateGas({
        data: artifact.bytecode + deployData.slice(2),
        from: await signer.getAddress()
      })
      
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

  async getCompiledContracts(): Promise<string[]> {
    return await this.hardhatService.getAllCompiledContracts()
  }

  async compileContracts(): Promise<void> {
    try {
      await this.hardhatService.compileContracts()
    } catch (error) {
      throw new Error(`コントラクトコンパイルに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
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