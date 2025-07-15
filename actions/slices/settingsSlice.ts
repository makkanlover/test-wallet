import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeType } from '../../ui/themes'

interface SettingsState {
  theme: ThemeType
  showSettingsButton: boolean
  gasBufferMultiplier: number
}

const initialState: SettingsState = {
  theme: 'light',
  showSettingsButton: true,
  gasBufferMultiplier: 1.2, // デフォルト20%のバッファ
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload
    },
    toggleSettingsButton: (state) => {
      state.showSettingsButton = !state.showSettingsButton
    },
    setGasBufferMultiplier: (state, action: PayloadAction<number>) => {
      // 1.0から3.0の範囲に制限
      const multiplier = Math.max(1.0, Math.min(3.0, action.payload))
      state.gasBufferMultiplier = multiplier
    },
  },
})

export const { setTheme, toggleSettingsButton, setGasBufferMultiplier } = settingsSlice.actions
export default settingsSlice.reducer