"use client"

import { useState } from "react"
import { Box, Typography, Container, Button, Avatar, TextField, Paper, Stack, Alert } from "@mui/material"
import { ExitToApp, CloudUpload, Save } from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { useAppSelector, useAppDispatch } from "@/shared/hooks"
import { selectCurrentUser, performLogout } from "@/features/auth"
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const [name, setName] = useState(user?.name || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const handleLogout = () => {
    dispatch(performLogout())
    navigate("/login", { replace: true })
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(false)
    
    try {
      let avatarUrl = user.avatarUrl
      
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        
        const response = await fetch('http://localhost:3002/api/upload/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          avatarUrl = data.url
        } else {
          throw new Error('Ошибка загрузки аватара')
        }
      }
      
      // Обновляем профиль
      const updateResponse = await fetch('http://localhost:3002/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          avatarUrl
        })
      })
      
      if (updateResponse.ok) {
        setUpdateSuccess(true)
        setAvatarFile(null)
        setAvatarPreview(null)
        // Здесь можно обновить store, но пока просто показываем успех
      } else {
        throw new Error('Ошибка обновления профиля')
      }
      
    } catch (error) {
      setUpdateError('Произошла ошибка при обновлении профиля')
      console.error('Update profile error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar onClose={() => {}} />

      <Box sx={{ flexGrow: 1, p: 3, ml: "240px", pb: "100px" }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Профиль
          </Typography>

          {updateSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Профиль успешно обновлен!
            </Alert>
          )}

          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {updateError}
            </Alert>
          )}

          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack spacing={3}>
              {/* Аватар */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={avatarPreview || user?.avatarUrl}
                  sx={{ width: 120, height: 120 }}
                />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Аватар
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                    >
                      Загрузить аватар
                    </Button>
                  </label>
                </Box>
              </Box>

              {/* Основная информация */}
              <TextField
                fullWidth
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Email"
                value={user?.email || ""}
                variant="outlined"
                disabled
                helperText="Email нельзя изменить"
              />

              {/* Кнопки */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Сохранение..." : "Сохранить изменения"}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ExitToApp />}
                  onClick={handleLogout}
                >
                  Выйти из аккаунта
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}
