import { createTheme } from '@mui/material';

// Sealed-bid auction color system: strict black, white, red.
// Red is reserved for urgent/live states only, never decorative.
export const colors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  border: '#3D3D3D',
  text: '#FAFAFA',
  textMuted: '#8A8A8A',
  red: '#E8332B',
  redDim: 'rgba(232, 51, 43, 0.14)',
};

export const theme = createTheme({
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    body2: {
      fontFamily: '"IBM Plex Sans", sans-serif',
      color: colors.textMuted,
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    allVariants: {
      color: colors.text,
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: colors.red,
      contrastText: colors.text,
    },
    secondary: {
      main: colors.textMuted,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },
    divider: colors.border,
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        contained: {
          backgroundColor: colors.red,
          color: colors.text,
          '&:hover': {
            backgroundColor: '#C82920',
          },
        },
        outlined: {
          borderColor: colors.border,
          color: colors.text,
          '&:hover': {
            borderColor: colors.red,
            backgroundColor: colors.redDim,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.text,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: colors.redDim,
            color: colors.red,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: '"IBM Plex Mono", monospace',
            color: colors.text,
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.textMuted,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.red,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          backgroundImage: 'none',
        },
      },
    },
  },
});
