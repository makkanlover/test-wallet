import walletReducer, {
  setAddress,
  setBalance,
  setNetwork,
  setConnected,
  setProvider,
  setLoading,
  setError,
  reset,
  WalletState
} from '../../actions/slices/walletSlice';

describe('walletSlice', () => {
  const initialState: WalletState = {
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

  it('初期状態が正しい', () => {
    expect(walletReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('setAddressでアドレスが設定される', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    const actual = walletReducer(initialState, setAddress(testAddress));
    expect(actual.address).toEqual(testAddress);
  });

  it('setBalanceで残高が設定される', () => {
    const testBalance = '1.5';
    const actual = walletReducer(initialState, setBalance(testBalance));
    expect(actual.balance).toEqual(testBalance);
  });

  it('setNetworkでネットワークが変更される', () => {
    const actual = walletReducer(initialState, setNetwork('mumbai'));
    expect(actual.network?.id).toEqual('mumbai');
    expect(actual.network?.name).toEqual('Polygon Mumbai');
    expect(actual.network?.chainId).toEqual(80001);
  });

  it('setConnectedで接続状態が設定される', () => {
    const actual = walletReducer(
      initialState, 
      setConnected({ connected: true, type: 'local' })
    );
    expect(actual.isConnected).toBe(true);
    expect(actual.connectionType).toEqual('local');
  });

  it('setProviderでプロバイダーが設定される', () => {
    const mockProvider = { test: 'provider' };
    const actual = walletReducer(initialState, setProvider(mockProvider));
    expect(actual.provider).toEqual(mockProvider);
  });

  it('setLoadingでローディング状態が設定される', () => {
    const actual = walletReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('setErrorでエラーが設定される', () => {
    const testError = 'テストエラー';
    const actual = walletReducer(initialState, setError(testError));
    expect(actual.error).toEqual(testError);
  });

  it('resetで状態がリセットされる', () => {
    const connectedState: WalletState = {
      ...initialState,
      address: '0x1234567890123456789012345678901234567890',
      balance: '1.5',
      isConnected: true,
      connectionType: 'local',
      provider: { test: 'provider' },
      error: 'some error'
    };

    const actual = walletReducer(connectedState, reset());
    expect(actual.address).toBeNull();
    expect(actual.balance).toEqual('0');
    expect(actual.isConnected).toBe(false);
    expect(actual.connectionType).toBeNull();
    expect(actual.provider).toBeNull();
    expect(actual.error).toBeNull();
  });

  it('無効なネットワークIDでは変更されない', () => {
    const actual = walletReducer(initialState, setNetwork('invalid-network'));
    expect(actual.network).toEqual(initialState.network);
  });
});