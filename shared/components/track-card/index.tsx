"use client"

import type React from "react"

import { Card, CardContent, CardMedia, Typography, IconButton, Chip, Box } from "@mui/material"
import { PlayArrow, Favorite, FavoriteBorder } from "@mui/icons-material"
import { useAppDispatch } from "@/shared/hooks"
import { setCurrentTrack, setQueue, playTrack } from "@/features/player/model"
import { useToggleFavoriteMutation } from "@/entities/track/api"
import type { Track } from "@/shared/types"

interface TrackCardProps {
  track: Track
}

export const TrackCard = ({ track }: TrackCardProps) => {
  const dispatch = useAppDispatch()
  const [toggleFavorite] = useToggleFavoriteMutation()

  const handlePlay = () => {
    dispatch(setCurrentTrack(track))
    dispatch(setQueue([track]))
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(track.id)
  }

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          "& .play-button": {
            opacity: 1,
          },
        },
      }}
      onClick={handlePlay}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="200" image={track.coverUrl} alt={track.title} />
        <IconButton
          className="play-button"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: "primary.main",
            color: "black",
            opacity: 0,
            transition: "opacity 0.2s",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
          onClick={(e) => {
            e.stopPropagation()
            handlePlay()
          }}
        >
          <PlayArrow />
        </IconButton>
      </Box>
      <CardContent>
        <Typography variant="h6" noWrap>
          {track.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {track.artist}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Chip label={track.genre} size="small" />
          <IconButton size="small" onClick={handleToggleFavorite}>
            {track.isLiked ? <Favorite color="primary" /> : <FavoriteBorder />}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}
