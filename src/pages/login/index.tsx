"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Container, Paper, TextField, Button, Typography, Box, Tab, Tabs, Alert } from "@mui/material"
import { useAppDispatch } from "@/shared/hooks"
import { setCredentials } from "@/features/auth"
import { useLoginMutation, useRegisterMutation } from "@/features/auth/api"

const loginSchema = yup.object({
  email: yup.string().email("Неверный email").required("Email обязателен"),
  password: yup.string().min(6, "Минимум 6 символов").required("Пароль обязателен"),
})

const registerSchema = yup.object({
  name: yup.string().required("Имя обязательно"),
  email: yup.string().email("Неверный email").required("Email обязателен"),
  password: yup.string().min(6, "Минимум 6 символов").required("Пароль обязателен"),
})

interface FormFields {
  email: string
  password: string
  name?: string
}

export default function LoginPage() {
  const [tab, setTab] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    resolver: yupResolver(tab === 0 ? loginSchema : registerSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      setError(null)
      
      if (tab === 0) {
        // Логин
        const result = await login({
          email: data.email,
          password: data.password,
        }).unwrap()
        
        dispatch(setCredentials({ user: result.user, token: result.token }))
        navigate("/dashboard")
      } else {
        // Регистрация
        const result = await register({
          email: data.email,
          password: data.password,
          name: data.name,
        }).unwrap()
        
        dispatch(setCredentials({ user: result.user, token: result.token }))
        navigate("/dashboard")
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setError(error?.data?.error || "Произошла ошибка при аутентификации")
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
    setError(null)
    reset()
  }

  const isLoading = isLoginLoading || isRegisterLoading

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            JerkCl0ud
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Вход" />
            <Tab label="Регистрация" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {tab === 1 && (
              <TextField
                {...registerField("name")}
                label="Имя"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
              />
            )}

            <TextField
              {...registerField("email")}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <TextField
              {...registerField("password")}
              label="Пароль"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
            />

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : (tab === 0 ? "Войти" : "Зарегистрироваться")}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}
