import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.35, backgroundImage: 'radial-gradient(circle at 85% 8%, rgba(217,74,66,0.09), transparent 24rem)', zIndex: 0 } }}>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Header />
      <Box component="main">{children}</Box>
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5, mt: 8 }}>
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', color: 'primary.main', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>SEALED / VERIFIED / PRIVATE</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Confidential auctions on Midnight Preprod.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
            <Link href="/privacy" underline="hover" sx={{ color: 'text.secondary', fontSize: 13 }}>Privacy model</Link>
            <Link href="/verify" underline="hover" sx={{ color: 'text.secondary', fontSize: 13 }}>Verify</Link>
            <Typography sx={{ color: 'text.secondary', fontFamily: '"DM Mono", monospace', fontSize: 11 }}>MIDNIGHT / PREPROD</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  </Box>
);
