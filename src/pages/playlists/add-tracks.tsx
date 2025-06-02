"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  Checkbox,
  CircularProgress,
  Alert,
  Stack
} from "@mui/material"
import { 
  ArrowBack, 
  Add
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { MobileHeader } from "@/widgets/mobile-header"
import { 
  useGetPlaylistByIdQuery, 
  useAddTrackToPlaylistMutation
} from "@/entities/playlist/api"
import { useGetTracksQuery } from "@/entities/track/api"

export default function AddTracksToPlaylistPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])

  const { data: playlist, isLoading: playlistLoading } = useGetPlaylistByIdQuery(id!)
  const { data: tracks = [], isLoading: tracksLoading } = useGetTracksQuery({})
  const [addTrackToPlaylist, { isLoading: isAdding }] = useAddTrackToPlaylistMutation()

  const playlistTrackIds = playlist?.tracks?.map(track => track.id) || []
  const availableTracks = tracks.filter(track => !playlistTrackIds.includes(track.id))

  const handleTrackToggle = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }

  const handleAddTracks = async () => {
    if (!playlist || selectedTracks.length === 0) return

    try {
      for (const trackId of selectedTracks) {
        await addTrackToPlaylist({
          playlistId: playlist.id,
          trackId
        })
      }
      navigate(`/playlists/${playlist.id}`)
    } catch (error) {
      console.error("Error adding tracks to playlist:", error)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (playlistLoading || tracksLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <MobileHeader />
        <Sidebar onClose={() => {}} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          pt: { xs: "64px", md: 1 },
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "50vh" 
        }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (!playlist) {
    return (
      <Box sx={{ display: "flex" }}>
        <MobileHeader />
        <Sidebar onClose={() => {}} />
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          pt: { xs: "64px", md: 1 }
        }}>
          <Container maxWidth="lg">
            <Alert severity="error">
              Плейлист не найден
            </Alert>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex" }}>
      <MobileHeader />
      <Sidebar onClose={() => {}} />

      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3 }, 
        pt: { xs: "64px", md: 1 },
        pb: "100px" 
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: "flex", 
            alignItems: { xs: "flex-start", sm: "center" }, 
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 }
          }}>
            <IconButton 
              onClick={() => navigate(`/playlists/${playlist.id}`)} 
              sx={{ mr: { xs: 0, sm: 2 }, alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h4" 
              sx={{ 
                flex: 1,
                fontSize: { xs: "1.5rem", sm: "2.125rem" }
              }}
            >
              Добавить треки в "{playlist.name}"
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddTracks}
              disabled={selectedTracks.length === 0 || isAdding}
              sx={{ 
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }}
            >
              {isAdding ? <CircularProgress size={20} /> : `Добавить (${selectedTracks.length})`}
            </Button>
          </Box>

          {availableTracks.length === 0 ? (
            <Alert severity="info">
              Все доступные треки уже добавлены в этот плейлист
            </Alert>
          ) : (
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {availableTracks.map((track) => (
                <Grid item xs={12} key={track.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                      backgroundColor: selectedTracks.includes(track.id) ? "action.selected" : "transparent"
                    }}
                  >
                    <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                      <Stack 
                        direction="row" 
                        spacing={{ xs: 1, sm: 2 }} 
                        alignItems="center"
                      >
                        <Checkbox
                          checked={selectedTracks.includes(track.id)}
                          onChange={() => handleTrackToggle(track.id)}
                        />
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: { xs: 40, sm: 50 }, 
                            height: { xs: 40, sm: 50 }, 
                            borderRadius: 1 
                          }}
                          image={track.coverUrl || '/placeholder.jpg'}
                          alt={track.title}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle2" 
                            noWrap
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            {track.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            {track.artist}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {formatDuration(track.duration)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  )
}
