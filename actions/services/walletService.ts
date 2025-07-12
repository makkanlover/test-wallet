import { ethers } from 'ethers'
import { Network } from '../slices/walletSlice'

export class WalletService {
  private static instance: WalletService
  private provider: ethers.JsonRpcProvider | null = null
  private wallet: ethers.Wallet | null = null

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private getEnvVar(key: string, defaultValue: string = ''): string {
    // ブラウザ環境での環境変数取得
    if (typeof window !== 'undefined') {
      // サーバーから提供される環境変数
      const envVars = (window as any).__ENV__;
      if (envVars && envVars[key]) {
        return envVars[key];
      }
      
      // Viteの環境変数（開発時）
      if (import.meta?.env && import.meta.env[key]) {
        return import.meta.env[key];
      }
    }
    
    // Node.js環境（テスト等）
    return process.env[key] || defaultValue;
  }

  private getPrivateKeyFromEnv(): string {
    const privateKey = this.getEnvVar('VITE_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('秘密鍵が.envファイルに設定されていません。PRIVATE_KEYを設定してアプリを再起動してください。');
    }
    return privateKey;
  }

  async connectLocalWallet(network: Network): Promise<{
    address: string
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
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
        wallet: this.wallet
      }
    } catch (error) {
      throw new Error(`ウォレット接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async connectWithPrivateKey(privateKey: string, network: Network): Promise<{
    address: string
    provider: ethers.JsonRpcProvider
    wallet: ethers.Wallet
  }> {
    try {
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl)
      
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
      this.wallet = new ethers.Wallet(cleanPrivateKey, this.provider)

      const address = await this.wallet.getAddress()
      
      return {
        address,
        provider: this.provider,
        wallet: this.wallet
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

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      })
      
      return tx.hash
    } catch (error) {
      throw new Error(`トランザクション送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateGas(to: string, amount: string): Promise<{
    gasLimit: string
    gasPrice: string
    estimatedFee: string
  }> {
    if (!this.wallet || !this.provider) {
      throw new Error('ウォレットまたはプロバイダーが初期化されていません')
    }

    try {
      const gasLimit = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(amount),
        from: await this.wallet.getAddress()
      })

      const feeData = await this.provider.getFeeData()
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

  disconnect(): void {
    this.provider = null
    this.wallet = null
  }

  getProvider(): ethers.JsonRpcProvider | null {
    return this.provider
  }

  getWallet(): ethers.Wallet | null {
    return this.wallet
  }
}