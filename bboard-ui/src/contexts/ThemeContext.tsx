import React, { createContext, useContext } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../config/theme';

type ThemeContextType = {
  mode: 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({ mode: 'dark', toggleTheme: () => undefined });

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={{ mode: 'dark', toggleTheme: () => undefined }}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  </ThemeContext.Provider>
);
