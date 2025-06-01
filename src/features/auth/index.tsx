"use client"

import type React from "react"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { useGetProfileQuery } from "./api"
import { setCredentials, selectAuthToken, initializeAuth, logout } from "./model"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAuthToken)

  // Инициализируем аутентификацию при загрузке
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  const { data: user, isSuccess, isError, isFetching } = useGetProfileQuery(undefined, {
    skip: !token,
    // Принудительно получаем свежие данные, не используем кеш
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (isSuccess && user && token) {
      dispatch(setCredentials({ user, token }))
    }
  }, [isSuccess, user, token, dispatch])

  // Если токен невалидный, очищаем localStorage и сбрасываем состояние
  useEffect(() => {
    if (isError && token && !isFetching) {
      dispatch(logout())
    }
  }, [isError, token, isFetching, dispatch])

  return <>{children}</>
}

export * from "./model"
export * from "./api"
