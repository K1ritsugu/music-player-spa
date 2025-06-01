import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Track } from "@/shared/types"

export const tracksApi = createApi({
  reducerPath: "tracksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/tracks",
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
      query: () => "/favorites",
      providesTags: ["Track"],
    }),
    toggleFavorite: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/favorites/${trackId}`,
        method: "POST",
      }),
      invalidatesTags: ["Track"],
    }),
    getRecommendations: builder.query<Track[], void>({
      query: () => "/recommendations",
      providesTags: ["Track"],
    }),
  }),
})

export const {
  useGetTracksQuery,
  useGetTrackByIdQuery,
  useGetFavoriteTracksQuery,
  useToggleFavoriteMutation,
  useGetRecommendationsQuery,
} = tracksApi
