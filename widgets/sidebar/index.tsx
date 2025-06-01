"use client"

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material"
import { Home, Search, LibraryMusic, Favorite, Person, Add } from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../../src/shared/hooks"
import { selectCurrentUser } from "../../src/features/auth"
import { ThemeToggle } from "../../src/features/theme"

const DRAWER_WIDTH = 240

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)

  const menuItems = [
    { text: "Главная", icon: <Home />, path: "/dashboard" },
    { text: "Поиск", icon: <Search />, path: "/search" },
    { text: "Моя библиотека", icon: <LibraryMusic />, path: "/playlists" },
    { text: "Любимые треки", icon: <Favorite />, path: "/favorites" },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="primary" fontWeight="bold">
            Music Player
          </Typography>
          <ThemeToggle size="small" />
        </Stack>
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "rgba(29, 185, 84, 0.1)",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                  "& .MuiListItemText-primary": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Плейлисты
        </Typography>
        <ListItemButton onClick={() => handleNavigation("/playlists/create")}>
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="Создать плейлист" />
        </ListItemButton>
      </Box>

      <Box sx={{ mt: "auto", p: 2 }}>
        <ListItemButton onClick={() => handleNavigation("/profile")}>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={user?.name || "Профиль"} secondary={user?.role || "Пользователь"} />
        </ListItemButton>
      </Box>
    </Drawer>
  )
}
