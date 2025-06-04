import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  MoreVert,
  PlaylistAdd,
  QueueMusic,
  Delete,
} from "@mui/icons-material"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { setQueue, togglePlay, playTrack, addToQueue } from "@/features/player/model"
import { selectCurrentTrack, selectIsPlaying } from "@/features/player/model"
import { useToggleFavoriteMutation, useDeleteTrackMutation } from "@/entities/track/api"
import { AddToPlaylistDialog } from "@/shared/components/add-to-playlist-dialog"
import { selectCurrentUser } from "@/features/auth"
import type { Track } from "@/shared/types"

interface TrackCardProps {
  track: Track
  variant?: "default" | "compact"
  showIndex?: number
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  variant = "default",
  showIndex,
}) => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector(selectCurrentTrack)
  const isPlaying = useAppSelector(selectIsPlaying)
  const user = useAppSelector(selectCurrentUser)
  const [toggleFavorite] = useToggleFavoriteMutation()
  const [deleteTrack] = useDeleteTrackMutation()
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false)

  const isCurrentTrack = currentTrack?.id === track.id
  const isTrackPlaying = isCurrentTrack && isPlaying
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrentTrack) {
      dispatch(togglePlay())
    } else {
      dispatch(playTrack(track))
      dispatch(setQueue([track]))
    }
  }
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(track.id)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAddToPlaylist = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setPlaylistDialogOpen(true)
    handleMenuClose()
  }

  const handleDeleteTrack = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (window.confirm(`Вы уверены, что хотите удалить трек "${track.title}"?`)) {
      try {
        await deleteTrack(track.id)
        handleMenuClose()
      } catch (error) {
        console.error("Error deleting track:", error)
      }
    }
  }

  // Check if current user can delete this track
  const canDeleteTrack = user && track.createdBy === user.id
  if (variant === "compact") {
    return (
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          width: "100%",
          overflowX: "hidden"
        }}
          onClick={(e) => {
            // Если клик на IconButton, не воспроизводить трек
            if ((e.target as HTMLElement).closest('button')) {
              e.stopPropagation();
              return;
            }
            handlePlayPause(e);
          }}
      >
        {showIndex && (
          <Box sx={{ minWidth: 40, textAlign: "center", flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {showIndex}
            </Typography>
          </Box>
        )}
        <CardMedia
          component="img"
          sx={{ width: 56, height: 56, borderRadius: 1, flexShrink: 0 }}
          image={track.coverUrl || "/placeholder.jpg"}
          alt={track.title}
        />
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          flex: 1, 
          ml: 2,
          minWidth: 0, // Важно для работы noWrap
          overflow: "hidden"
        }}>
          <Typography variant="body1" noWrap>
            {track.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {track.artist}
          </Typography>
        </Box>        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: { xs: 0.5, sm: 1 },
          flexShrink: 0 
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {formatDuration(track.duration)}
          </Typography>
          <IconButton 
            size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(e);
              }}
          >
            {track.isLiked ? (
              <Favorite color="primary" fontSize="small" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
          </IconButton>
          <IconButton 
            size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(e);
              }}
          >
            {isTrackPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e);
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: 280,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          "& .play-button": {
            opacity: 1,
          },
        },
      }}
      onClick={handlePlayPause}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={track.coverUrl || "/placeholder.jpg"}
          alt={track.title}
        />
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleToggleFavorite}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            {track.isLiked ? (
              <Favorite color="primary" fontSize="small" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
          </IconButton>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
          }}
        >
          <IconButton
            className="play-button"
            onClick={handlePlayPause}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              opacity: isTrackPlaying ? 1 : 0,
              transition: "opacity 0.2s",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {isTrackPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Box>
      </Box>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" component="h3" noWrap>
            {track.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {track.artist}
          </Typography>
          {track.album && (
            <Chip
              label={track.album}
              size="small"
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            />
          )}          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(track.duration)}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={(e) => {
          e.stopPropagation()
          handleAddToPlaylist(e)
        }}>
          <ListItemIcon>
            <PlaylistAdd fontSize="small" />
          </ListItemIcon>
          <ListItemText>Добавить в плейлист</ListItemText>
        </MenuItem>        <MenuItem onClick={(e) => {
          e.stopPropagation()
          dispatch(addToQueue(track))
          handleMenuClose()
        }}>
          <ListItemIcon>
            <QueueMusic fontSize="small" />
          </ListItemIcon>
          <ListItemText>Добавить в очередь</ListItemText>
        </MenuItem>
        {canDeleteTrack && (
          <MenuItem onClick={handleDeleteTrack}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Удалить трек</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      <AddToPlaylistDialog
        open={playlistDialogOpen}
        onClose={() => setPlaylistDialogOpen(false)}
        track={track}
      />
    </Card>
  )
}
