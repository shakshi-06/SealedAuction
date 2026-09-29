import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.35, backgroundImage: 'radial-gradient(circle at 85% 8%, rgba(217,74,66,0.09), transparent 24rem)', zIndex: 0 } }}>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Header />
      <Box component="main">{children}</Box>
      <Footer />
    </Box>
  </Box>
);
