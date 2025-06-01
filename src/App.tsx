import { Provider } from "react-redux"
import { ThemeProvider, CssBaseline } from "@mui/material"
import { BrowserRouter, useLocation } from "react-router-dom"
import { store } from "@/shared/store"
import { getTheme } from "@/shared/theme"
import { AppRouter } from "@/app/router"
import { PlayerWidget } from "@/widgets/player"
import { AuthProvider } from "@/features/auth"
import { useAppSelector } from "@/shared/hooks"
import { selectThemeMode } from "@/features/theme"
import { Box } from "@mui/material"

function AppContent() {
  const themeMode = useAppSelector(selectThemeMode)
  const theme = getTheme(themeMode)
  const location = useLocation()
  
  // Скрыть плеер на странице логина
  const shouldHidePlayer = location.pathname === "/login"

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Box sx={{ flex: 1 }}>
            <AppRouter />
          </Box>
          {!shouldHidePlayer && <PlayerWidget />}
        </Box>
      </AuthProvider>
    </ThemeProvider>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  )
}

export default App
