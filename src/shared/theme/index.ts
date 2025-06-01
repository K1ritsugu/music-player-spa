import { createTheme, ThemeOptions } from "@mui/material/styles"

const getTheme = (mode: "light" | "dark") => {
  const baseTheme: ThemeOptions = {
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
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 20,
          },
        },
      },
    },
  }

  if (mode === "dark") {
    return createTheme({
      ...baseTheme,
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
      components: {
        ...baseTheme.components,
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
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: "#181818",
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: "#181818",
              borderRight: "1px solid #282828",
            },
          },
        },
      },
    })
  } else {
    return createTheme({
      ...baseTheme,
      palette: {
        mode: "light",
        primary: {
          main: "#1db954", // Spotify green
        },
        secondary: {
          main: "#f5f5f5",
        },
        background: {
          default: "#ffffff",
          paper: "#f8f9fa",
        },
        text: {
          primary: "#212121",
          secondary: "#757575",
        },
      },
      components: {
        ...baseTheme.components,
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: "#ffffff",
              color: "#212121",
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: "#ffffff",
              borderRight: "1px solid #e0e0e0",
            },
          },
        },
      },
    })
  }
}

// Export default dark theme for backward compatibility
export const theme = getTheme("dark")

export { getTheme }
