import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { CircularProgress, Box } from "@mui/material"
import { useAppSelector } from "@/shared/hooks"
import { selectIsAuthenticated } from "@/features/auth"

// Lazy loading компонентов
const LoginPage = lazy(() => import("@/pages/login"))
const DashboardPage = lazy(() => import("@/pages/dashboard"))
const PlaylistsPage = lazy(() => import("@/pages/playlists"))
const CreatePlaylistPage = lazy(() => import("@/pages/playlists/create"))
const PlaylistDetailPage = lazy(() => import("@/pages/playlists/[id]"))
const SearchPage = lazy(() => import("@/pages/search"))
const ProfilePage = lazy(() => import("@/pages/profile"))

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/create"
          element={
            <ProtectedRoute>
              <CreatePlaylistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
