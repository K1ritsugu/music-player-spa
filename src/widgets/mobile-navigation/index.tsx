"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from "@mui/material";
import {
  Home,
  Search,
  LibraryMusic,
  Favorite,
  Person
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

export const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Главная",   icon: <Home />,         path: "/dashboard" },
    { label: "Поиск",     icon: <Search />,       path: "/search" },
    { label: "Плейлисты", icon: <LibraryMusic />, path: "/playlists" },
    { label: "Любимые",   icon: <Favorite />,     path: "/favorites" },
    { label: "Профиль",   icon: <Person />,       path: "/profile" }
  ];

  const current = location.pathname === "/" ? "/dashboard" : location.pathname;

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: "block", md: "none" }
      }}
      elevation={3}
    >
      <BottomNavigation
        value={current}
        onChange={(_, value) => navigate(value)}
        showLabels
        sx={{
          "& .MuiBottomNavigationAction-root": { minWidth: "auto", pt: 1 },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.75rem",
            "&.Mui-selected": { fontSize: "0.75rem" }
          }
        }}
      >
        {items.map(({ label, icon, path }) => (
          <BottomNavigationAction
            key={path}
            label={label}
            icon={icon}
            value={path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
