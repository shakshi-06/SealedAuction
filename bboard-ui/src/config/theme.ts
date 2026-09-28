import { createTheme, ThemeOptions } from '@mui/material';

export const colors = {
  ink: '#0B0B0B',
  inkLight: '#141414',
  paper: '#F4F1EC',
  white: '#FFFFFF',
  red: '#B3262D',
  redDark: '#7F171D',
  redSoft: '#D95C61',
  lineDark: '#2A2928',
  lineLight: '#EAEAEA',
  mutedDark: '#A8A39D',
  mutedLight: '#666666',
  quiet: '#6E6A65',
  bgLight: '#FAFAFA',
};

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: { main: colors.red, contrastText: colors.white },
      secondary: { main: isDark ? colors.paper : colors.ink },
      background: { 
        default: isDark ? colors.ink : colors.bgLight, 
        paper: isDark ? colors.inkLight : colors.white 
      },
      text: { 
        primary: isDark ? colors.paper : '#111111', 
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
          body: { backgroundColor: isDark ? colors.ink : colors.bgLight },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 4, minHeight: 42, paddingInline: 18 },
          contained: {
            backgroundColor: colors.red,
            color: colors.white,
            boxShadow: 'none',
            '&:hover': { backgroundColor: colors.redDark, boxShadow: 'none' },
          },
          outlined: {
            borderColor: isDark ? '#4A4643' : '#D4D4D4',
            color: isDark ? colors.paper : '#111111',
            '&:hover': { borderColor: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.04)' },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { 
            borderRadius: 4, 
            color: isDark ? colors.paper : '#111111', 
            '&:hover': { color: colors.redSoft, backgroundColor: 'rgba(179, 38, 45, 0.08)' } 
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': { color: isDark ? colors.mutedDark : colors.mutedLight },
            '& .MuiInputLabel-root.Mui-focused': { color: colors.redSoft },
            '& .MuiOutlinedInput-root': {
              color: isDark ? colors.paper : '#111111',
              backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : colors.white,
              '& fieldset': { borderColor: isDark ? '#3A3735' : '#E0E0E0' },
              '&:hover fieldset': { borderColor: isDark ? '#5A5550' : '#BDBDBD' },
              '&.Mui-focused fieldset': { borderColor: colors.redSoft },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 4, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' } },
      },
      MuiDialog: {
        styleOverrides: { paper: { backgroundColor: isDark ? '#151313' : colors.white, border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`, backgroundImage: 'none', boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)' } },
      },
    },
  });
};

