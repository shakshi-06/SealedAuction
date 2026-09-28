import React from 'react';
import { Box, Typography, Container, Paper, useTheme, Button } from '@mui/material';

export const VerifyPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, md: 12 }, mb: 12 }}>
      <Typography variant="h2" sx={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', mb: 4, color: 'text.primary' }}>
        Proof & Contract Verification
      </Typography>

      <Typography sx={{ fontFamily: 'Inter', color: 'text.secondary', mb: 6, lineHeight: 1.6 }}>
        Verify that the deployed smart contract bytecode perfectly matches the open-source Compact logic. 
        You can also verify your own ZK proofs manually before submitting them.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: '16px', background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Contract Verifier
        </Typography>
        <Typography sx={{ fontFamily: 'Inter', color: 'text.secondary', mb: 3 }}>
          Enter a Midnight contract address to fetch its bytecode and verify its source compilation.
        </Typography>
        <Button variant="outlined" sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { borderColor: theme.palette.primary.dark } }}>
          Launch Verifier Tool &nearr;
        </Button>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: '16px', background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
        <Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 700, mb: 2, color: 'text.primary' }}>
          ZK Proof Validator
        </Typography>
        <Typography sx={{ fontFamily: 'Inter', color: 'text.secondary', mb: 3 }}>
          Paste a raw ZK-SNARK proof and the public parameters to manually assert its validity using the Midnight Verification Key.
        </Typography>
        <Button variant="outlined" sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { borderColor: theme.palette.primary.dark } }}>
          Validate Proof &nearr;
        </Button>
      </Paper>
    </Container>
  );
};
