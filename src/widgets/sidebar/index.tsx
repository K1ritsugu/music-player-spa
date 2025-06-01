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
  Stack,
  Avatar,
} from "@mui/material"
import { Home, Search, LibraryMusic, Favorite, Person, CloudUpload } from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { useAppSelector } from "@/shared/hooks"
import { selectCurrentUser } from "@/features/auth"
import { ThemeToggle } from "@/features/theme"

const DRAWER_WIDTH = 240

interface SidebarProps {
  onClose: () => void
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)

  const menuItems = [
    { text: "Главная", icon: <Home />, path: "/dashboard" },
    { text: "Поиск", icon: <Search />, path: "/search" },
    { text: "Мои плейлисты", icon: <LibraryMusic />, path: "/playlists" },
    { text: "Любимые треки", icon: <Favorite />, path: "/favorites" },
    { text: "Загрузить трек", icon: <CloudUpload />, path: "/upload" },
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
            JerkCl0ud
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

      <Box sx={{ mt: "auto", p: 2 }}>
        <ListItemButton onClick={() => handleNavigation("/profile")}>
          <ListItemIcon>
            <Avatar 
              src={user?.avatar || user?.avatarUrl} 
              sx={{ width: 32, height: 32 }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <Person />}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={user?.name || "Профиль"}/>
        </ListItemButton>
      </Box>
    </Drawer>
  )
}
