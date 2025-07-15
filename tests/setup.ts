import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ethersモックをインポート
import './mocks/ethers';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});

// モック環境変数
process.env.ETHEREUM_RPC_URL = 'https://sepolia.infura.io/v3/test';
process.env.POLYGON_RPC_URL = 'https://amoy.infura.io/v3/test';
process.env.DEFAULT_NETWORK = 'sepolia';
process.env.PRIVATE_KEY = '321d68ca900f2837d3c6d0020e953685afe6846ab3bfe32e137d2a40df5d167e';

// Web3関連のモック
(global as any).window = global.window || {};
(global as any).window.ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};

// Emotionのモック
vi.mock('@emotion/react', async () => {
  const actual = await vi.importActual('@emotion/react');
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    })
  };
});

// React Hook Formのモック
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit: vi.fn((fn) => (e) => {
      e?.preventDefault?.();
      return fn({});
    }),
    formState: { errors: {} },
    watch: vi.fn(() => ''),
    reset: vi.fn()
  })
}));