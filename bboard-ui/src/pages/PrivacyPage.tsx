import React from 'react';
import { Container, Paper, Typography, useTheme } from '@mui/material';

export const PrivacyPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const panelSx = {
    p: 4,
    borderRadius: '16px',
    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${divider}`,
    mb: 4
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, md: 12 }, mb: 12 }}>
      <Typography variant="h2" sx={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', mb: 4, color: paperText }}>
        How Midnight Keeps Your Bid Secret
      </Typography>

      <Paper sx={panelSx}>
        <Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          Zero-Knowledge Cryptography
        </Typography>
        <Typography sx={{ fontFamily: 'Inter', color: mutedText, lineHeight: 1.8 }}>
          Unlike traditional blockchains (like Ethereum) where all data is public, the Midnight Network utilizes Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (ZK-SNARKs). 
          When you place a bid on SealedAuction, your plaintext bid amount never leaves your device. Instead, a mathematically sound 'commitment' is derived locally on your machine and broadcasted.
        </Typography>
      </Paper>

      <Paper sx={panelSx}>
        <Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          The Commit-Reveal Architecture
        </Typography>
        <Typography sx={{ fontFamily: 'Inter', color: mutedText, lineHeight: 1.8 }}>
          <strong>1. Commit Phase:</strong> Your bid is hashed using a random cryptographic nonce. Only this hash (commitment) is recorded on the public ledger. 
          <br /><br />
          <strong>2. Reveal Phase:</strong> Once the auction closes, you present the plaintext bid and nonce. A zero-knowledge proof verifies that they match the previously submitted commitment. If they match, the smart contract privately compares your bid against the current highest bid without exposing the actual values to the world.
        </Typography>
      </Paper>

      <Paper sx={{ ...panelSx, mb: 0 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Inter', fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          Local Client Proving (WASM)
        </Typography>
        <Typography sx={{ fontFamily: 'Inter', color: mutedText, lineHeight: 1.8 }}>
          All computations involving your secrets—such as your private key and your bid amount—occur strictly within a WebAssembly (WASM) sandbox in this browser tab. 
          There are no central servers intercepting your data. You are always in full control.
        </Typography>
      </Paper>
    </Container>
  );
};
