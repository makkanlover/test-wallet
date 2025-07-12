import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@emotion/react';
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '../../actions/slices/walletSlice';
import transactionReducer from '../../actions/slices/transactionSlice';
import contractReducer from '../../actions/slices/contractSlice';
import settingsReducer from '../../actions/slices/settingsSlice';
import { lightTheme } from '../../ui/themes';

// テスト用のストア作成関数
export const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      wallet: walletReducer,
      transaction: transactionReducer,
      contract: contractReducer,
      settings: settingsReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // テストでは無効化
      }),
  });
};

// テスト用のWrapper
interface WrapperProps {
  children: React.ReactNode;
  store?: ReturnType<typeof createTestStore>;
}

const TestWrapper: React.FC<WrapperProps> = ({ children, store = createTestStore() }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};

// カスタムレンダー関数
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    preloadedState?: any;
    store?: ReturnType<typeof createTestStore>;
  }
) => {
  const { preloadedState, store = createTestStore(preloadedState), ...renderOptions } = options || {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper store={store}>{children}</TestWrapper>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// re-export everything
export * from '@testing-library/react';
export { customRender as render };