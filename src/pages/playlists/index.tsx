"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material"
import { 
  Add, 
  PlayArrow, 
  Delete, 
  Public,
  Lock
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { 
  useGetPlaylistsQuery, 
  useCreatePlaylistMutation, 
  useDeletePlaylistMutation,
  useUpdatePlaylistMutation
} from "@/entities/playlist/api"
import { useAppDispatch } from "@/shared/hooks"
import { setQueue, playTrack } from "@/features/player/model"
import { generatePlaylistCover } from "@/shared/components/playlist-cover-generator"
import type { Playlist } from "@/shared/types"

export default function PlaylistsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)

  const { data: playlists = [], isLoading, error } = useGetPlaylistsQuery()
  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation()
  const [deletePlaylist] = useDeletePlaylistMutation()
  const [updatePlaylist] = useUpdatePlaylistMutation()

  useEffect(() => {
    const updatePlaylistCovers = async () => {
      if (playlists.length === 0) return
      
      for (const playlist of playlists) {
        try {
          // Генерируем обложки для плейлистов с треками
          if (playlist.tracks && playlist.tracks.length > 0) {
            const coverUrl = await generatePlaylistCover(playlist.tracks, playlist.name, 300)
            
            // Обновляем только если обложка отсутствует или является плейсхолдером
            if (!playlist.coverUrl || playlist.coverUrl === '/placeholder.jpg') {
              await updatePlaylist({
                id: playlist.id,
                updates: { coverUrl }
              })
            }
          } 
          // Для пустых плейлистов генерируем обложку только с инициалами
          else if (!playlist.coverUrl || playlist.coverUrl === '/placeholder.jpg') {
            const coverUrl = await generatePlaylistCover([], playlist.name, 300)
            await updatePlaylist({
              id: playlist.id,
              updates: { coverUrl }
            })
          }
        } catch (error) {
          console.error(`Error updating cover for playlist ${playlist.name}:`, error)
        }
      }
    }

    updatePlaylistCovers()
  }, [playlists, updatePlaylist])

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    try {
      // Генерируем обложку для пустого плейлиста
      const generatedCover = await generatePlaylistCover([], newPlaylistName, 300)
      
      await createPlaylist({
        name: newPlaylistName,
        description: newPlaylistDescription,
        isPublic,
        coverUrl: generatedCover
      })
      setCreateDialogOpen(false)
      setNewPlaylistName("")
      setNewPlaylistDescription("")
    } catch (error) {
      console.error("Error creating playlist:", error)
    }
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      dispatch(playTrack(playlist.tracks[0]))
      dispatch(setQueue(playlist.tracks))
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот плейлист?")) {
      await deletePlaylist(playlistId)
    }
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar onClose={() => {}} />

      <Box sx={{ flexGrow: 1, p: 3, ml: "240px", pb: "100px" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h4">
              Мои плейлисты
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Создать плейлист
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Ошибка при загрузке плейлистов
            </Alert>
          )}

          {playlists.length > 0 && (
            <Grid container spacing={3}>
              {playlists.map((playlist) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
                  <Card 
                    sx={{ 
                      height: "100%",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.02)" }
                    }}
                    onClick={() => navigate(`/playlists/${playlist.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={playlist.coverUrl || '/placeholder.jpg'}
                      alt={playlist.name}
                    />
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Typography variant="h6" noWrap>
                          {playlist.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayPlaylist(playlist)
                            }}
                          >
                            <PlayArrow />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePlaylist(playlist.id)
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {playlist.description}
                      </Typography>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          {(playlist.tracks?.length || playlist.trackIds?.length || 0)} треков
                        </Typography>
                        <Chip 
                          size="small"
                          icon={playlist.isPublic ? <Public /> : <Lock />}
                          label={playlist.isPublic ? "Публичный" : "Приватный"}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {!isLoading && playlists.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                У вас пока нет плейлистов
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Создайте свой первый плейлист и добавляйте любимые треки
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                size="large"
              >
                Создать первый плейлист
              </Button>
            </Box>
          )}

          {/* Create Playlist Dialog */}
          <Dialog 
            open={createDialogOpen} 
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Создать новый плейлист</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Название плейлиста"
                fullWidth
                variant="outlined"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Описание (необязательно)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  icon={<Public />}
                  label="Публичный"
                  onClick={() => setIsPublic(true)}
                  color={isPublic ? "primary" : "default"}
                  variant={isPublic ? "filled" : "outlined"}
                />
                <Chip
                  icon={<Lock />}
                  label="Приватный"
                  onClick={() => setIsPublic(false)}
                  color={!isPublic ? "primary" : "default"}
                  variant={!isPublic ? "filled" : "outlined"}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreatePlaylist} 
                variant="contained"
                disabled={!newPlaylistName.trim() || isCreating}
              >
                {isCreating ? <CircularProgress size={20} /> : "Создать"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  )
}
