import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeType } from '../../ui/themes'

interface SettingsState {
  theme: ThemeType
  showSettingsButton: boolean
}

const initialState: SettingsState = {
  theme: 'light',
  showSettingsButton: true,
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
  },
})

export const { setTheme, toggleSettingsButton } = settingsSlice.actions
export default settingsSlice.reducer