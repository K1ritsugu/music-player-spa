import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Track, PlayerState } from "@/shared/types"
import type { RootState } from "@/shared/store"

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 70,
  currentTime: 0,
  duration: 0,
  queue: [],
  repeat: "none",
  shuffle: false,
}

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload
      state.currentTime = 0
    },
    playTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload
      state.currentTime = 0
      state.isPlaying = true
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload
    },
    addToQueue: (state, action: PayloadAction<Track>) => {
      state.queue.push(action.payload)
      
      if (!state.currentTrack) {
        state.currentTrack = action.payload
        state.isPlaying = true
        state.currentTime = 0
      }
    },
    toggleRepeat: (state) => {
      const modes: PlayerState["repeat"][] = ["none", "one", "all"]
      const currentIndex = modes.indexOf(state.repeat)
      state.repeat = modes[(currentIndex + 1) % modes.length]
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle
    },
    nextTrack: (state) => {
      if (state.queue.length > 0) {
        const currentIndex = state.queue.findIndex((track) => track.id === state.currentTrack?.id)
        const nextIndex = (currentIndex + 1) % state.queue.length
        state.currentTrack = state.queue[nextIndex]
        state.currentTime = 0
      }
    },
    previousTrack: (state) => {
      if (state.queue.length > 0) {
        const currentIndex = state.queue.findIndex((track) => track.id === state.currentTrack?.id)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : state.queue.length - 1
        state.currentTrack = state.queue[prevIndex]
        state.currentTime = 0
      }
    },
  },
})

export const {
  setCurrentTrack,
  playTrack,
  togglePlay,
  setVolume,
  setCurrentTime,
  setDuration,
  setQueue,
  addToQueue,
  toggleRepeat,
  toggleShuffle,
  nextTrack,
  previousTrack,
} = playerSlice.actions

export const selectCurrentTrack = (state: RootState) => state.player.currentTrack
export const selectIsPlaying = (state: RootState) => state.player.isPlaying
export const selectVolume = (state: RootState) => state.player.volume
export const selectCurrentTime = (state: RootState) => state.player.currentTime
export const selectDuration = (state: RootState) => state.player.duration
export const selectQueue = (state: RootState) => state.player.queue
export const selectRepeat = (state: RootState) => state.player.repeat
export const selectShuffle = (state: RootState) => state.player.shuffle
