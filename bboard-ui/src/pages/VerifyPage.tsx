import React, { useMemo, useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { colors } from '../config/theme';

const panelSx = {
  border: `1px solid ${colors.line}`,
  backgroundColor: 'rgba(255,255,255,0.025)',
  boxShadow: 'none',
};
const monoSx = { fontFamily: '"DM Mono", monospace' };

function isContractAddress(value: string): boolean {
  return /^(?:0x)?[a-fA-F0-9]{64}$/.test(value.trim());
}

export const VerifyPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [touched, setTouched] = useState(false);
  const validAddress = useMemo(() => isContractAddress(address), [address]);
  const normalizedAddress = address.trim().replace(/^0x/i, '');
  const explorerUrl = validAddress ? `https://preprod.midnightexplorer.com/contracts/${normalizedAddress}` : undefined;

  return (
    <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 900, mb: { xs: 6, md: 9 } }}>
        <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 11, letterSpacing: '0.14em', mb: 2 }}>VERIFY / NETWORK RECORD</Typography>
        <Typography variant="h1" sx={{ color: colors.paper, fontSize: { xs: 44, md: 72 }, lineHeight: 0.98, mb: 3 }}>
          Check the address, then check the source.
        </Typography>
        <Typography sx={{ color: colors.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.65, maxWidth: 760 }}>
          Contract addresses are public. Enter a Preprod address to open its network record in the Midnight Explorer. This interface does not invent a bytecode verifier or a standalone proof validator.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)' }, gap: 3, alignItems: 'start' }}>
        <Paper sx={{ ...panelSx, p: { xs: 3, md: 5 } }}>
          <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 2 }}>01 / CONTRACT ADDRESS</Typography>
          <Typography variant="h4" sx={{ color: colors.paper, mb: 1.5 }}>Open the public record</Typography>
          <Typography sx={{ color: colors.muted, lineHeight: 1.7, mb: 4 }}>
            A valid Midnight contract address is 64 hexadecimal characters, with an optional 0x prefix. The link below is limited to the Preprod Explorer.
          </Typography>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setTouched(true); }}>
            <TextField
              fullWidth
              label="Midnight contract address"
              value={address}
              onChange={(event) => { setAddress(event.target.value); setTouched(true); }}
              placeholder="64 hexadecimal characters"
              error={touched && address.length > 0 && !validAddress}
              helperText={touched && address.length > 0 && !validAddress ? 'Use 64 hexadecimal characters, optionally prefixed with 0x.' : 'Example: 8f4c...'}
              inputProps={{ spellCheck: false, maxLength: 66 }}
              InputProps={{ sx: { ...monoSx, fontSize: 12 } }}
            />
            <Button
              variant="contained"
              href={explorerUrl ?? '#'}
              target="_blank"
              rel="noreferrer"
              disabled={!validAddress}
              endIcon={<OpenInNewOutlinedIcon />}
              onClick={() => setTouched(true)}
              sx={{ mt: 3 }}
            >
              Open Preprod Explorer
            </Button>
          </Box>
          {validAddress && (
            <Box sx={{ borderTop: `1px solid ${colors.line}`, mt: 4, pt: 2.5 }}>
              <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.1em', mb: 1 }}>ADDRESS ACCEPTED</Typography>
              <Typography sx={{ ...monoSx, color: colors.muted, fontSize: 11, wordBreak: 'break-all' }}>{normalizedAddress}</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ ...panelSx, p: { xs: 3, md: 4 } }}>
          <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 2 }}>02 / WHAT THIS MEANS</Typography>
          <Typography variant="h5" sx={{ color: colors.paper, mb: 2 }}>Verification with a clear boundary</Typography>
          <Typography sx={{ color: colors.muted, lineHeight: 1.7, fontSize: 14 }}>
            The Explorer is the appropriate place to inspect the deployed contract record and transaction context. Source compilation uses the Compact contract and managed assets shipped with this app, but this page does not claim that an address has matching bytecode.
          </Typography>
          <Typography sx={{ color: colors.muted, lineHeight: 1.7, fontSize: 14, mt: 2 }}>
            Proofs are produced through the configured Midnight proving provider during transaction construction. There is no raw proof upload or proof validation service exposed here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
