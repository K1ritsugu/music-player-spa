import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "@/features/auth/api"
import { tracksApi } from "@/entities/track/api"
import { playlistsApi } from "@/entities/playlist/api"
import { authSlice } from "@/features/auth/model"
import { playerSlice } from "@/features/player/model"
import { themeSlice } from "@/features/theme/model"

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    player: playerSlice.reducer,
    theme: themeSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [tracksApi.reducerPath]: tracksApi.reducer,
    [playlistsApi.reducerPath]: playlistsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, tracksApi.middleware, playlistsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
