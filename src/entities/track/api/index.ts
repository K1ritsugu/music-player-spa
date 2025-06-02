import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Track } from "@/shared/types"

export const tracksApi = createApi({
  reducerPath: "tracksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:3002/api/tracks`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Track"],
  endpoints: (builder) => ({
    getTracks: builder.query<Track[], { search?: string; genre?: string }>({
      query: (params) => ({
        url: "",
        params,
      }),
      providesTags: ["Track"],
    }),
    getTrackById: builder.query<Track, string>({
      query: (id) => `/${id}`,
      providesTags: ["Track"],
    }),
    getFavoriteTracks: builder.query<Track[], void>({
      query: () => "/favoriteTracks",
      providesTags: ["Track"],
    }),
    getRecommendations: builder.query<Track[], void>({
      query: () => "/recommendations",
      providesTags: ["Track"],
    }),
    addToFavorites: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/favorites/${trackId}`,
        method: "POST",
      }),
      invalidatesTags: ["Track"],
    }),
    removeFromFavorites: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/favorites/${trackId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Track"],
    }),
    toggleFavorite: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/favorites/${trackId}/toggle`,
        method: "POST",
      }),
      invalidatesTags: ["Track"],
    }),
    createTrack: builder.mutation<Track, Partial<Track>>({
      query: (track) => ({
        url: "",
        method: "POST",
        body: track,
      }),
      invalidatesTags: ["Track"],
    }),
    deleteTrack: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/${trackId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Track"],
    }),
    getUserTracks: builder.query<Track[], void>({
      query: () => "/my",
      providesTags: ["Track"],
    }),
  }),
})

export const { 
  useGetTracksQuery,
  useGetTrackByIdQuery,
  useGetFavoriteTracksQuery,
  useGetRecommendationsQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useToggleFavoriteMutation,
  useCreateTrackMutation,
  useDeleteTrackMutation,
  useGetUserTracksQuery
} = tracksApi
