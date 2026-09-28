import { createTheme, ThemeOptions } from '@mui/material';

export const colors = {
  ink: '#0B0B0B',
  inkLight: '#1A1919',
  paper: '#F4F1EC',
  paperDark: '#E3E0DB',
  white: '#FFFFFF',
  red: '#B3262D',
  redDark: '#7F171D',
  redSoft: '#D95C61',
  lineDark: '#2A2928',
  lineLight: '#E0DCD6',
  mutedDark: '#A8A39D',
  mutedLight: '#6E6A65',
  quiet: '#6E6A65',
};

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: { main: colors.red, contrastText: colors.white },
      secondary: { main: isDark ? colors.paper : colors.ink },
      background: { 
        default: isDark ? colors.ink : colors.paper, 
        paper: isDark ? colors.inkLight : colors.white 
      },
      text: { 
        primary: isDark ? colors.paper : colors.ink, 
        secondary: isDark ? colors.mutedDark : colors.mutedLight 
      },
      divider: isDark ? colors.lineDark : colors.lineLight,
      error: { main: colors.redSoft },
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
      body2: { fontFamily: '"IBM Plex Sans", sans-serif', color: isDark ? colors.mutedDark : colors.mutedLight },
      button: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      overline: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, letterSpacing: '0.14em' },
    },
    shape: { borderRadius: 2 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': { colorScheme: mode },
          '::selection': { backgroundColor: colors.red, color: colors.white },
          body: { backgroundColor: isDark ? colors.ink : colors.paper },
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
            borderColor: isDark ? '#4A4643' : '#C2BEB9',
            color: isDark ? colors.paper : colors.ink,
            '&:hover': { borderColor: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.08)' },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { 
            borderRadius: 2, 
            color: isDark ? colors.paper : colors.ink, 
            '&:hover': { color: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.12)' } 
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': { color: isDark ? colors.mutedDark : colors.mutedLight },
            '& .MuiInputLabel-root.Mui-focused': { color: colors.redSoft },
            '& .MuiOutlinedInput-root': {
              color: isDark ? colors.paper : colors.ink,
              backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
              '& fieldset': { borderColor: isDark ? '#3A3735' : '#D0CDC8' },
              '&:hover fieldset': { borderColor: isDark ? '#5A5550' : '#A09C97' },
              '&.Mui-focused fieldset': { borderColor: colors.redSoft },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 2, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' } },
      },
      MuiDialog: {
        styleOverrides: { paper: { backgroundColor: isDark ? '#151313' : colors.white, border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`, backgroundImage: 'none' } },
      },
    },
  });
};

