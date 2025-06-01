"use client"

import type React from "react"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { useGetProfileQuery } from "./api"
import { setCredentials, selectAuthToken } from "./model"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAuthToken)

  const { data: user, isSuccess } = useGetProfileQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (isSuccess && user && token) {
      dispatch(setCredentials({ user, token }))
    }
  }, [isSuccess, user, token, dispatch])

  return <>{children}</>
}

export * from "./model"
export * from "./api"
