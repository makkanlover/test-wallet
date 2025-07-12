import '@testing-library/jest-dom';

// モック環境変数
process.env.VITE_ETHEREUM_RPC_URL = 'https://goerli.infura.io/v3/test';
process.env.VITE_POLYGON_RPC_URL = 'https://rpc-mumbai.maticvigil.com';
process.env.VITE_BSC_RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545';
process.env.VITE_DEFAULT_NETWORK = 'goerli';

// import.meta.envのモック
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_ETHEREUM_RPC_URL: 'https://goerli.infura.io/v3/test',
        VITE_POLYGON_RPC_URL: 'https://rpc-mumbai.maticvigil.com',
        VITE_BSC_RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        VITE_DEFAULT_NETWORK: 'goerli',
      }
    }
  },
  writable: true
});

// Web3関連のモック
(global as any).window = global.window || {};
(global as any).window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};