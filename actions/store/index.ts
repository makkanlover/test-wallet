import { configureStore } from '@reduxjs/toolkit'
import walletReducer from '../slices/walletSlice'
import transactionReducer from '../slices/transactionSlice'
import contractReducer from '../slices/contractSlice'
import settingsReducer from '../slices/settingsSlice'

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    transaction: transactionReducer,
    contract: contractReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['wallet/setProvider'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['wallet.provider'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch