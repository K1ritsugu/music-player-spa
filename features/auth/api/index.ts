import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { User } from "@/shared/types"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, LoginRequest & { name: string }>({
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
