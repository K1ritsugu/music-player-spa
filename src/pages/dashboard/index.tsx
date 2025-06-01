import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  Divider,
  Stack
} from "@mui/material"
import { 
  MusicNote, 
  PlaylistPlay, 
  Favorite, 
  TrendingUp 
} from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"
import { TrackCard } from "@/shared/components/track-card"
import { useAppSelector } from "@/shared/hooks"
import { selectCurrentUser } from "@/features/auth"
import { useGetFavoriteTracksQuery, useGetRecommendationsQuery } from "@/entities/track/api"
import { useGetPlaylistsQuery } from "@/entities/playlist/api"

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser)
  
  const { data: favorites = [], isLoading: favoritesLoading } = useGetFavoriteTracksQuery()
  const { data: recommendations = [], isLoading: recommendationsLoading } = useGetRecommendationsQuery()
  const { data: playlists = [], isLoading: playlistsLoading } = useGetPlaylistsQuery()

  const stats = [
    {
      title: "Любимые треки",
      value: favorites.length,
      icon: <Favorite color="primary" />,
      color: "#f44336"
    },
    {
      title: "Мои плейлисты", 
      value: playlists.length,
      icon: <PlaylistPlay color="primary" />,
      color: "#2196f3"
    },
    {
      title: "Часов прослушано",
      value: "42.5", // Mock data
      icon: <MusicNote color="primary" />,
      color: "#4caf50"
    },
    {
      title: "Открытий новой музыки",
      value: recommendations.length,
      icon: <TrendingUp color="primary" />,
      color: "#ff9800"
    }
  ]

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar onClose={() => {}} />

      <Box sx={{ flexGrow: 1, p: 3, ml: "240px", pb: "100px" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Добро пожаловать, {user?.name}!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {user?.role === "artist" ? "Управляйте своей музыкой и треками" : 
             user?.role === "admin" ? "Панель администратора" :
             "Откройте для себя новую музыку"}
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box 
                        sx={{ 
                          p: 1, 
                          borderRadius: 2, 
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h5" component="div">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Favorites Section */}
          {favoritesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : favorites.length > 0 ? (
            <>
              <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Ваши любимые треки
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {favorites.slice(0, 4).map((track) => (
                  <Grid item xs={12} sm={6} md={3} key={track.id}>
                    <TrackCard track={track} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : null}
          {recommendationsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : recommendations.length > 0 ? (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" gutterBottom>
                Рекомендации для вас
              </Typography>
              <Grid container spacing={2}>
                {recommendations.slice(0, 4).map((track) => (
                  <Grid item xs={12} sm={6} md={3} key={track.id}>
                    <TrackCard track={track} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : null}
          {user?.role === "artist" && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" gutterBottom>
                Панель исполнителя
              </Typography>
              <Alert severity="info">
                Здесь вы сможете управлять своими треками, просматривать статистику и взаимодействовать с фанатами
              </Alert>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h5" gutterBottom>
                Панель администратора
              </Typography>
              <Alert severity="warning">
                Административные функции: управление пользователями, модерация контента, системная аналитика
              </Alert>
            </>
          )}
        </Container>
      </Box>
    </Box>
  )
}
