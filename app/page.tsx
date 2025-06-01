"use client"

import { Provider } from "react-redux"
import { ThemeProvider, CssBaseline } from "@mui/material"
import { BrowserRouter } from "react-router-dom"
import { store } from "@/shared/store"
import { theme } from "@/shared/theme"
import { AppRouter } from "@/app/router"
import { PlayerWidget } from "@/widgets/player"
import { AuthProvider } from "@/features/auth"
import { Box } from "@mui/material"

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Box sx={{ flex: 1 }}>
                <AppRouter />
              </Box>
              <PlayerWidget />
            </Box>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
