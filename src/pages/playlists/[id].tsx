"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card,
  CardMedia,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material"
import { 
  ArrowBack, 
  PlayArrow,
  Pause,
  MoreVert, 
  Edit,
  Delete,
  Add,
  Public,
  Lock,
  Share,
  QueueMusic
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { MobileHeader } from "@/widgets/mobile-header"
import { MobileNavigation } from "@/widgets/mobile-navigation"
import { 
  useGetPlaylistByIdQuery,
  useUpdatePlaylistMutation, 
  useDeletePlaylistMutation,
  useRemoveTrackFromPlaylistMutation
} from "@/entities/playlist/api"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { setQueue, togglePlay, playTrack, addToQueue } from "@/features/player/model"
import { selectCurrentTrack, selectIsPlaying } from "@/features/player/model"
import { generatePlaylistCover } from "@/shared/components/playlist-cover-generator"

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [trackMenuAnchor, setTrackMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editIsPublic, setEditIsPublic] = useState(true)
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState<string | null>(null)

  const { data: playlist, isLoading, error } = useGetPlaylistByIdQuery(id!)
  const [updatePlaylist, { isLoading: isUpdating }] = useUpdatePlaylistMutation()
  const [deletePlaylist] = useDeletePlaylistMutation()
  const [removeTrackFromPlaylist] = useRemoveTrackFromPlaylistMutation()

  useEffect(() => {
    const regenerateCover = async () => {
      if (!playlist) return;
      
      try {
        if (playlist.tracks && playlist.tracks.length > 0) {
          const coverUrl = await generatePlaylistCover(playlist.tracks, playlist.name, 300)
          setGeneratedCoverUrl(coverUrl)
          
          if (!playlist.coverUrl || playlist.coverUrl === '/placeholder.jpg' || coverUrl !== playlist.coverUrl) {
            await updatePlaylist({
              id: playlist.id,
              updates: {
                coverUrl: coverUrl
              }
            })
          }
        } else {
          const coverUrl = await generatePlaylistCover([], playlist.name, 300)
          setGeneratedCoverUrl(coverUrl)
          
          if (!playlist.coverUrl || playlist.coverUrl === '/placeholder.jpg' || coverUrl !== playlist.coverUrl) {
            await updatePlaylist({
              id: playlist.id,
              updates: {
                coverUrl: coverUrl
              }
            })
          }
        }
      } catch (error) {
        console.error("Error generating playlist cover:", error)
      }
    }

    regenerateCover()
  }, [playlist, updatePlaylist])

  const isCurrentPlaylist = playlist?.tracks?.some(track => track.id === currentTrack?.id) && isPlaying

  const handlePlayPlaylist = () => {
    if (isCurrentPlaylist) {
      dispatch(togglePlay())
    } else if (playlist?.tracks && playlist.tracks.length > 0) {
      dispatch(playTrack(playlist.tracks[0]))
      dispatch(setQueue(playlist.tracks))
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleEditOpen = () => {
    if (playlist) {
      setEditName(playlist.name)
      setEditDescription(playlist.description || "")
      setEditIsPublic(playlist.isPublic)
      setEditDialogOpen(true)
    }
    handleMenuClose()
  }

  const handleEditSave = async () => {
    try {
      await updatePlaylist({
        id: playlist.id,
        updates: {
          name: editName,
          description: editDescription,
          isPublic: editIsPublic
        }
      })
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating playlist:", error)
    }
  }

  const handleDeletePlaylist = async () => {
    if (!playlist) return
    if (window.confirm(`Вы уверены, что хотите удалить плейлист "${playlist.name}"?`)) {
      try {
        await deletePlaylist(playlist.id)
        navigate("/playlists")
      } catch (error) {
        console.error("Error deleting playlist:", error)
      }
    }
    handleMenuClose()
  }

  const handleTrackMenuOpen = (event: React.MouseEvent<HTMLElement>, trackId: string) => {
    setTrackMenuAnchor(event.currentTarget)
    setSelectedTrackId(trackId)
    event.stopPropagation()
  }

  const handleTrackMenuClose = () => {
    setTrackMenuAnchor(null)
    setSelectedTrackId(null)
  }
  const handleRemoveTrack = async () => {
    try {
      if (!selectedTrackId || !playlist) return
      
      await removeTrackFromPlaylist({
        playlistId: playlist.id,
        trackId: selectedTrackId
      })
      handleTrackMenuClose()
    } catch (error) {
      console.error("Error removing track:", error)
    }
  }

  const handleAddToQueue = () => {
    if (!selectedTrackId || !playlist) return
    
    const track = playlist.tracks?.find(t => t.id === selectedTrackId)
    if (track) {
      dispatch(addToQueue(track))
      handleTrackMenuClose()
    }
  }

  const handlePlayTrack = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    if (playlist?.tracks) {
      dispatch(playTrack(playlist.tracks[index]))
      dispatch(setQueue(playlist.tracks.slice(index)))
    }
  }

  // Вычисляемые значения
  const totalDuration = playlist?.tracks?.reduce((acc, track) => acc + (track.duration || 0), 0) || 0
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  // Рендеринг
  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <CircularProgress />
    </Box>
  )

  if (error) return (
    <Alert severity="error" sx={{ mt: 2 }}>
      Ошибка при загрузке плейлиста
    </Alert>
  )

  if (!playlist) return (
    <Alert severity="info" sx={{ mt: 2 }}>
      Плейлист не найден
    </Alert>
  );
  return (
    <Box sx={{ display: "flex" }}>
      <MobileHeader />
      <Sidebar onClose={() => {}} />

      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3 }, 
        ml: { xs: 0, md: "240px" }, 
        pt: { xs: 2, md: 3 }, 
        pb: { xs: "340px", md: "100px" }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/playlists")}
              sx={{ mb: 2 }}
            >
              Назад к плейлистам
            </Button>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4} md={3}>
                <Card elevation={3} sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={playlist.coverUrl || '/placeholder.jpg'}
                    alt={playlist.name}
                    sx={{ 
                      height: "100%",
                      minHeight: "280px",
                      borderRadius: 1,
                      boxShadow: 3
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: "rgba(0,0,0,0.3)"
                      }
                    }}
                  >
                    <IconButton
                      size="large"
                      sx={{ 
                        backgroundColor: "rgba(0,0,0,0.6)", 
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" }
                      }}
                      onClick={handlePlayPlaylist}
                    >
                      {isCurrentPlaylist ? <Pause sx={{ fontSize: 40 }} /> : <PlayArrow sx={{ fontSize: 40 }} />}
                    </IconButton>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} sm={8} md={9}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ПЛЕЙЛИСТ
                      </Typography>
                      <Chip 
                        size="small"
                        icon={playlist.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                        label={playlist.isPublic ? "Публичный" : "Приватный"}
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    </Box>
                    
                    <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
                      {playlist.name}
                    </Typography>
                    
                    {playlist.description && (
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {playlist.description}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {playlist.tracks?.length || 0} треков
                      </Typography>
                      {playlist.tracks && playlist.tracks.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          • {Math.floor(totalDuration / 60)} мин {totalDuration % 60} сек
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box>
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleEditOpen}>
                        <Edit sx={{ mr: 1, fontSize: 18 }} /> Редактировать
                      </MenuItem>
                      <MenuItem onClick={handleDeletePlaylist}>
                        <Delete sx={{ mr: 1, fontSize: 18 }} /> Удалить
                      </MenuItem>
                      {playlist.isPublic && (
                        <MenuItem onClick={handleMenuClose}>
                          <Share sx={{ mr: 1, fontSize: 18 }} /> Поделиться
                        </MenuItem>
                      )}
                    </Menu>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ my: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={isCurrentPlaylist ? <Pause /> : <PlayArrow />}
              onClick={handlePlayPlaylist}
              disabled={!playlist.tracks || playlist.tracks.length === 0}
              sx={{ borderRadius: 28, px: 3 }}
            >
              {isCurrentPlaylist ? "Пауза" : "Воспроизвести"}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => navigate(`/playlists/${playlist.id}/add-tracks`)}
              sx={{ borderRadius: 28, px: 3 }}
            >
              Добавить треки
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            {playlist.tracks && playlist.tracks.length > 0 ? (
              <Box sx={{ width: "100%" }}>                <Box sx={{ 
                  py: 1, 
                  px: 2, 
                  display: "flex", 
                  borderBottom: 1, 
                  borderColor: "divider",
                  overflowX: "auto",
                  width: "100%"
                }}>
                  <Box sx={{ width: 30, mr: 1, minWidth: 30 }}>#</Box>
                  <Box sx={{ flexGrow: 1, minWidth: 100 }}>НАЗВАНИЕ</Box>
                  <Box sx={{ width: 120, display: { xs: "none", sm: "block" } }}>АЛЬБОМ</Box>
                  <Box sx={{ width: 80, textAlign: "right", minWidth: 60 }}>ВРЕМЯ</Box>
                  <Box sx={{ width: 40, minWidth: 40 }}></Box>
                </Box>

                {playlist.tracks.map((track, index) => (                  <Box 
                    key={track.id} 
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      display: "flex", 
                      alignItems: "center", 
                      borderBottom: 1, 
                      borderColor: "divider",
                      bgcolor: track.id === currentTrack?.id ? "action.selected" : "transparent",
                      "&:hover": { 
                        bgcolor: "action.hover",
                        "& .play-icon": { opacity: 1 },
                        "& .track-number": { opacity: 0 }
                      },
                      cursor: "pointer",
                      overflowX: "auto",
                      width: "100%"
                    }}
                    onClick={(event) => {
                      // Не воспроизводить трек, если клик был по меню или кнопке с тремя точками
                      if ((event.target as HTMLElement).closest('.track-menu-button')) {
                        return;
                      }
                      handlePlayTrack(event, index);
                    }}
                  >                    <Box sx={{ width: 30, mr: 1, position: "relative", minWidth: 30 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        className="track-number"
                        sx={{ 
                          opacity: track.id === currentTrack?.id ? 0 : 1,
                          transition: "opacity 0.2s"
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <PlayArrow 
                        className="play-icon"
                        sx={{ 
                          position: "absolute", 
                          left: -8, 
                          top: -10, 
                          opacity: track.id === currentTrack?.id ? 1 : 0,
                          transition: "opacity 0.2s"
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, mr: 1, minWidth: 100, overflow: "hidden" }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 40, height: 40, mr: 2, borderRadius: 1, flexShrink: 0 }}
                        image={track.coverUrl || '/placeholder.jpg'}
                        alt={track.title}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" noWrap sx={{ color: track.id === currentTrack?.id ? "primary.main" : "text.primary" }}>
                          {track.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {track.artist}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: 120, display: { xs: "none", sm: "block" } }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {track.album}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 80, textAlign: "right", minWidth: 60 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(track.duration)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 40, textAlign: "right", minWidth: 40 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackMenuOpen(e, track.id);
                        }}
                        className="track-menu-button"
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                  <Menu
                    anchorEl={trackMenuAnchor}
                    open={Boolean(trackMenuAnchor)}
                    onClose={handleTrackMenuClose}
                  >
                    <MenuItem onClick={handleAddToQueue}>
                      <QueueMusic sx={{ mr: 1, fontSize: 18 }} /> Добавить в очередь
                    </MenuItem>
                    <MenuItem onClick={handleRemoveTrack}>
                      <Delete sx={{ mr: 1, fontSize: 18 }} /> Удалить из плейлиста
                    </MenuItem>
                  </Menu>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8, px: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  В этом плейлисте пока нет треков
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Добавьте треки, чтобы начать слушать музыку
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate(`/playlists/${playlist.id}/add-tracks`)}
                >
                  Добавить треки
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Edit Playlist Dialog */}
          <Dialog 
            open={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Редактировать плейлист</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Название плейлиста"
                fullWidth
                variant="outlined"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Описание (необязательно)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  icon={<Public />}
                  label="Публичный"
                  onClick={() => setEditIsPublic(true)}
                  color={editIsPublic ? "primary" : "default"}
                  variant={editIsPublic ? "filled" : "outlined"}
                />
                <Chip
                  icon={<Lock />}
                  label="Приватный"
                  onClick={() => setEditIsPublic(false)}
                  color={!editIsPublic ? "primary" : "default"}
                  variant={!editIsPublic ? "filled" : "outlined"}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleEditSave} 
                variant="contained"
                disabled={!editName.trim() || isUpdating}
              >
                {isUpdating ? <CircularProgress size={20} /> : "Сохранить"}
              </Button>
            </DialogActions>          </Dialog>
        </Container>
      </Box>
      <MobileNavigation />
    </Box>
  )
}
