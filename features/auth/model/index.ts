import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/shared/types"
import type { RootState } from "@/shared/store"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: false,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem("token", action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
