// ブラウザ対応のコントラクト情報管理（LocalStorage使用）
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

  static resetInstance(): void {
    ContractStorageService.instance = null as any
  }

  private async readContracts(): Promise<ContractsData> {
    try {
      if (typeof window === 'undefined') {
        // Node.js環境（テスト等）では空のデータを返す
        return { contracts: [] }
      }
      
      // まずLocalStorageから読み込み
      const localData = localStorage.getItem(CONTRACTS_STORAGE_KEY)
      let localContracts: ContractsData = { contracts: [] }
      
      if (localData) {
        try {
          localContracts = JSON.parse(localData)
        } catch (error) {
          console.warn('LocalStorageのデータ読み込みエラー:', error)
        }
      }
      
      // サーバーからcontracts.jsonを読み込み
      try {
        const response = await fetch('/contracts.json')
        if (response.ok) {
          const serverContracts: ContractsData = await response.json()
          
          // サーバーのコントラクトとローカルのコントラクトをマージ
          const mergedContracts = [...serverContracts.contracts]
          
          // ローカルのコントラクトでサーバーにないものを追加
          localContracts.contracts.forEach(localContract => {
            const exists = mergedContracts.find(serverContract => 
              serverContract.contract_address.toLowerCase() === localContract.contract_address.toLowerCase()
            )
            if (!exists) {
              mergedContracts.push(localContract)
            }
          })
          
          const mergedData = { contracts: mergedContracts }
          
          // マージした結果をLocalStorageに保存
          this.writeContracts(mergedData)
          
          return mergedData
        }
      } catch (error) {
        console.warn('サーバーからのコントラクト読み込みエラー:', error)
      }
      
      // サーバーから読み込めない場合はLocalStorageのデータを返す
      return localContracts
    } catch (error) {
      console.error('コントラクト情報の読み込みエラー:', error)
      return { contracts: [] }
    }
  }

  private writeContracts(data: ContractsData): void {
    try {
      if (typeof window === 'undefined') {
        // Node.js環境（テスト等）では何もしない
        return
      }
      
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('コントラクト情報の保存エラー:', error)
      throw new Error('コントラクト情報の保存に失敗しました')
    }
  }

  async saveContract(contract: Omit<StoredContract, 'id' | 'deployedAt'>): Promise<StoredContract> {
    const data = await this.readContracts()
    
    const newContract: StoredContract = {
      ...contract,
      id: `${contract.type}_${contract.name}_${Date.now()}`,
      deployedAt: new Date().toISOString()
    }

    data.contracts.push(newContract)
    this.writeContracts(data)
    
    return newContract
  }

  async getAllContracts(): Promise<StoredContract[]> {
    const data = await this.readContracts()
    return data.contracts
  }

  async getContractsByType(type: 'ERC20' | 'ERC721'): Promise<StoredContract[]> {
    const data = await this.readContracts()
    return data.contracts.filter(contract => contract.type === type)
  }

  async getContractById(id: string): Promise<StoredContract | null> {
    const data = await this.readContracts()
    return data.contracts.find(contract => contract.id === id) || null
  }

  async getContractByAddress(address: string): Promise<StoredContract | null> {
    const data = await this.readContracts()
    return data.contracts.find(contract => 
      contract.contract_address.toLowerCase() === address.toLowerCase()
    ) || null
  }

  async deleteContract(id: string): Promise<boolean> {
    const data = await this.readContracts()
    const initialLength = data.contracts.length
    data.contracts = data.contracts.filter(contract => contract.id !== id)
    
    if (data.contracts.length < initialLength) {
      this.writeContracts(data)
      return true
    }
    return false
  }

  async clearAllContracts(): Promise<void> {
    this.writeContracts({ contracts: [] })
  }
}