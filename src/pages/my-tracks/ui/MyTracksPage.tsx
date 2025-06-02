"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
  IconButton,
  Card,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material"
import {
  ArrowBack,
  Add,
  PlayArrow,
  Pause,
  MoreVert,
  Edit,
  Delete,
  Share,
  Download,
  QueueMusic
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { MobileHeader } from "@/widgets/mobile-header"
import { MobileNavigation } from "@/widgets/mobile-navigation"
import { TrackCard } from "@/shared/components/track-card"
import { useGetUserTracksQuery } from "@/entities/track/api"
import { useAppSelector, useAppDispatch } from "@/shared/hooks"
import { selectCurrentUser } from "@/features/auth"
import { selectCurrentTrack, selectIsPlaying } from "@/features/player/model"
import { setQueue, playTrack, togglePlay, addToQueue } from "@/features/player/model"
import type { Track } from "@/shared/types"

export default function MyTracksPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)
  
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [selectedTrack, setSelectedTrack] = React.useState<Track | null>(null)

  const { data: tracks = [], isLoading, error } = useGetUserTracksQuery()

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(setQueue(tracks))
      dispatch(playTrack(tracks[0]))
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, track: Track) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
    setSelectedTrack(track)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedTrack(null)
  }

  const handleAddToQueue = () => {
    if (selectedTrack) {
      dispatch(addToQueue(selectedTrack))
      handleMenuClose()
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTotalDuration = () => {
    const total = tracks.reduce((sum, track) => sum + track.duration, 0)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`
    }
    return `${minutes} мин`
  }
  if (isLoading) {    return (
      <Box sx={{ display: "flex" }}>
        <MobileHeader />
        <Sidebar onClose={() => {}} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          ml: { xs: 0, md: "240px" }, 
          pt: { xs: 2, md: 3 } 
        }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    )
  }
  if (error) {
    return (      <Box sx={{ display: "flex" }}>
        <MobileHeader />
        <Sidebar onClose={() => {}} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          ml: { xs: 0, md: "240px" }, 
          pt: { xs: 2, md: 3 } 
        }}>
          <Container maxWidth="lg">
            <Alert severity="error" sx={{ mt: 2 }}>
              Ошибка при загрузке треков
            </Alert>
          </Container>
        </Box>
      </Box>
    )
  }  return (
    <Box sx={{ display: "flex" }}>
      <MobileHeader />
      <Sidebar onClose={() => {}} />      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3 }, 
        ml: { xs: 0, md: "240px" }, 
        pt: { xs: 2, md: 3 }, 
        pb: { xs: "340px", md: "100px" } // Increased padding for mobile to make space for player + navigation
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/dashboard")}
              sx={{ mb: 2 }}
            >
              Назад к главной
            </Button>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Мои треки
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {tracks.length} {tracks.length === 1 ? 'трек' : tracks.length < 5 ? 'трека' : 'треков'}
                  {tracks.length > 0 && ` • ${getTotalDuration()}`}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/upload")}
                >
                  Добавить трек
                </Button>
                {tracks.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={isPlaying && currentTrack && tracks.some(t => t.id === currentTrack.id) ? <Pause /> : <PlayArrow />}
                    onClick={handlePlayAll}
                  >
                    {isPlaying && currentTrack && tracks.some(t => t.id === currentTrack.id) ? 'Пауза' : 'Воспроизвести все'}
                  </Button>
                )}
              </Stack>
            </Stack>

            {tracks.length === 0 ? (
              <Card sx={{ textAlign: "center", py: 6 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    У вас пока нет загруженных треков
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Начните делиться своей музыкой с миром!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/upload")}
                  >
                    Загрузить первый трек
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {tracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                    <Box sx={{ position: "relative" }}>
                      <TrackCard track={track} />
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                          },
                        }}
                        onClick={(e) => handleMenuOpen(e, track)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Statistics */}
          {tracks.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" gutterBottom>
                Статистика
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {tracks.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Всего треков
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {tracks.reduce((sum, track) => sum + (track.playCount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Всего прослушиваний
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {new Set(tracks.map(track => track.genre)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Жанров
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Menu for track actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAddToQueue}>
          <ListItemIcon>
            <QueueMusic fontSize="small" />
          </ListItemIcon>
          <ListItemText>Добавить в очередь</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Поделиться</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>      </Menu>
      <MobileNavigation />
    </Box>
  )
}
