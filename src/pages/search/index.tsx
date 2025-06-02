"use client"

import { useState } from "react"
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Grid, 
  Chip,
  CircularProgress,
  Alert
} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { MobileHeader } from "@/widgets/mobile-header"
import { MobileNavigation } from "@/widgets/mobile-navigation"
import { TrackCard } from "@/shared/components/track-card"
import { useGetTracksQuery } from "@/entities/track/api"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  
  const { data: tracks = [], isLoading, error } = useGetTracksQuery({
    search: searchQuery,
    genre: selectedGenre
  })

  const genres = ["Rock", "Pop", "Jazz", "Electronic", "Hip-Hop", "Classical", "Country"]

  const handleGenreToggle = (genre: string) => {
    setSelectedGenre(selectedGenre === genre ? "" : genre)
  }
  return (
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
          <Typography variant="h4" gutterBottom>
            Поиск музыки
          </Typography>

          {/* Search Controls */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Поиск треков, исполнителей, альбомов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Жанры:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    onClick={() => handleGenreToggle(genre)}
                    color={selectedGenre === genre ? "primary" : "default"}
                    variant={selectedGenre === genre ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Ошибка при загрузке треков
            </Alert>
          )}

          {tracks.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Найдено треков: {tracks.length}
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {tracks.map((track) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                    <TrackCard track={track} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {!isLoading && tracks.length === 0 && (searchQuery || selectedGenre) && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
              По вашему запросу ничего не найдено
            </Typography>
          )}        </Container>
      </Box>
      <MobileNavigation />
    </Box>
  )
}
