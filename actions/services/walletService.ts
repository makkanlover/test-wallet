import { ethers } from 'ethers'
import { Network } from '../slices/walletSlice'
import { getEnvVar } from '../utils/env'

export class WalletService {
  private static instance: WalletService
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null = null
  private wallet: ethers.Wallet | null = null
  private externalSigner: ethers.JsonRpcSigner | null = null

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
        provider: this.provider
      }
    } catch (error) {
      throw new Error(`外部ウォレット接続に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
    const signer = this.wallet || this.externalSigner
    if (!signer) {
      throw new Error('ウォレットが接続されていません')
    }

    try {
      const tx = await signer.sendTransaction({
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