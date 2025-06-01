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
        <Sidebar onClose={() => {}} />
        <Box sx={{ flexGrow: 1, p: 3, ml: "240px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    )
  }

  if (!playlist) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar onClose={() => {}} />
        <Box sx={{ flexGrow: 1, p: 3, ml: "240px" }}>
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
      <Sidebar onClose={() => {}} />

      <Box sx={{ flexGrow: 1, p: 3, ml: "240px", pb: "100px" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <IconButton onClick={() => navigate(`/playlists/${playlist.id}`)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ flex: 1 }}>
              Добавить треки в "{playlist.name}"
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddTracks}
              disabled={selectedTracks.length === 0 || isAdding}
            >
              {isAdding ? <CircularProgress size={20} /> : `Добавить (${selectedTracks.length})`}
            </Button>
          </Box>

          {availableTracks.length === 0 ? (
            <Alert severity="info">
              Все доступные треки уже добавлены в этот плейлист
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {availableTracks.map((track) => (
                <Grid item xs={12} key={track.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                      backgroundColor: selectedTracks.includes(track.id) ? "action.selected" : "transparent"
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Checkbox
                          checked={selectedTracks.includes(track.id)}
                          onChange={() => handleTrackToggle(track.id)}
                        />
                        <CardMedia
                          component="img"
                          sx={{ width: 50, height: 50, borderRadius: 1 }}
                          image={track.coverUrl || '/placeholder.jpg'}
                          alt={track.title}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {track.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {track.artist}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
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
