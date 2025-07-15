import { vi } from 'vitest';

// モック用のテストデータ
export const MOCK_ADDRESS = '0x742d35Cc8Bb5e54DFBE08774c9F49c1CeFb2a8C3';
export const MOCK_BALANCE = '1000000000000000000'; // 1 ETH in wei
export const MOCK_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// MockProvider class
export class MockJsonRpcProvider {
  getBalance = vi.fn().mockResolvedValue(MOCK_BALANCE);
  estimateGas = vi.fn().mockResolvedValue(BigInt(21000));
  getFeeData = vi.fn().mockResolvedValue({
    gasPrice: BigInt('20000000000'), // 20 gwei
    maxFeePerGas: BigInt('25000000000'),
    maxPriorityFeePerGas: BigInt('2000000000')
  });
  getNetwork = vi.fn().mockResolvedValue({
    name: 'sepolia',
    chainId: 11155111
  });
  send = vi.fn().mockResolvedValue('mock-result');
}

// MockWallet class
export class MockWallet {
  address = MOCK_ADDRESS;
  provider: MockJsonRpcProvider;

  constructor(privateKey: string, provider?: MockJsonRpcProvider) {
    // Validate private key format
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error('Invalid private key: must be a non-empty string');
    }
    
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Check if it's a valid hex string of proper length (64 characters + 0x prefix)
    if (!/^0x[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
      throw new Error('Invalid private key: must be a valid hex string');
    }
    
    this.provider = provider || new MockJsonRpcProvider();
  }

  getAddress = vi.fn().mockResolvedValue(MOCK_ADDRESS);
  
  sendTransaction = vi.fn().mockResolvedValue({
    hash: MOCK_TX_HASH,
    wait: vi.fn().mockResolvedValue({
      status: 1,
      transactionHash: MOCK_TX_HASH,
      blockNumber: 12345,
      gasUsed: BigInt(21000)
    })
  });

  connect = vi.fn().mockReturnThis();
}

// ethersモックオブジェクト
export const mockEthers = {
  JsonRpcProvider: vi.fn().mockImplementation(() => new MockJsonRpcProvider()),
  Wallet: vi.fn().mockImplementation((privateKey: string, provider?: any) => new MockWallet(privateKey, provider)),
  formatEther: vi.fn().mockImplementation((value: any) => {
    if (value === MOCK_BALANCE) return '1.0';
    return '0.0';
  }),
  parseEther: vi.fn().mockImplementation((value: string) => BigInt(parseFloat(value) * 1e18)),
  formatUnits: vi.fn().mockImplementation((value: any, units: string) => {
    if (units === 'gwei') return '20';
    return '0';
  }),
  parseUnits: vi.fn().mockImplementation((value: string, units: string) => {
    if (units === 'gwei') return BigInt(parseFloat(value) * 1e9);
    return BigInt(0);
  }),
  isAddress: vi.fn().mockImplementation((address: string) => {
    if (!address || typeof address !== 'string') return false;
    return address.length === 42 && address.startsWith('0x') && /^0x[0-9a-fA-F]{40}$/.test(address);
  }),
  Contract: vi.fn().mockImplementation(() => ({
    deployed: vi.fn().mockResolvedValue({}),
    deploy: vi.fn().mockResolvedValue({})
  }))
};

// WalletConnectServiceのモック
export const MockWalletConnectService = {
  getInstance: vi.fn().mockReturnValue({
    initializeProvider: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue({
      address: MOCK_ADDRESS,
      provider: {
        getSigner: vi.fn().mockResolvedValue({
          getAddress: vi.fn().mockResolvedValue(MOCK_ADDRESS)
        })
      },
      walletName: 'WalletConnect Test'
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(false),
    getProvider: vi.fn().mockReturnValue(null),
    getSigner: vi.fn().mockReturnValue(null),
    getConnectedAccounts: vi.fn().mockReturnValue([]),
    getConnectedChains: vi.fn().mockReturnValue([]),
    switchChain: vi.fn().mockResolvedValue(undefined)
  })
};

// vi.mockでethersライブラリ全体をモック
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...actual,
    ...mockEthers,
    ethers: mockEthers
  };
});

// WalletConnectServiceのモック
vi.mock('../../actions/services/walletConnectService', () => ({
  WalletConnectService: MockWalletConnectService
}));