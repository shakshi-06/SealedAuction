import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
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
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', py: 6, px: 4, textAlign: 'center', background: '#050505', width: '100%' }}>
        <Typography sx={{ color: '#666', fontFamily: 'Inter', fontSize: '0.85rem', mb: 2, fontWeight: 700, letterSpacing: '0.1em' }}>PREPROD TESTNET ACTIVE</Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.03)', px: 2, py: 1, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{ color: '#888', fontFamily: 'monospace', fontSize: '0.85rem' }}>Contract: 5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e</Typography>
          <IconButton size="small" onClick={() => navigator.clipboard.writeText('5a9cd8179b54c81863309dcfacd83f8207f0fc35a1ab79cc4ff524b334c8ae1e')} sx={{ color: '#ccff00' }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ color: '#444', fontFamily: 'Inter', fontSize: '0.8rem', mt: 4 }}>&copy; 2026 SealedAuction. Privacy-preserving sealed-bid auctions on Midnight.</Typography>
      </Box>
    </Box>
  );
};
