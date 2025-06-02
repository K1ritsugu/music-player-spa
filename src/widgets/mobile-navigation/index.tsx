"use client"

import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper 
} from "@mui/material"
import { 
  Home, 
  Search, 
  LibraryMusic, 
  Favorite, 
  Person 
} from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"

export const MobileNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { label: "Главная", icon: <Home />, path: "/dashboard" },
    { label: "Поиск", icon: <Search />, path: "/search" },
    { label: "Плейлисты", icon: <LibraryMusic />, path: "/playlists" },
    { label: "Любимые", icon: <Favorite />, path: "/favorites" },
    { label: "Профиль", icon: <Person />, path: "/profile" },
  ]

  const currentIndex = navigationItems.findIndex(item => 
    location.pathname === item.path || 
    (item.path === "/dashboard" && location.pathname === "/")
  )

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue >= 0 && newValue < navigationItems.length) {
      navigate(navigationItems[newValue].path)
    }
  }

  return (
    <Paper 
      sx={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        display: { xs: "block", md: "none" } // Показывать только на мобильных устройствах
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={handleChange}
        showLabels
        sx={{
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            paddingTop: 1,
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.75rem",
            "&.Mui-selected": {
              fontSize: "0.75rem",
            },
          },
        }}
      >        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
