import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '@/shared/types'
import { API_URL } from '@/shared/config'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  name: string
}

interface LoginResponse {
  user: User
  token: string
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/auth`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// Обертка для обработки ошибок авторизации
const baseQueryWithAuth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Если получили 401, очищаем авторизацию
  if (result.error && result.error.status === 401) {
    // Очищаем localStorage при ошибке авторизации
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
  
  return result
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => "/profile",
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApi
