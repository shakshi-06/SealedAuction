import { createTheme } from '@mui/material';

export const colors = {
  ink: '#171312',
  inkLight: '#241D1B',
  paper: '#FFF9F4',
  white: '#FFFFFF',
  red: '#D94A42',
  redDark: '#B93631',
  redSoft: '#E56D64',
  lineDark: '#443735',
  lineLight: '#E9DDD5',
  mutedDark: '#C6B7B0',
  mutedLight: '#766761',
  quiet: '#927F77',
  bgLight: '#FFF9F4',
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
        paper: isDark ? colors.inkLight : colors.white,
      },
      text: {
        primary: isDark ? colors.paper : '#241D1B',
        secondary: isDark ? colors.mutedDark : colors.mutedLight,
      },
      divider: isDark ? colors.lineDark : colors.lineLight,
      error: { main: colors.redSoft },
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      h1: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.065em' },
      h2: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.055em' },
      h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.045em' },
      h4: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
      h5: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
      body1: { fontFamily: '"Inter", sans-serif' },
      body2: { fontFamily: '"Inter", sans-serif', color: isDark ? colors.mutedDark : colors.mutedLight },
      button: { fontFamily: '"Inter", sans-serif', fontWeight: 700, textTransform: 'none', letterSpacing: '-0.01em' },
      overline: { fontFamily: '"DM Mono", monospace', fontWeight: 500, letterSpacing: '0.14em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': { colorScheme: mode },
          '::selection': { backgroundColor: colors.red, color: colors.white },
          body: { backgroundColor: isDark ? colors.ink : colors.bgLight },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`, boxShadow: isDark ? 'none' : '0 12px 30px rgba(91, 52, 40, 0.07)' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999, minHeight: 44, paddingInline: 20, transition: 'transform 180ms ease, background-color 180ms ease, border-color 180ms ease', '&:active': { transform: 'scale(0.98)' } },
          contained: { backgroundColor: colors.red, color: colors.white, boxShadow: 'none', '&:hover': { backgroundColor: colors.redDark, boxShadow: 'none' } },
          outlined: { borderColor: isDark ? '#5D4A46' : '#D9C8BF', color: isDark ? colors.paper : '#241D1B', '&:hover': { borderColor: colors.red, backgroundColor: 'rgba(217, 74, 66, 0.06)' } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 999, color: isDark ? colors.paper : '#241D1B', '&:hover': { color: colors.redSoft, backgroundColor: 'rgba(217, 74, 66, 0.08)' } } } },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': { color: isDark ? colors.mutedDark : colors.mutedLight },
            '& .MuiInputLabel-root.Mui-focused': { color: colors.redSoft },
            '& .MuiOutlinedInput-root': {
              color: isDark ? colors.paper : '#241D1B',
              backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : colors.white,
              borderRadius: 10,
              '& fieldset': { borderColor: isDark ? '#443735' : '#E1D4CC' },
              '&:hover fieldset': { borderColor: isDark ? '#6B514B' : '#C9B6AC' },
              '&.Mui-focused fieldset': { borderColor: colors.redSoft },
            },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 999, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' } } },
      MuiDialog: { styleOverrides: { paper: { backgroundColor: isDark ? '#251B1A' : colors.white, border: `1px solid ${isDark ? colors.lineDark : colors.lineLight}`, borderRadius: 16, backgroundImage: 'none', boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(91,52,40,0.12)' } } },
    },
  });
};
