import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: '#0B0B0B', color: '#F4F1EC', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.28, backgroundImage: 'linear-gradient(rgba(244,241,236,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,236,0.035) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'linear-gradient(to bottom, black, transparent 72%)' } }}>
    <Header />
    <Box component="main" sx={{ position: 'relative' }}>{children}</Box>
    <Box component="footer" sx={{ position: 'relative', borderTop: '1px solid #2A2928', py: 5, mt: 8 }}>
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontFamily: '"DM Mono", monospace', color: '#B3262D', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>SEALED / VERIFIED / PRIVATE</Typography>
          <Typography sx={{ color: '#6E6A65', fontSize: 13 }}>Confidential auctions on Midnight Preprod.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
          <Link href="/privacy" underline="hover" sx={{ color: '#A8A39D', fontSize: 13 }}>Privacy model</Link>
          <Link href="/verify" underline="hover" sx={{ color: '#A8A39D', fontSize: 13 }}>Verify</Link>
          <Typography sx={{ color: '#6E6A65', fontFamily: '"DM Mono", monospace', fontSize: 11 }}>MIDNIGHT / PREPROD</Typography>
        </Box>
      </Container>
    </Box>
  </Box>
);
