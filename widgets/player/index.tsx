"use client"

import { useRef, useEffect, useState } from "react"
import { Box, Card, CardMedia, Typography, IconButton, Slider, Stack, Tooltip, LinearProgress, CircularProgress } from "@mui/material"
import { 
  PlayArrow, 
  Pause, 
  SkipNext, 
  SkipPrevious, 
  VolumeUp, 
  VolumeOff,
  VolumeMute,
  Repeat, 
  Shuffle,
  QueueMusic,
  Favorite,
  FavoriteBorder
} from "@mui/icons-material"
import { useAppSelector, useAppDispatch } from "@/shared/hooks"
import {
  selectCurrentTrack,
  selectIsPlaying,
  selectVolume,
  selectCurrentTime,
  selectDuration,
  selectRepeat,
  selectShuffle,
  togglePlay,
  setVolume,
  setCurrentTime,
  setDuration,
  nextTrack,
  previousTrack,
  toggleRepeat,
  toggleShuffle,
} from "@/features/player/model"

export const PlayerWidget = () => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)
  const volume = useAppSelector(selectVolume)
  const currentTime = useAppSelector(selectCurrentTime)
  const duration = useAppSelector(selectDuration)
  const repeat = useAppSelector(selectRepeat)
  const shuffle = useAppSelector(selectShuffle)

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(volume)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime))
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration))
    }
  }

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value
      dispatch(setCurrentTime(value))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // ...existing useEffect hooks...

  const handleVolumeIcon = () => {
    if (volume === 0) {
      return <VolumeOff />
    } else if (volume < 0.5) {
      return <VolumeMute />
    } else {
      return <VolumeUp />
    }
  }

  const handleMuteToggle = () => {
    if (volume === 0) {
      dispatch(setVolume(previousVolume || 0.5))
    } else {
      setPreviousVolume(volume)
      dispatch(setVolume(0))
    }
  }

  const getRepeatIcon = () => {
    if (repeat === "one") {
      return "🔂"
    }
    return <Repeat />
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!currentTrack) {
    return (
      <Card
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
          backgroundColor: "#181818",
          borderTop: "1px solid #282828",
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Выберите трек для воспроизведения
          </Typography>
        </Box>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        backgroundColor: "#181818",
        borderTop: "1px solid #282828",
      }}
    >
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => dispatch(nextTrack())}
      />

      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Track Info */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 200 }}>
            <CardMedia
              component="img"
              sx={{ width: 56, height: 56, borderRadius: 1 }}
              image={currentTrack.coverUrl}
              alt={currentTrack.title}
            />
            <Box>
              <Typography variant="body2" color="text.primary" noWrap>
                {currentTrack.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {currentTrack.artist}
              </Typography>
            </Box>
          </Stack>

          {/* Player Controls */}
          <Box sx={{ flex: 1, maxWidth: 600 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <IconButton
                size="small"
                onClick={() => dispatch(toggleShuffle())}
                color={shuffle ? "primary" : "default"}
              >
                <Shuffle />
              </IconButton>
              <IconButton onClick={() => dispatch(previousTrack())}>
                <SkipPrevious />
              </IconButton>
              <IconButton
                onClick={() => dispatch(togglePlay())}
                sx={{
                  backgroundColor: "primary.main",
                  color: "black",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={() => dispatch(nextTrack())}>
                <SkipNext />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => dispatch(toggleRepeat())}
                color={repeat !== "none" ? "primary" : "default"}
              >
                <Repeat />
              </IconButton>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)}
              </Typography>
              <Slider
                size="small"
                value={currentTime}
                max={duration}
                onChange={(_, value) => handleSeek(value as number)}
                sx={{
                  color: "primary.main",
                  "& .MuiSlider-thumb": {
                    width: 12,
                    height: 12,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Stack>
          </Box>

          {/* Volume Control */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 150 }}>
            <VolumeUp />
            <Slider
              size="small"
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(_, value) => dispatch(setVolume(value as number))}
              sx={{
                color: "primary.main",
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </Card>
  )
}
