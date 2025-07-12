import walletReducer, { setAddress, setBalance, setLoading } from '../actions/slices/walletSlice';
import transactionReducer, { setLoading as setTransactionLoading, addTransaction } from '../actions/slices/transactionSlice';

describe('Basic State Management', () => {
  describe('WalletSlice', () => {
    it('should set address correctly', () => {
      const initialState = {
        address: null,
        balance: '0',
        network: {
          id: 'goerli',
          name: 'Ethereum Goerli',
          rpcUrl: 'https://goerli.infura.io/v3/',
          chainId: 5,
          currency: 'GoerliETH'
        },
        isConnected: false,
        connectionType: null,
        provider: null,
        isLoading: false,
        error: null,
      };

      const action = setAddress('0x1234567890123456789012345678901234567890');
      const newState = walletReducer(initialState, action);
      
      expect(newState.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should set balance correctly', () => {
      const initialState = {
        address: null,
        balance: '0',
        network: {
          id: 'goerli',
          name: 'Ethereum Goerli',
          rpcUrl: 'https://goerli.infura.io/v3/',
          chainId: 5,
          currency: 'GoerliETH'
        },
        isConnected: false,
        connectionType: null,
        provider: null,
        isLoading: false,
        error: null,
      };

      const action = setBalance('1.5');
      const newState = walletReducer(initialState, action);
      
      expect(newState.balance).toBe('1.5');
    });

    it('should set loading state correctly', () => {
      const initialState = {
        address: null,
        balance: '0',
        network: {
          id: 'goerli',
          name: 'Ethereum Goerli',
          rpcUrl: 'https://goerli.infura.io/v3/',
          chainId: 5,
          currency: 'GoerliETH'
        },
        isConnected: false,
        connectionType: null,
        provider: null,
        isLoading: false,
        error: null,
      };

      const action = setLoading(true);
      const newState = walletReducer(initialState, action);
      
      expect(newState.isLoading).toBe(true);
    });
  });

  describe('TransactionSlice', () => {
    it('should set loading state correctly', () => {
      const initialState = {
        history: [],
        isLoading: false,
        error: null,
        pendingTx: null,
        gasEstimate: null,
        tokenInfo: null,
      };

      const action = setTransactionLoading(true);
      const newState = transactionReducer(initialState, action);
      
      expect(newState.isLoading).toBe(true);
    });

    it('should add transaction to history', () => {
      const initialState = {
        history: [],
        isLoading: false,
        error: null,
        pendingTx: null,
        gasEstimate: null,
        tokenInfo: null,
      };

      const transaction = {
        hash: '0x123',
        from: '0xfrom',
        to: '0xto',
        value: '1.0',
        type: 'native' as const,
        status: 'pending' as const,
        timestamp: 1234567890
      };

      const action = addTransaction(transaction);
      const newState = transactionReducer(initialState, action);
      
      expect(newState.history).toHaveLength(1);
      expect(newState.history[0]).toEqual(transaction);
    });
  });

  describe('Component Utilities', () => {
    it('should validate environment setup', () => {
      expect(process.env.VITE_ETHEREUM_RPC_URL).toBe('https://goerli.infura.io/v3/test');
      expect(process.env.VITE_DEFAULT_NETWORK).toBe('goerli');
    });
  });
});