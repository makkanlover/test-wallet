import { ethers } from 'ethers'
import { WalletService } from './walletService'

export interface TransactionData {
  to: string
  amount: string
  type: 'native' | 'erc20' | 'nft'
  contractAddress?: string
  tokenId?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  estimatedFee: string
  actualGasPrice?: string
  actualEstimatedFee?: string
}

export class TransactionService {
  private static instance: TransactionService
  private walletService: WalletService

  constructor() {
    this.walletService = WalletService.getInstance()
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  async sendNativeToken(to: string, amount: string, gasBufferMultiplier: number = 1.0): Promise<string> {
    return this.walletService.sendTransaction(to, amount, gasBufferMultiplier)
  }

  async sendERC20Token(to: string, amount: string, contractAddress: string, decimals: number = 18, gasBufferMultiplier: number = 1.0): Promise<string> {
    const signer = this.walletService.getSigner()
    const provider = this.walletService.getProvider()
    if (!signer || !provider) {
      throw new Error('ウォレットが接続されていません')
    }

    const erc20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function balanceOf(address owner) view returns (uint256)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, signer)
      const parsedAmount = ethers.parseUnits(amount, decimals)
      
      // ガス見積もりを取得
      const gasLimit = await contract.transfer.estimateGas(to, parsedAmount)
      const feeData = await provider.getFeeData()
      let gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
      
      // バッファ倍率を適用
      gasPrice = BigInt(Math.floor(Number(gasPrice) * gasBufferMultiplier))
      
      const tx = await contract.transfer(to, parsedAmount, {
        gasLimit: BigInt(Math.floor(Number(gasLimit) * 1.1)),
        gasPrice
      })
      return tx.hash
    } catch (error) {
      throw new Error(`ERC20トークン送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async mintNFT(to: string, tokenId: string, contractAddress: string, gasBufferMultiplier: number = 1.0): Promise<string> {
    const signer = this.walletService.getSigner()
    const provider = this.walletService.getProvider()
    if (!signer || !provider) {
      throw new Error('ウォレットが接続されていません')
    }

    const erc721Abi = [
      'function mint(address to, uint256 tokenId)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function tokenURI(uint256 tokenId) view returns (string)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc721Abi, signer)
      
      // ガス見積もりを取得
      const gasLimit = await contract.mint.estimateGas(to, tokenId)
      const feeData = await provider.getFeeData()
      let gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
      
      // バッファ倍率を適用
      gasPrice = BigInt(Math.floor(Number(gasPrice) * gasBufferMultiplier))
      
      const tx = await contract.mint(to, tokenId, {
        gasLimit: BigInt(Math.floor(Number(gasLimit) * 1.1)),
        gasPrice
      })
      return tx.hash
    } catch (error) {
      throw new Error(`NFT発行に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateNativeGas(to: string, amount: string, gasBufferMultiplier: number = 1.0): Promise<GasEstimate> {
    return this.walletService.estimateGas(to, amount, gasBufferMultiplier)
  }

  async estimateERC20Gas(to: string, amount: string, contractAddress: string, decimals: number = 18, gasBufferMultiplier: number = 1.0): Promise<GasEstimate> {
    const provider = this.walletService.getProvider()
    const wallet = this.walletService.getWallet()
    
    if (!provider || !wallet) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    const erc20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, wallet)
      const parsedAmount = ethers.parseUnits(amount, decimals)
      
      const gasLimit = await contract.transfer.estimateGas(to, parsedAmount)
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
      
      // 基本の見積もり
      const estimatedFee = ethers.formatEther(gasLimit * gasPrice)
      
      // バッファ適用後の実際の値
      const actualGasPrice = BigInt(Math.floor(Number(gasPrice) * gasBufferMultiplier))
      const actualGasLimit = BigInt(Math.floor(Number(gasLimit) * 1.1))
      const actualEstimatedFee = ethers.formatEther(actualGasLimit * actualGasPrice)

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedFee,
        actualGasPrice: ethers.formatUnits(actualGasPrice, 'gwei'),
        actualEstimatedFee
      }
    } catch (error) {
      throw new Error(`ERC20ガス見積もりに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getERC20TokenInfo(contractAddress: string): Promise<{
    name: string
    symbol: string
    decimals: number
    balance: string
  }> {
    const provider = this.walletService.getProvider()
    const wallet = this.walletService.getWallet()
    
    if (!provider || !wallet) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    const erc20Abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function balanceOf(address owner) view returns (uint256)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, provider)
      const address = await wallet.getAddress()
      
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(address)
      ])

      return {
        name,
        symbol,
        decimals,
        balance: ethers.formatUnits(balance, decimals)
      }
    } catch (error) {
      throw new Error(`トークン情報取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  validateAddress(address: string): boolean {
    return ethers.isAddress(address)
  }

  validateAmount(amount: string): boolean {
    try {
      const num = parseFloat(amount)
      return num > 0 && isFinite(num)
    } catch {
      return false
    }
  }
}