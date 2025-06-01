"use client"

import React, { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  IconButton
} from "@mui/material"
import {
  CloudUpload,
  MusicNote,
  ArrowBack,
  Save,
  Image as ImageIcon,
  AudioFile,
  Delete as DeleteIcon,
  PlayArrow
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { useCreateTrackMutation } from "@/entities/track/api"
import type { Track } from "@/shared/types"

const genres = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Indie",
  "Alternative",
  "Metal",
  "Folk",
  "Reggae",
  "Blues",
  "Funk",
  "Other"
]

interface FileUploadZoneProps {
  accept: string
  onFileSelect: (file: File) => void
  file: File | null
  title: string
  description: string
  icon: React.ReactNode
  maxSize?: number
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  onFileSelect,
  file,
  title,
  description,
  icon,
  maxSize = 50 * 1024 * 1024 // 50MB по умолчанию
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`
    }
    
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })
    
    if (!isValidType) {
      return `Неподдерживаемый тип файла. Поддерживаются: ${accept}`
    }
    
    return null
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      const validationError = validateFile(file)
      
      if (validationError) {
        setError(validationError)
      } else {
        onFileSelect(file)
      }
    }
  }, [onFileSelect, accept, maxSize])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const validationError = validateFile(file)
      
      if (validationError) {
        setError(validationError)
      } else {
        setError(null)
        onFileSelect(file)
      }
    }
  }, [onFileSelect, accept, maxSize])

  const handleRemoveFile = () => {
    setError(null)
    onFileSelect(null as any)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id={`file-input-${title.replace(/\s+/g, '-').toLowerCase()}`}
      />
      
      {!file ? (
        <label htmlFor={`file-input-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          <Paper
            elevation={dragOver ? 4 : 1}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              border: dragOver ? '2px dashed' : '2px dashed transparent',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main'
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Box sx={{ mb: 2, color: dragOver ? 'primary.main' : 'text.secondary' }}>
              {icon}
            </Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Перетащите файл сюда или нажмите для выбора
            </Typography>
          </Paper>
        </label>
      ) : (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {icon}
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {accept.includes('audio') && (
                <IconButton size="small" color="primary">
                  <PlayArrow />
                </IconButton>
              )}
              <IconButton size="small" color="error" onClick={handleRemoveFile}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default function UploadTrackPage() {
  const navigate = useNavigate()
  const [createTrack, { isLoading, error }] = useCreateTrackMutation()

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    duration: "",
    releaseDate: new Date().toISOString().split('T')[0]
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleGenreChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      genre: event.target.value
    }))
  }

  const formatDuration = (timeStr: string): number => {
    // Если введено в формате mm:ss, конвертируем в секунды
    if (timeStr.includes(':')) {
      const [minutes, seconds] = timeStr.split(':').map(Number)
      return (minutes || 0) * 60 + (seconds || 0)
    }
    // Иначе считаем что это уже секунды
    return parseInt(timeStr) || 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!formData.title || !formData.artist || !audioFile) {
      return
    }

    try {
      // Загружаем аудиофайл на сервер
      const audioFormData = new FormData()
      audioFormData.append('audio', audioFile)
      
      const audioResponse = await fetch('http://localhost:3002/api/upload/audio', {
        method: 'POST',
        body: audioFormData
      })
      
      if (!audioResponse.ok) {
        throw new Error('Ошибка загрузки аудиофайла')
      }
      
      const audioData = await audioResponse.json()
      const audioUrl = audioData.url

      // Загружаем обложку, если есть
      let coverUrl = "/placeholder.jpg"
      if (coverFile) {
        const coverFormData = new FormData()
        coverFormData.append('image', coverFile)
        
        const coverResponse = await fetch('http://localhost:3002/api/upload/image', {
          method: 'POST',
          body: coverFormData
        })
        
        if (coverResponse.ok) {
          const coverData = await coverResponse.json()
          coverUrl = coverData.url
        }
      }

      const trackData: Partial<Track> = {
        title: formData.title,
        artist: formData.artist,
        album: formData.album || "Unknown Album",
        genre: formData.genre || "Unknown",
        duration: formatDuration(formData.duration),
        url: audioUrl,
        coverUrl: coverUrl,
        releaseDate: formData.releaseDate
      }

      await createTrack(trackData).unwrap()
      setSuccess(true)
      
      // Очищаем форму после успешного создания
      setTimeout(() => {
        setFormData({
          title: "",
          artist: "",
          album: "",
          genre: "",
          duration: "",
          releaseDate: new Date().toISOString().split('T')[0]
        })
        setAudioFile(null)
        setCoverFile(null)
        setSuccess(false)
      }, 2000)

    } catch (err) {
      console.error("Error creating track:", err)
    }
  }
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar onClose={() => {}} />
      
      <Box sx={{ flexGrow: 1, p: 3, ml: "240px", pb: "100px" }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/dashboard")}
              sx={{ mb: 2 }}
            >
              Назад к главной
            </Button>

            <Typography variant="h4" component="h1" gutterBottom>
              Добавить новый трек
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Заполните информацию о треке и загрузите необходимые файлы
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Трек успешно добавлен!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Ошибка при добавлении трека. Попробуйте еще раз.
            </Alert>
          )}

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* Основная информация */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MusicNote />
                    Основная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Название трека"
                    value={formData.title}
                    onChange={handleInputChange("title")}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Исполнитель"
                    value={formData.artist}
                    onChange={handleInputChange("artist")}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Альбом"
                    value={formData.album}
                    onChange={handleInputChange("album")}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Жанр</InputLabel>
                    <Select
                      value={formData.genre}
                      onChange={handleGenreChange}
                      label="Жанр"
                    >
                      {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                          {genre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Длительность (мм:сс или секунды)"
                    value={formData.duration}
                    onChange={handleInputChange("duration")}
                    variant="outlined"
                    placeholder="3:45 или 225"
                    helperText="Введите в формате мм:сс или количество секунд"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Дата релиза"
                    value={formData.releaseDate}
                    onChange={handleInputChange("releaseDate")}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* Загрузка файлов */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <CloudUpload />
                    Загрузка файлов
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Аудиофайл *
                  </Typography>
                  <FileUploadZone
                    accept="audio/*"
                    onFileSelect={setAudioFile}
                    file={audioFile}
                    title="Загрузить аудио"
                    description="Поддерживаются форматы: MP3, WAV, FLAC, OGG"
                    icon={<AudioFile sx={{ fontSize: 48 }} />}
                    maxSize={100 * 1024 * 1024} // 100MB
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Обложка (необязательно)
                  </Typography>
                  <FileUploadZone
                    accept="image/*"
                    onFileSelect={setCoverFile}
                    file={coverFile}
                    title="Загрузить обложку"
                    description="Поддерживаются форматы: JPG, PNG, WEBP"
                    icon={<ImageIcon sx={{ fontSize: 48 }} />}
                    maxSize={10 * 1024 * 1024} // 10MB
                  />
                </Grid>

                {/* Предупреждение об обязательных полях */}
                {(!formData.title || !formData.artist || !audioFile) && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Заполните обязательные поля: название трека, исполнитель и загрузите аудиофайл
                    </Alert>
                  </Grid>
                )}

                {/* Кнопки действий */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                      disabled={isLoading || !formData.title || !formData.artist || !audioFile}
                      sx={{ minWidth: 200 }}
                    >
                      {isLoading ? "Загружается..." : "Добавить трек"}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/dashboard")}
                      disabled={isLoading}
                    >
                      Отмена
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}