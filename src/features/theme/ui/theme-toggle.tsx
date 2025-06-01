"use client"

import { IconButton, Tooltip } from "@mui/material"
import { LightMode, DarkMode } from "@mui/icons-material"
import { useAppDispatch, useAppSelector } from "@/shared/hooks"
import { toggleTheme, selectThemeMode } from "../model"

interface ThemeToggleProps {
  size?: "small" | "medium" | "large"
  showTooltip?: boolean
}

export const ThemeToggle = ({ size = "medium", showTooltip = true }: ThemeToggleProps) => {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector(selectThemeMode)

  const handleToggle = () => {
    dispatch(toggleTheme())
  }

  const button = (
    <IconButton 
      onClick={handleToggle} 
      size={size}
      color="inherit"
      sx={{
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.1)",
        },
      }}
    >
      {themeMode === "dark" ? <LightMode /> : <DarkMode />}
    </IconButton>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <Tooltip title={`Переключить на ${themeMode === "dark" ? "светлую" : "тёмную"} тему`}>
      {button}
    </Tooltip>
  )
}
