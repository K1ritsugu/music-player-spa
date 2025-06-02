"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack
} from "@mui/material"
import {
  ViewList,
  ViewModule,
  Favorite,
  MusicNote
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { MobileHeader } from "@/widgets/mobile-header"
import { MobileNavigation } from "@/widgets/mobile-navigation"
import { TrackCard } from "@/shared/components/track-card"
import { useGetFavoriteTracksQuery } from "@/entities/track/api"
import { useAppSelector } from "@/shared/hooks"
import { selectCurrentUser } from "@/features/auth"

export default function FavoritesPage() {
  const user = useAppSelector(selectCurrentUser)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const { data: favorites = [], isLoading, error } = useGetFavoriteTracksQuery()

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "grid" | "list"
  ) => {
    if (newView !== null) {
      setViewMode(newView)
    }
  }

  const totalDuration = favorites.reduce((acc, track) => acc + track.duration, 0)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`
    }
    return `${minutes} мин`
  }
  return (
    <Box sx={{ display: "flex" }}>
      <MobileHeader />
      <Sidebar onClose={() => {}} />

      <Box sx={{ 
        flexGrow: 1,        p: { xs: 2, sm: 3 }, 
        ml: { xs: 0, md: "240px" }, 
        pt: { xs: 2, md: 3 }, // Reduced top padding since no mobile header
        pb: { xs: "340px", md: "100px" } // Increased bottom padding for player + mobile nav
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: "primary.main",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Favorite sx={{ color: "white", fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Любимые треки
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user?.name}
                </Typography>
              </Box>
            </Stack>

            {/* Stats */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Chip
                icon={<MusicNote />}
                label={`${favorites.length} треков`}
                variant="outlined"
              />
              {favorites.length > 0 && (
                <Chip
                  label={formatDuration(totalDuration)}
                  variant="outlined"
                />
              )}
            </Stack>

            {/* View Toggle */}
            {favorites.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewChange}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <ViewModule />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
          </Box>

          {/* Content */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Ошибка при загрузке любимых треков
            </Alert>
          )}

          {!isLoading && favorites.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: "grey.100",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3
                }}
              >
                <Favorite sx={{ fontSize: 60, color: "grey.400" }} />
              </Box>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                У вас пока нет любимых треков
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Нажмите на сердечко рядом с треком, чтобы добавить его в любимые
              </Typography>
            </Box>
          )}

          {!isLoading && favorites.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <Grid container spacing={3}>
                  {favorites.map((track) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                      <TrackCard track={track} />
                    </Grid>
                  ))}
                </Grid>
              ) : (                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 1,
                  width: "100%",
                  overflow: "hidden"
                }}>
                  {favorites.map((track, index) => (
                    <TrackCard 
                      key={track.id} 
                      track={track} 
                      variant="compact"
                      showIndex={index + 1}
                    />
                  ))}
                </Box>
              )}
            </>
          )}        </Container>
      </Box>
      <MobileNavigation />
    </Box>
  )
}
