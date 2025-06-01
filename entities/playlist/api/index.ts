import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Playlist } from "@/shared/types"

export const playlistsApi = createApi({
  reducerPath: "playlistsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/playlists",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Playlist"],
  endpoints: (builder) => ({
    getPlaylists: builder.query<Playlist[], void>({
      query: () => "",
      providesTags: ["Playlist"],
    }),
    getPlaylistById: builder.query<Playlist, string>({
      query: (id) => `/${id}`,
      providesTags: ["Playlist"],
    }),
    createPlaylist: builder.mutation<Playlist, Partial<Playlist>>({
      query: (playlist) => ({
        url: "",
        method: "POST",
        body: playlist,
      }),
      invalidatesTags: ["Playlist"],
    }),
    updatePlaylist: builder.mutation<Playlist, { id: string; updates: Partial<Playlist> }>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Playlist"],
    }),
    deletePlaylist: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playlist"],
    }),
    addTrackToPlaylist: builder.mutation<void, { playlistId: string; trackId: string }>({
      query: ({ playlistId, trackId }) => ({
        url: `/${playlistId}/tracks`,
        method: "POST",
        body: { trackId },
      }),
      invalidatesTags: ["Playlist"],
    }),
  }),
})

export const {
  useGetPlaylistsQuery,
  useGetPlaylistByIdQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddTrackToPlaylistMutation,
} = playlistsApi
