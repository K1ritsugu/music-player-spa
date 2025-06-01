import { createSlice } from "@reduxjs/toolkit"
import type { RootState } from "@/shared/store"

interface ThemeState {
  mode: "light" | "dark"
}

const initialState: ThemeState = {
  mode: "dark",
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
  },
})

export const { toggleTheme } = themeSlice.actions

export const selectThemeMode = (state: RootState) => state.theme.mode
