import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/shared/types"
import type { RootState } from "@/shared/store"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Функция для проверки валидности токена
const isTokenValid = (token: string): boolean => {
  if (!token) return false
  
  try {
    // Простая проверка формата токена
    return token.startsWith('mock-token-') && token.length > 11
  } catch {
    return false
  }
}

const getInitialAuthState = (): AuthState => {
  const token = localStorage.getItem("token")
  const userData = localStorage.getItem("user")
  
  let user = null
  let isValid = false
  
  try {
    if (userData && token && isTokenValid(token)) {
      user = JSON.parse(userData)
      isValid = true
    }
  } catch (error) {
    console.error("Failed to parse user data from localStorage:", error)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return {
    user: isValid ? user : null,
    token: isValid ? token : null,
    isAuthenticated: isValid,
    isLoading: false,
  }
}

const initialState: AuthState = getInitialAuthState()

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem("token", action.payload.token)
      localStorage.setItem("user", JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Устанавливаем метку времени выхода
      localStorage.setItem("logoutTimestamp", Date.now().toString())
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    initializeAuth: (state) => {
      // Проверяем, не произошел ли недавно выход из аккаунта
      const logoutTimestamp = localStorage.getItem("logoutTimestamp")
      const now = Date.now()
      
      // Если выход был менее 1 секунды назад, не восстанавливаем сессию
      if (logoutTimestamp && (now - parseInt(logoutTimestamp)) < 1000) {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        return
      }
      
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      
      if (token && userData && isTokenValid(token)) {
        try {
          const user = JSON.parse(userData)
          state.user = user
          state.token = token
          state.isAuthenticated = true
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          state.user = null
          state.token = null
          state.isAuthenticated = false
        }
      } else {
        // Токен невалидный или отсутствует
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        state.user = null
        state.token = null
        state.isAuthenticated = false
      }
    },
  },
})

export const { setCredentials, logout, setLoading, initializeAuth } = authSlice.actions

// Дополнительная функция для полного выхода с очисткой всех кешей
export const performLogout = () => (dispatch: any) => {
  // Сбрасываем состояние аутентификации
  dispatch(logout())
}

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
