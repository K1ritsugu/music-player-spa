import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1db954", // Spotify green
    },
    secondary: {
      main: "#191414", // Dark background
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#181818",
          "&:hover": {
            backgroundColor: "#282828",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 20,
        },
      },
    },
  },
})
