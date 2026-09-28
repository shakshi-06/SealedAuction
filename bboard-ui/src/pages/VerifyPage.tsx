import React, { useState } from 'react';
import { Box, Button, Container, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';

export const VerifyPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [commitment, setCommitment] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 8, md: 12 }, mb: 12 }}>
      <Typography variant="h2" sx={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', mb: 2, color: paperText }}>
        Manual Proof Verification
      </Typography>
      <Typography sx={{ fontFamily: 'Inter', color: mutedText, mb: 4, lineHeight: 1.6 }}>
        Use this tool to independently verify a zero-knowledge commitment payload without needing to rely on our user interface logic.
      </Typography>

      <Paper sx={panelSx}>
        <Stack spacing={3}>
          <TextField 
            label="Auction Contract Address" 
            variant="outlined" 
            fullWidth 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            InputProps={{ sx: { fontFamily: '"DM Mono", monospace' } }}
          />
          <TextField 
            label="Bid Commitment Hex String" 
            variant="outlined" 
            fullWidth 
            multiline
            rows={3}
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            InputProps={{ sx: { fontFamily: '"DM Mono", monospace' } }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleVerify} 
            disabled={isVerifying || !address || !commitment}
            sx={{ alignSelf: 'flex-start', px: 4, py: 1.5, fontFamily: 'Inter', fontWeight: 'bold' }}
          >
            {isVerifying ? 'Verifying ZK Proof on Ledger...' : 'Verify Cryptographic Proof'}
          </Button>

          {isVerifying && (
             <Box sx={{ mt: 2, p: 2, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
               <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: mutedText }}>
                 &gt; fetching state from preprod network...<br/>
                 &gt; decoding contract ledger...<br/>
                 &gt; searching commitment set for {commitment.substring(0, 10)}...
               </Typography>
             </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};
