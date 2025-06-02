import { Box, Card, Typography, IconButton, Slider } from "@mui/material"
import { PlayArrow, Pause, SkipNext, SkipPrevious, VolumeUp, Favorite, FavoriteBorder, Repeat, RepeatOne, QueueMusic } from "@mui/icons-material"
import { useRef, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { 
  selectCurrentTrack, 
  selectIsPlaying, 
  selectVolume, 
  selectCurrentTime, 
  selectDuration,
  selectRepeat,
  togglePlay,
  setVolume,
  setCurrentTime,
  setDuration,
  nextTrack,
  previousTrack,
  toggleRepeat,
  setCurrentTrack
} from "@/features/player/model"
import { useToggleFavoriteMutation } from "@/entities/track/api"
import { QueueDialog } from "@/shared/components/queue-dialog"

export const PlayerWidget = () => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)
  const volume = useAppSelector(selectVolume)
  const currentTime = useAppSelector(selectCurrentTime)
  const duration = useAppSelector(selectDuration)
  const repeat = useAppSelector(selectRepeat)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const [toggleFavorite] = useToggleFavoriteMutation()
  const [queueDialogOpen, setQueueDialogOpen] = useState(false)

  // Синхронизация аудио элемента с состоянием Redux
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url
      audioRef.current.load()
    }
  }, [currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentTrack) { // Ensure currentTrack is not null
        audioRef.current.play().catch(error => console.error("Error playing audio:", error)); // Add .catch()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack]) // Add currentTrack to dependencies

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const handlePlayPause = () => {
    dispatch(togglePlay())
  }

  const handlePrevious = () => {
    dispatch(previousTrack())
  }

  const handleNext = () => {
    dispatch(nextTrack())
  }

  const handleRepeat = () => {
    dispatch(toggleRepeat())
  }

  const handleTrackEnd = () => {
    if (repeat === "one") {
      // Повторить текущий трек
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else if (repeat === "all") {
      // Перейти к следующему треку в плейлисте
      dispatch(nextTrack())
    } else {
      // Остановить воспроизведение
      dispatch(nextTrack())
    }
  }

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    dispatch(setVolume(Array.isArray(newValue) ? newValue[0] : newValue))
  }

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

  const handleSeek = (_: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const time = Array.isArray(newValue) ? newValue[0] : newValue
      audioRef.current.currentTime = time
      dispatch(setCurrentTime(time))
    }
  }
  const handleToggleFavorite = async () => {
    if (currentTrack) {
      try {
        await toggleFavorite(currentTrack.id)
        // Обновим локально состояние трека, инвертируя статус isLiked
        if (currentTrack) {
          const updatedTrack = { 
            ...currentTrack, 
            isLiked: !currentTrack.isLiked 
          }
          dispatch(setCurrentTrack(updatedTrack))
        }
      } catch (error) {
        console.error("Error toggling favorite:", error)
      }
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
  if (!currentTrack) {
    return (
      <Card        sx={{
          position: "fixed",
          bottom: 0,
          left: { xs: 0, md: 240 }, // На мобильных занимает всю ширину
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? "#181818" : "#f5f5f5",
          borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark' ? "#282828" : "#e0e0e0"}`,
          p: { xs: 1, sm: 2 },
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
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}      />      <Card
        sx={{
          position: "fixed",
          bottom: { xs: "56px", md: 0 }, // Account for mobile navigation
          left: { xs: 0, md: 240 }, // На мобильных занимает всю ширину
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? "#181818" : "#f5f5f5",
          borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark' ? "#282828" : "#e0e0e0"}`,
          p: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2 }}>
          {/* Информация о треке - всегда видимая на всех устройствах */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              width: { xs: "100%", sm: "auto" }, 
              minWidth: { sm: 300 },
              mb: { xs: 1, sm: 0 }
            }}
          >
            <Box
              component="img"
              src={currentTrack.coverUrl || "/placeholder.jpg"}
              alt={currentTrack.title}
              sx={{ width: 56, height: 56, borderRadius: 1, mr: 2 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {currentTrack.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {currentTrack.artist}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleToggleFavorite}>
              {currentTrack.isLiked ? (
                <Favorite color="primary" fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </IconButton>
          </Box>

          {/* Элементы управления */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            flexGrow: 1,
            width: { xs: "100%", sm: "auto" },
          }}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: 1,
              width: "100%", 
            }}>
              <IconButton 
                onClick={handleRepeat}
                color={repeat !== "none" ? "primary" : "default"}
                size="small"
              >
                {repeat === "one" ? <RepeatOne /> : <Repeat />}
              </IconButton>
              <IconButton onClick={handlePrevious}>
                <SkipPrevious />
              </IconButton>
              <IconButton
                onClick={handlePlayPause}
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleNext}>
                <SkipNext />
              </IconButton>
            </Box>
            
            {/* Прогресс-бар */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              width: "100%", 
              maxWidth: { xs: "100%", md: 600 }, 
              gap: 1 
            }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)}
              </Typography>
              <Slider
                size="small"
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                sx={{ flexGrow: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>          {/* Громкость - теперь показываем на всех устройствах */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            minWidth: { xs: 100, md: 150 }
          }}>
            <VolumeUp sx={{ mr: 1, fontSize: { xs: "small", md: "medium" } }} />
            <Slider
              size="small"
              value={volume}
              onChange={handleVolumeChange}
              sx={{ width: { xs: 80, md: 100 } }}
            />
            <IconButton 
              onClick={() => setQueueDialogOpen(true)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <QueueMusic />
            </IconButton>
          </Box>
          </Box>
      </Card>
      
      {/* Диалог очереди воспроизведения */}
      <QueueDialog 
        open={queueDialogOpen} 
        onClose={() => setQueueDialogOpen(false)} 
      />
    </>
  )
}
