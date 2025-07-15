import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContractStorageService } from '../../actions/services/contractStorageService'

// グローバルなfetchをモック
global.fetch = vi.fn()

// LocalStorageをモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('ContractStorageService - Loading Tests', () => {
  let service: ContractStorageService

  beforeEach(() => {
    vi.clearAllMocks()
    ContractStorageService.resetInstance()
    service = ContractStorageService.getInstance()
  })

  it('should load contracts from server when available', async () => {
    const mockServerData = {
      contracts: [
        {
          id: 'ERC20_Server_Token_123',
          name: 'Server Token',
          symbol: 'SVR',
          contract_address: '0x1111111111111111111111111111111111111111',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-15T00:00:00.000Z',
          transactionHash: '0xserver123',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    }

    // fetchのモック設定
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServerData
    })

    // LocalStorageは空
    localStorageMock.getItem.mockReturnValue(null)

    const contracts = await service.getAllContracts()

    expect(fetch).toHaveBeenCalledWith('/contracts.json')
    expect(contracts).toHaveLength(1)
    expect(contracts[0].name).toBe('Server Token')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should merge server and local contracts', async () => {
    const mockServerData = {
      contracts: [
        {
          id: 'ERC20_Server_Token_123',
          name: 'Server Token',
          symbol: 'SVR',
          contract_address: '0x1111111111111111111111111111111111111111',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-15T00:00:00.000Z',
          transactionHash: '0xserver123',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    }

    const mockLocalData = {
      contracts: [
        {
          id: 'ERC20_Local_Token_456',
          name: 'Local Token',
          symbol: 'LOC',
          contract_address: '0x2222222222222222222222222222222222222222',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-15T01:00:00.000Z',
          transactionHash: '0xlocal456',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    }

    // fetchのモック設定
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServerData
    })

    // LocalStorageにデータがある
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLocalData))

    const contracts = await service.getAllContracts()

    expect(contracts).toHaveLength(2)
    expect(contracts.find(c => c.name === 'Server Token')).toBeDefined()
    expect(contracts.find(c => c.name === 'Local Token')).toBeDefined()
  })

  it('should handle server fetch failure gracefully', async () => {
    const mockLocalData = {
      contracts: [
        {
          id: 'ERC20_Local_Token_456',
          name: 'Local Token',
          symbol: 'LOC',
          contract_address: '0x2222222222222222222222222222222222222222',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-15T01:00:00.000Z',
          transactionHash: '0xlocal456',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    }

    // fetchが失敗
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    // LocalStorageにデータがある
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLocalData))

    const contracts = await service.getAllContracts()

    expect(contracts).toHaveLength(1)
    expect(contracts[0].name).toBe('Local Token')
  })

  it('should return empty array when no data available', async () => {
    // fetchが失敗
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    // LocalStorageも空
    localStorageMock.getItem.mockReturnValue(null)

    const contracts = await service.getAllContracts()

    expect(contracts).toHaveLength(0)
  })

  it('should filter contracts by type', async () => {
    const mockServerData = {
      contracts: [
        {
          id: 'ERC20_Token_123',
          name: 'ERC20 Token',
          symbol: 'E20',
          contract_address: '0x1111111111111111111111111111111111111111',
          abi: [],
          type: 'ERC20' as const,
          deployedAt: '2025-07-15T00:00:00.000Z',
          transactionHash: '0xerc20',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        },
        {
          id: 'ERC721_Token_456',
          name: 'ERC721 Token',
          symbol: 'E721',
          contract_address: '0x2222222222222222222222222222222222222222',
          abi: [],
          type: 'ERC721' as const,
          deployedAt: '2025-07-15T01:00:00.000Z',
          transactionHash: '0xerc721',
          network: 'sepolia',
          owner: '0x0eA1b1C4260DF8b76087011905955e869220e11D'
        }
      ]
    }

    // fetchのモック設定（2回呼ばれるため）
    ;(fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerData
      })

    localStorageMock.getItem.mockReturnValue(null)

    const erc20Contracts = await service.getContractsByType('ERC20')
    const erc721Contracts = await service.getContractsByType('ERC721')

    expect(erc20Contracts).toHaveLength(1)
    expect(erc20Contracts[0].type).toBe('ERC20')
    expect(erc721Contracts).toHaveLength(1)
    expect(erc721Contracts[0].type).toBe('ERC721')
  })
})