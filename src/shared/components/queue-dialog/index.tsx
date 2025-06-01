import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  Stack,
  Divider,
} from "@mui/material"
import {
  PlayArrow,
  Pause,
  Delete,
  QueueMusic,
} from "@mui/icons-material"
import { useAppSelector, useAppDispatch } from "@/shared/hooks"
import {
  selectQueue,
  selectCurrentTrack,
  selectIsPlaying,
  playTrack,
  togglePlay,
  setQueue,
} from "@/features/player/model"
import type { Track } from "@/shared/types"

interface QueueDialogProps {
  open: boolean
  onClose: () => void
}

export const QueueDialog: React.FC<QueueDialogProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch()
  const queue = useAppSelector(selectQueue)
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handlePlayTrack = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentTrack?.id === track.id) {
      dispatch(togglePlay())
    } else {
      dispatch(playTrack(track))
    }
  }

  const handleRemoveFromQueue = (trackIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newQueue = queue.filter((_, index) => index !== trackIndex)
    dispatch(setQueue(newQueue))
  }

  const handleClearQueue = () => {
    dispatch(setQueue([]))
  }

  const totalDuration = queue.reduce((acc, track) => acc + track.duration, 0)
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`
    }
    return `${minutes} мин`
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <QueueMusic />
          <Typography variant="h6">Очередь воспроизведения</Typography>
        </Stack>
        {queue.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {queue.length} треков • {formatTotalDuration(totalDuration)}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {queue.length === 0 ? (
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              p: 4,
              minHeight: 200
            }}
          >
            <QueueMusic sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Очередь пуста
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Добавьте треки в очередь для воспроизведения
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {queue.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id
              const isTrackPlaying = isCurrentTrack && isPlaying
              
              return (
                <React.Fragment key={`${track.id}-${index}`}>
                  <ListItem 
                    disablePadding
                    sx={{
                      backgroundColor: isCurrentTrack ? "action.selected" : "transparent",
                      "&:hover": { backgroundColor: "action.hover" }
                    }}
                  >
                    <ListItemButton
                      onClick={(e) => handlePlayTrack(track, e)}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Typography variant="body2" color="text.secondary">
                          {index + 1}
                        </Typography>
                      </ListItemIcon>
                      
                      <ListItemIcon sx={{ minWidth: 60 }}>
                        <Card sx={{ width: 48, height: 48 }}>
                          <CardMedia
                            component="img"
                            image={track.coverUrl || "/placeholder.jpg"}
                            alt={track.title}
                            sx={{ width: 48, height: 48 }}
                          />
                        </Card>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            noWrap 
                            color={isCurrentTrack ? "primary" : "text.primary"}
                            fontWeight={isCurrentTrack ? "bold" : "normal"}
                          >
                            {track.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {track.artist}
                          </Typography>
                        }
                      />
                      
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDuration(track.duration)}
                        </Typography>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => handlePlayTrack(track, e)}
                          color={isCurrentTrack ? "primary" : "default"}
                        >
                          {isTrackPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => handleRemoveFromQueue(index, e)}
                          color="error"
                          sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < queue.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              )
            })}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {queue.length > 0 && (
          <Button 
            onClick={handleClearQueue}
            color="error"
            variant="outlined"
            size="small"
          >
            Очистить очередь
          </Button>
        )}
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  )
}
