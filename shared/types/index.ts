export interface User {
  id: string
  email: string
  name: string
  role: "listener" | "artist" | "admin"
  avatar?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  url: string
  coverUrl: string
  genre: string
  releaseDate: string
  playCount: number
  isLiked?: boolean
}

export interface Playlist {
  id: string
  name: string
  description: string
  coverUrl: string
  tracks: Track[]
  createdBy: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  queue: Track[]
  repeat: "none" | "one" | "all"
  shuffle: boolean
}
