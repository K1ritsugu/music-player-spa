import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/shared/store"

interface ThemeState {
  mode: "light" | "dark"
}

const initialState: ThemeState = {
  mode: (localStorage.getItem("theme") as "light" | "dark") || "dark",
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light"
      localStorage.setItem("theme", state.mode)
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload
      localStorage.setItem("theme", state.mode)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export const selectThemeMode = (state: RootState) => state.theme.mode
