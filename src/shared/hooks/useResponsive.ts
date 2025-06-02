import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"

/**
 * Hook for detecting mobile portrait orientation (9:16 aspect ratio)
 * Returns true for mobile portrait mode
 */
export const usePortraitMode = () => {
  return useMediaQuery("(orientation: portrait) and (max-width: 768px)")
}

/**
 * Hook for detecting landscape orientation (16:9 aspect ratio)
 * Returns true for landscape mode or desktop
 */
export const useLandscapeMode = () => {
  return useMediaQuery("(orientation: landscape) or (min-width: 769px)")
}

/**
 * Hook for detecting mobile device regardless of orientation
 */
export const useMobileDevice = () => {
  return useMediaQuery("(max-width: 768px)")
}

/**
 * Hook for detecting tablet device
 */
export const useTabletDevice = () => {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

/**
 * Hook for detecting desktop device
 */
export const useDesktopDevice = () => {
  return useMediaQuery("(min-width: 1025px)")
}

/**
 * Hook that returns responsive breakpoint information
 */
export const useResponsiveBreakpoints = () => {
  const theme = useTheme()
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down("md")),
    isTablet: useMediaQuery(theme.breakpoints.between("md", "lg")),
    isDesktop: useMediaQuery(theme.breakpoints.up("lg")),
    isPortrait: usePortraitMode(),
    isLandscape: useLandscapeMode(),
  }
}

/**
 * Utility function to get responsive styles based on aspect ratio
 */
export const getResponsiveStyles = () => {
  const breakpoints = useResponsiveBreakpoints()
  
  return {
    // Sidebar styles
    sidebarWidth: breakpoints.isMobile ? 0 : 240,
    sidebarDisplay: breakpoints.isMobile ? "none" : "block",
    
    // Main content margins
    mainContentMargin: {
      ml: { xs: 0, md: "240px" },
      pt: { xs: "80px", md: 3 },
      pb: { xs: "140px", md: "100px" }
    },
    
    // Player bottom position
    playerBottom: { xs: "56px", md: 0 },
    
    // Mobile navigation display
    mobileNavDisplay: { xs: "block", md: "none" },
    
    // Grid responsive columns
    gridColumns: breakpoints.isPortrait 
      ? { xs: 12, sm: 6 } 
      : { xs: 12, sm: 6, md: 4, lg: 3 }
  }
}
