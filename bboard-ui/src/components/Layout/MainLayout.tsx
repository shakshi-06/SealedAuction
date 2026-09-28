import React from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
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
          flex: 1,
        }}
      >
        {children}
      </Box>
      <Box sx={{ borderTop: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', py: 6, px: 4, textAlign: 'center', background: theme.palette.mode === 'dark' ? '#050505' : '#eaeaea', width: '100%' }}>
        <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: '0.85rem', mb: 2, fontWeight: 700, letterSpacing: '0.1em' }}>PREPROD TESTNET ACTIVE</Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', px: 2, py: 1, borderRadius: '8px', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
          <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace', fontSize: '0.85rem' }}>Contract: 5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e</Typography>
          <IconButton size="small" onClick={() => navigator.clipboard.writeText('5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e')} sx={{ color: theme.palette.primary.main }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ color: theme.palette.text.secondary, fontFamily: 'Inter', fontSize: '0.8rem', mt: 4 }}>&copy; 2026 SealedAuction. Privacy-preserving sealed-bid auctions on Midnight.</Typography>
      </Box>
    </Box>
  );
};
