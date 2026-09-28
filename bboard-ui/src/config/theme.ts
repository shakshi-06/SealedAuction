import { createTheme } from '@mui/material';

export const colors = {
  ink: '#0B0B0B',
  paper: '#F4F1EC',
  white: '#FFFFFF',
  red: '#B3262D',
  redDark: '#7F171D',
  redSoft: '#D95C61',
  line: '#2A2928',
  muted: '#A8A39D',
  quiet: '#6E6A65',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.red, contrastText: colors.white },
    secondary: { main: colors.paper },
    background: { default: colors.ink, paper: '#141313' },
    text: { primary: colors.paper, secondary: colors.muted },
    divider: colors.line,
    error: { main: '#D95C61' },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.055em' },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.045em' },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.035em' },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    body1: { fontFamily: '"IBM Plex Sans", sans-serif' },
    body2: { fontFamily: '"IBM Plex Sans", sans-serif', color: colors.muted },
    button: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    overline: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, letterSpacing: '0.14em' },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': { colorScheme: 'dark' },
        '::selection': { backgroundColor: colors.red, color: colors.white },
        body: { backgroundColor: colors.ink },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, minHeight: 42, paddingInline: 18 },
        contained: {
          backgroundColor: colors.red,
          color: colors.white,
          boxShadow: 'none',
          '&:hover': { backgroundColor: colors.redDark, boxShadow: 'none' },
        },
        outlined: {
          borderColor: '#4A4643',
          color: colors.paper,
          '&:hover': { borderColor: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.1)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 2, color: colors.paper, '&:hover': { color: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.12)' } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': { color: colors.muted },
          '& .MuiInputLabel-root.Mui-focused': { color: colors.redSoft },
          '& .MuiOutlinedInput-root': {
            color: colors.paper,
            backgroundColor: 'rgba(255,255,255,0.025)',
            '& fieldset': { borderColor: '#3A3735' },
            '&:hover fieldset': { borderColor: '#5A5550' },
            '&.Mui-focused fieldset': { borderColor: colors.redSoft },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 2, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' } },
    },
    MuiDialog: {
      styleOverrides: { paper: { backgroundColor: '#151313', border: `1px solid ${colors.line}`, backgroundImage: 'none' } },
    },
  },
});
