import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  TextField,
  Divider,
} from "@mui/material"
import { PlaylistAdd, Add } from "@mui/icons-material"
import { 
  useGetPlaylistsQuery, 
  useAddTrackToPlaylistMutation,
  useCreatePlaylistMutation 
} from "@/entities/playlist/api"
import type { Track } from "@/shared/types"

interface AddToPlaylistDialogProps {
  open: boolean
  onClose: () => void
  track: Track | null
}

export const AddToPlaylistDialog: React.FC<AddToPlaylistDialogProps> = ({
  open,
  onClose,
  track,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  
  const { data: playlists = [], isLoading } = useGetPlaylistsQuery()
  const [addTrackToPlaylist] = useAddTrackToPlaylistMutation()
  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation()
  const handleAddToPlaylist = async (playlistId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!track) return
    
    try {
      await addTrackToPlaylist({ playlistId, trackId: track.id })
      onClose()
    } catch (error) {
      console.error("Error adding track to playlist:", error)
    }
  }
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };
  const handleCreatePlaylist = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!newPlaylistName.trim() || !track) return
      try {
      await createPlaylist({
        name: newPlaylistName,
        description: "",
        isPublic: false,
        coverUrl: "/placeholder.jpg",
        trackIds: [track.id]
      })
      
      setNewPlaylistName("")
      setShowCreateForm(false)
      onClose()
    } catch (error) {
      console.error("Error creating playlist:", error)
    }
  }

  if (!track) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}>
      <DialogTitle>
        Добавить в плейлист
        <Typography variant="body2" color="text.secondary">
          {track.title} - {track.artist}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List>
              {playlists.map((playlist) => (
                <ListItem key={playlist.id} disablePadding>                  <ListItemButton onClick={(e) => {
                    e.stopPropagation()
                    handleAddToPlaylist(playlist.id, e)
                  }}>
                    <ListItemIcon>
                      <PlaylistAdd />
                    </ListItemIcon>
                    <ListItemText 
                      primary={playlist.name}
                      secondary={`${playlist.tracks?.length || 0} треков`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            {!showCreateForm ? (              <Button
                startIcon={<Add />}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCreateForm(true)
                }}
                fullWidth
                variant="outlined"
              >
                Создать новый плейлист
              </Button>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Название плейлиста"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <Box sx={{ display: "flex", gap: 1 }}>                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCreatePlaylist(e)
                    }}
                    disabled={!newPlaylistName.trim() || isCreating}
                    variant="contained"
                    size="small"
                  >
                    {isCreating ? <CircularProgress size={16} /> : "Создать"}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCreateForm(false)
                      setNewPlaylistName("")
                    }}
                    size="small"
                  >
                    Отмена
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
        <DialogActions onClick={stopPropagation}>
        <Button onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  )
}
