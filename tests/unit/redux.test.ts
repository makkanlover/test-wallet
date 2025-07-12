import { describe, it, expect } from 'vitest';
import walletReducer, { setAddress, setBalance, setLoading } from '../../actions/slices/walletSlice';
import transactionReducer, { setLoading as setTransactionLoading, addTransaction } from '../../actions/slices/transactionSlice';

describe('Redux State Management', () => {
  describe('WalletSlice', () => {
    const initialState = {
      address: null,
      balance: '0',
      network: {
        id: 'sepolia',
        name: 'Ethereum Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/',
        chainId: 11155111,
        currency: 'SepoliaETH'
      },
      isConnected: false,
      connectionType: null,
      provider: null,
      isLoading: false,
      error: null,
    };

    it('should set address correctly', () => {
      const action = setAddress('0x1234567890123456789012345678901234567890');
      const newState = walletReducer(initialState, action);
      
      expect(newState.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should set balance correctly', () => {
      const action = setBalance('1.5');
      const newState = walletReducer(initialState, action);
      
      expect(newState.balance).toBe('1.5');
    });

    it('should set loading state correctly', () => {
      const action = setLoading(true);
      const newState = walletReducer(initialState, action);
      
      expect(newState.isLoading).toBe(true);
    });
  });

  describe('TransactionSlice', () => {
    const initialState = {
      history: [],
      isLoading: false,
      error: null,
      pendingTx: null,
      gasEstimate: null,
      tokenInfo: null,
    };

    it('should set loading state correctly', () => {
      const action = setTransactionLoading(true);
      const newState = transactionReducer(initialState, action);
      
      expect(newState.isLoading).toBe(true);
    });

    it('should add transaction to history', () => {
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
});