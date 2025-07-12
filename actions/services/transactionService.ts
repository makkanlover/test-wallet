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

  async sendNativeToken(to: string, amount: string): Promise<string> {
    const wallet = this.walletService.getWallet()
    if (!wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      })
      
      return tx.hash
    } catch (error) {
      throw new Error(`ネイティブトークン送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendERC20Token(to: string, amount: string, contractAddress: string, decimals: number = 18): Promise<string> {
    const wallet = this.walletService.getWallet()
    if (!wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    const erc20Abi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function balanceOf(address owner) view returns (uint256)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc20Abi, wallet)
      const parsedAmount = ethers.parseUnits(amount, decimals)
      
      const tx = await contract.transfer(to, parsedAmount)
      return tx.hash
    } catch (error) {
      throw new Error(`ERC20トークン送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async mintNFT(to: string, tokenId: string, contractAddress: string): Promise<string> {
    const wallet = this.walletService.getWallet()
    if (!wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    const erc721Abi = [
      'function mint(address to, uint256 tokenId)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function tokenURI(uint256 tokenId) view returns (string)'
    ]

    try {
      const contract = new ethers.Contract(contractAddress, erc721Abi, wallet)
      const tx = await contract.mint(to, tokenId)
      return tx.hash
    } catch (error) {
      throw new Error(`NFT発行に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateNativeGas(to: string, amount: string): Promise<GasEstimate> {
    const provider = this.walletService.getProvider()
    const wallet = this.walletService.getWallet()
    
    if (!provider || !wallet) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    try {
      const gasLimit = await provider.estimateGas({
        to,
        value: ethers.parseEther(amount),
        from: await wallet.getAddress()
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

  async estimateERC20Gas(to: string, amount: string, contractAddress: string, decimals: number = 18): Promise<GasEstimate> {
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
      
      const estimatedFee = ethers.formatEther(gasLimit * gasPrice)

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedFee
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