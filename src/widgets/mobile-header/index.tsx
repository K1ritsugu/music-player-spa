import { useState } from "react"
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box 
} from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"
import { Sidebar } from "@/widgets/sidebar"

export const MobileHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>      <AppBar 
        position="fixed" 
        sx={{ 
          display: "none", // Hide the mobile header completely
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="открыть меню"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold">
            JerkCl0ud
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
        {/* Toolbar spacer for mobile - hidden since we're not showing the header */}
      <Box sx={{ display: "none" }}>
        <Toolbar />
      </Box>
    </>
  )
}
