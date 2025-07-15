import { ethers } from 'ethers'
import { Network } from '../slices/walletSlice'
import { getEnvVar } from '../utils/env'
import { WalletConnectService } from './walletConnectService'

export class WalletService {
  private static instance: WalletService
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null = null
  private wallet: ethers.Wallet | null = null
  private externalSigner: ethers.JsonRpcSigner | null = null
  private walletConnectService: WalletConnectService

  private constructor() {
    this.walletConnectService = WalletConnectService.getInstance()
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private getPrivateKeyFromEnv(): string {
    const privateKey = getEnvVar('PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('秘密鍵が.envファイルに設定されていません。PRIVATE_KEYを設定してアプリを再起動してください。');
    }
    return privateKey;
  }

  async connectExternalWallet(network: Network): Promise<{
    address: string
    provider: ethers.BrowserProvider
    walletName: string
  }> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMaskが見つかりません。ブラウザでMetaMaskをインストールしてください。')
      }

      const ethereum = window.ethereum
      this.provider = new ethers.BrowserProvider(ethereum)
      
      await ethereum.request({ method: 'eth_requestAccounts' })
      
      const chainId = `0x${network.chainId.toString(16)}`
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18
              }
            }],
          })
        } else {
          throw switchError
        }
      }

      this.externalSigner = await this.provider.getSigner()
      const address = await this.externalSigner.getAddress()
      
      return {
        address,
        provider: this.provider,
        walletName: 'MetaMask'
      }
    } catch (error) {
      throw new Error(`外部ウォレット接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async connectLocalWallet(network: Network): Promise<{
    address: string
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
    walletName: string
  }> {
    try {
      const privateKey = this.getPrivateKeyFromEnv();
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl)
      
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
      this.wallet = new ethers.Wallet(cleanPrivateKey, this.provider)

      const address = await this.wallet.getAddress()
      
      return {
        address,
        provider: this.provider,
        wallet: this.wallet,
        walletName: 'ローカルウォレット'
      }
    } catch (error) {
      throw new Error(`ウォレット接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async connectWithPrivateKey(privateKey: string, network: Network): Promise<{
    address: string
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
    walletName: string
  }> {
    try {
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl)
      
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
      this.wallet = new ethers.Wallet(cleanPrivateKey, this.provider)

      const address = await this.wallet.getAddress()
      
      return {
        address,
        provider: this.provider,
        wallet: this.wallet,
        walletName: 'ローカルウォレット'
      }
    } catch (error) {
      throw new Error(`ウォレット接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('プロバイダーが初期化されていません')
    }

    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      throw new Error(`残高取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendTransaction(to: string, amount: string, gasBufferMultiplier: number = 1.0): Promise<string> {
    const signer = this.wallet || this.externalSigner
    if (!signer || !this.provider) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    try {
      // ガス見積もりを取得
      const gasLimit = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(amount),
        from: await signer.getAddress()
      })

      const feeData = await this.provider.getFeeData()
      let gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei')
      
      // バッファ倍率を適用
      gasPrice = BigInt(Math.floor(Number(gasPrice) * gasBufferMultiplier))

      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
        gasLimit: BigInt(Math.floor(Number(gasLimit) * 1.1)), // gasLimitにも10%のバッファ
        gasPrice
      })
      
      return tx.hash
    } catch (error) {
      throw new Error(`トランザクション送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateGas(to: string, amount: string, gasBufferMultiplier: number = 1.0): Promise<{
    gasLimit: string
    gasPrice: string
    estimatedFee: string
    actualGasPrice: string
    actualEstimatedFee: string
  }> {
    const signer = this.wallet || this.externalSigner
    if (!signer || !this.provider) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    try {
      const gasLimit = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(amount),
        from: await signer.getAddress()
      })

      const feeData = await this.provider.getFeeData()
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
      throw new Error(`ガス見積もりに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  validateAddress(address: string): boolean {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  validatePrivateKey(privateKey: string): boolean {
    try {
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
      new ethers.Wallet(cleanPrivateKey)
      return true
    } catch {
      return false
    }
  }

  async connectWalletConnect(network: Network): Promise<{
    address: string
    provider: ethers.BrowserProvider
    walletName: string
  }> {
    try {
      const projectId = getEnvVar('WALLETCONNECT_PROJECT_ID', '')
      if (!projectId) {
        throw new Error('WalletConnect Project IDが設定されていません。環境変数WALLETCONNECT_PROJECT_IDを設定してください。')
      }

      await this.walletConnectService.initializeProvider({
        projectId,
        metadata: {
          name: 'Web3 Wallet System',
          description: 'Web3ウォレット管理・操作アプリ',
          url: window.location.origin,
          icons: ['https://walletconnect.com/walletconnect-logo.svg']
        }
      })

      const result = await this.walletConnectService.connect(network)
      
      this.provider = result.provider
      this.externalSigner = await result.provider.getSigner()
      
      return result
    } catch (error) {
      throw new Error(`WalletConnect接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.walletConnectService.isConnected()) {
      await this.walletConnectService.disconnect()
    }
    this.provider = null
    this.wallet = null
    this.externalSigner = null
  }

  getProvider(): ethers.JsonRpcProvider | ethers.BrowserProvider | null {
    return this.provider
  }

  getWallet(): ethers.Wallet | null {
    return this.wallet
  }

  getSigner(): ethers.Wallet | ethers.JsonRpcSigner | null {
    return this.wallet || this.externalSigner
  }
}