import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 4,
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 10 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
