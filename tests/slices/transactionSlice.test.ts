import transactionReducer, {
  addTransaction,
  updateTransaction,
  setPendingTx,
  setLoading,
  setError,
  clearHistory,
  setGasEstimate,
  setTokenInfo,
  TransactionState,
  TransactionHistory
} from '../../actions/slices/transactionSlice';

describe('transactionSlice', () => {
  const initialState: TransactionState = {
    history: [],
    isLoading: false,
    error: null,
    pendingTx: null,
    gasEstimate: null,
    tokenInfo: null,
  };

  it('初期状態が正しい', () => {
    expect(transactionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('addTransactionで履歴にトランザクションが追加される', () => {
    const testTransaction: TransactionHistory = {
      hash: '0x123',
      from: '0xfrom',
      to: '0xto',
      value: '1.0',
      type: 'native',
      status: 'pending',
      timestamp: 1234567890
    };

    const actual = transactionReducer(initialState, addTransaction(testTransaction));
    expect(actual.history).toHaveLength(1);
    expect(actual.history[0]).toEqual(testTransaction);
  });

  it('updateTransactionでトランザクションが更新される', () => {
    const testTransaction: TransactionHistory = {
      hash: '0x123',
      from: '0xfrom',
      to: '0xto',
      value: '1.0',
      type: 'native',
      status: 'pending',
      timestamp: 1234567890
    };

    const stateWithTransaction = {
      ...initialState,
      history: [testTransaction]
    };

    const actual = transactionReducer(
      stateWithTransaction,
      updateTransaction({
        hash: '0x123',
        updates: { status: 'confirmed', gasUsed: '21000' }
      })
    );

    expect(actual.history[0].status).toEqual('confirmed');
    expect(actual.history[0].gasUsed).toEqual('21000');
  });

  it('setPendingTxで保留中のトランザクションが設定される', () => {
    const testHash = '0x123';
    const actual = transactionReducer(initialState, setPendingTx(testHash));
    expect(actual.pendingTx).toEqual(testHash);
  });

  it('setLoadingでローディング状態が設定される', () => {
    const actual = transactionReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('setErrorでエラーが設定される', () => {
    const testError = 'テストエラー';
    const actual = transactionReducer(initialState, setError(testError));
    expect(actual.error).toEqual(testError);
  });

  it('clearHistoryで履歴がクリアされる', () => {
    const testTransaction: TransactionHistory = {
      hash: '0x123',
      from: '0xfrom',
      to: '0xto',
      value: '1.0',
      type: 'native',
      status: 'pending',
      timestamp: 1234567890
    };

    const stateWithHistory = {
      ...initialState,
      history: [testTransaction]
    };

    const actual = transactionReducer(stateWithHistory, clearHistory());
    expect(actual.history).toHaveLength(0);
  });

  it('setGasEstimateでガス見積もりが設定される', () => {
    const testGasEstimate = {
      gasLimit: '21000',
      gasPrice: '20',
      estimatedFee: '0.00042'
    };

    const actual = transactionReducer(initialState, setGasEstimate(testGasEstimate));
    expect(actual.gasEstimate).toEqual(testGasEstimate);
  });

  it('setTokenInfoでトークン情報が設定される', () => {
    const testTokenInfo = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      balance: '1000.0'
    };

    const actual = transactionReducer(initialState, setTokenInfo(testTokenInfo));
    expect(actual.tokenInfo).toEqual(testTokenInfo);
  });

  it('存在しないハッシュでupdateTransactionは何も変更しない', () => {
    const testTransaction: TransactionHistory = {
      hash: '0x123',
      from: '0xfrom',
      to: '0xto',
      value: '1.0',
      type: 'native',
      status: 'pending',
      timestamp: 1234567890
    };

    const stateWithTransaction = {
      ...initialState,
      history: [testTransaction]
    };

    const actual = transactionReducer(
      stateWithTransaction,
      updateTransaction({
        hash: '0x999', // 存在しないハッシュ
        updates: { status: 'confirmed' }
      })
    );

    expect(actual.history[0]).toEqual(testTransaction); // 変更されない
  });
});