import React, { createContext, useContext, useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { getAppTheme } from '../config/theme';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({ mode: 'light', toggleTheme: () => undefined });

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme_mode');
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
    }
  }, []);

  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  const currentTheme = getAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
