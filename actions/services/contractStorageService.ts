// ブラウザ環境でのローカルストレージを使用したコントラクト情報管理

export interface StoredContract {
  id: string
  name: string
  symbol: string
  contract_address: string
  abi: any[]
  type: 'ERC20' | 'ERC721'
  deployedAt: string
  transactionHash: string
  network: string
  owner: string
}

export interface ContractsData {
  contracts: StoredContract[]
}

const CONTRACTS_STORAGE_KEY = 'web3-wallet-contracts'

export class ContractStorageService {
  private static instance: ContractStorageService

  static getInstance(): ContractStorageService {
    if (!ContractStorageService.instance) {
      ContractStorageService.instance = new ContractStorageService()
    }
    return ContractStorageService.instance
  }

  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  private readContracts(): ContractsData {
    try {
      if (!this.isClient()) {
        return { contracts: [] }
      }
      
      const data = localStorage.getItem(CONTRACTS_STORAGE_KEY)
      if (!data) {
        return { contracts: [] }
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('コントラクト情報の読み込みエラー:', error)
      return { contracts: [] }
    }
  }

  private writeContracts(data: ContractsData): void {
    try {
      if (!this.isClient()) {
        throw new Error('ブラウザ環境ではありません')
      }
      
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('コントラクト情報の保存エラー:', error)
      throw new Error('コントラクト情報の保存に失敗しました')
    }
  }

  saveContract(contract: Omit<StoredContract, 'id' | 'deployedAt'>): StoredContract {
    const data = this.readContracts()
    
    const newContract: StoredContract = {
      ...contract,
      id: `${contract.type}_${contract.name}_${Date.now()}`,
      deployedAt: new Date().toISOString()
    }

    data.contracts.push(newContract)
    this.writeContracts(data)
    
    return newContract
  }

  getAllContracts(): StoredContract[] {
    const data = this.readContracts()
    return data.contracts
  }

  getContractsByType(type: 'ERC20' | 'ERC721'): StoredContract[] {
    const data = this.readContracts()
    return data.contracts.filter(contract => contract.type === type)
  }

  getContractById(id: string): StoredContract | null {
    const data = this.readContracts()
    return data.contracts.find(contract => contract.id === id) || null
  }

  getContractByAddress(address: string): StoredContract | null {
    const data = this.readContracts()
    return data.contracts.find(contract => 
      contract.contract_address.toLowerCase() === address.toLowerCase()
    ) || null
  }

  deleteContract(id: string): boolean {
    const data = this.readContracts()
    const initialLength = data.contracts.length
    data.contracts = data.contracts.filter(contract => contract.id !== id)
    
    if (data.contracts.length < initialLength) {
      this.writeContracts(data)
      return true
    }
    return false
  }

  clearAllContracts(): void {
    this.writeContracts({ contracts: [] })
  }
}