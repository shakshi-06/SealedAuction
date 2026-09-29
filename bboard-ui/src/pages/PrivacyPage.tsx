import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useNavigate } from 'react-router-dom';
import { SealedBidLogo } from '../components/SealedBidLogo';

const monoSx = { fontFamily: '"DM Mono", monospace' };

export const PrivacyPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  const cardSx = {
    p: { xs: 3.5, md: 4.5 },
    borderRadius: 4,
    background: isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.015)',
    border: `1px solid ${divider}`,
    boxShadow: isDark ? 'none' : '0 12px 32px rgba(91, 52, 40, 0.05)',
    transition: 'all 0.25s ease',
    '&:hover': {
      borderColor: redMain,
      boxShadow: isDark ? '0 12px 28px rgba(217,74,66,0.1)' : '0 12px 28px rgba(0,0,0,0.06)',
    },
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 10, md: 16 } }}>
      {/* Hero Header */}
      <Box sx={{ maxWidth: 840, mb: { xs: 7, md: 10 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: redMain,
              boxShadow: `0 0 10px ${redMain}`,
            }}
          />
          <Typography sx={{ ...monoSx, color: redMain, fontSize: 11, letterSpacing: '0.14em', fontWeight: 700 }}>
            MIDNIGHT NETWORK / PRIVACY MODEL
          </Typography>
        </Stack>

        <Typography
          variant="h1"
          sx={{
            color: paperText,
            fontSize: { xs: 36, sm: 48, md: 62 },
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            mb: 2.5,
          }}
        >
          How Zero-Knowledge Keeps Your Bid Secret
        </Typography>

        <Typography sx={{ color: mutedText, fontSize: { xs: 16, md: 19 }, lineHeight: 1.65, maxWidth: 720 }}>
          Unlike public smart contracts where bid amounts and participant strategies are exposed on-chain, SealedAuction uses Compact Zero-Knowledge circuits to guarantee complete privacy.
        </Typography>
      </Box>

      {/* Core Privacy Pillars Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3.5, mb: 8 }}>
        {/* Pillar 1 */}
        <Paper sx={cardSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.06)',
                border: `1px solid ${redMain}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SecurityOutlinedIcon sx={{ color: redSoft, fontSize: 24 }} />
            </Box>
            <Chip label="ZK-SNARKs" size="small" sx={{ ...monoSx, fontSize: 10, fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          </Stack>
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, mb: 1.5, fontSize: 22 }}>
            Zero-Knowledge Cryptography
          </Typography>
          <Typography sx={{ color: mutedText, fontSize: 14.5, lineHeight: 1.7 }}>
            Plaintext bid amounts never leave your local device. Instead, Compact ZK circuits derive a cryptographic commitment. Only this mathematical proof is sent over the network, rendering your bid invisible to public indexers and front-runners.
          </Typography>
        </Paper>

        {/* Pillar 2 */}
        <Paper sx={cardSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.06)',
                border: `1px solid ${redMain}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountTreeOutlinedIcon sx={{ color: redSoft, fontSize: 24 }} />
            </Box>
            <Chip label="2-Phase Protocol" size="small" sx={{ ...monoSx, fontSize: 10, fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          </Stack>
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, mb: 1.5, fontSize: 22 }}>
            Commit-Reveal Architecture
          </Typography>
          <Typography sx={{ color: mutedText, fontSize: 14.5, lineHeight: 1.7 }}>
            In the <strong>Commit Phase</strong>, your bid is hashed with a secret nonce and stored on-chain. In the <strong>Reveal Phase</strong>, ZK proofs verify your plaintext matches your commitment without exposing losing bids to the public.
          </Typography>
        </Paper>

        {/* Pillar 3 */}
        <Paper sx={cardSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.06)',
                border: `1px solid ${redMain}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodeRoundedIcon sx={{ color: redSoft, fontSize: 24 }} />
            </Box>
            <Chip label="WASM Sandbox" size="small" sx={{ ...monoSx, fontSize: 10, fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          </Stack>
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, mb: 1.5, fontSize: 22 }}>
            Local Client Proving (WASM)
          </Typography>
          <Typography sx={{ color: mutedText, fontSize: 14.5, lineHeight: 1.7 }}>
            All cryptographic witness generation and proof creation happen inside WebAssembly (WASM) sandboxes directly in your browser. There are no central backend servers intercepting your private keys or bid parameters.
          </Typography>
        </Paper>

        {/* Pillar 4 */}
        <Paper sx={cardSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.06)',
                border: `1px solid ${redMain}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldOutlinedIcon sx={{ color: redSoft, fontSize: 24 }} />
            </Box>
            <Chip label="Dual-State Ledger" size="small" sx={{ ...monoSx, fontSize: 10, fontWeight: 700, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
          </Stack>
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, mb: 1.5, fontSize: 22 }}>
            Dual-State Isolation
          </Typography>
          <Typography sx={{ color: mutedText, fontSize: 14.5, lineHeight: 1.7 }}>
            Midnight separates ledger state into <strong>Public State</strong> (verifiable contract status, active phase, winning commitment) and <strong>Private State</strong> (local encrypted storage for nonces and bid amounts).
          </Typography>
        </Paper>
      </Box>

      {/* Visual Execution Diagram Section */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          background: isDark ? 'rgba(217,74,66,0.05)' : 'rgba(217,74,66,0.02)',
          border: `1px solid ${redMain}`,
          mb: 8,
        }}
      >
        <Typography sx={{ ...monoSx, color: redMain, fontSize: 10, letterSpacing: '0.14em', fontWeight: 700, mb: 1 }}>
          DATA FLOW DIAGRAM
        </Typography>
        <Typography variant="h3" sx={{ color: paperText, fontWeight: 800, mb: 4, fontSize: { xs: 24, md: 32 } }}>
          End-to-End Privacy Workflow
        </Typography>

        <Grid container spacing={2.5} alignItems="center">
          {[
            { step: '01', title: 'User Input', sub: 'Bid Amount + Secret Nonce', icon: LockOutlinedIcon },
            { step: '02', title: 'Local Prover', sub: 'Compact WASM Circuit', icon: CodeRoundedIcon },
            { step: '03', title: 'ZK Proof', sub: 'Cryptographic Commitment', icon: SecurityOutlinedIcon },
            { step: '04', title: 'Midnight Ledger', sub: 'Verified On-Chain State', icon: CheckCircleOutlineRoundedIcon },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={item.step}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${divider}`,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Typography sx={{ ...monoSx, color: redMain, fontSize: 11, fontWeight: 700, mb: 1 }}>
                  STEP {item.step}
                </Typography>
                <item.icon sx={{ fontSize: 28, color: paperText, mb: 1 }} />
                <Typography sx={{ color: paperText, fontWeight: 700, fontSize: 15 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: mutedText, fontSize: 12, mt: 0.5 }}>
                  {item.sub}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* CTA Box */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: 4, md: 5 },
          borderRadius: 4,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${divider}`,
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 800, mb: 1 }}>
            Ready to test private auctions?
          </Typography>
          <Typography sx={{ color: mutedText, fontSize: 14 }}>
            Create a fresh auction room or explore ongoing rooms on Midnight Preprod.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => navigate('/admin')}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ py: 1.2, px: 3, borderRadius: 2.5, background: redMain, fontWeight: 700 }}
          >
            Create Auction
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{ py: 1.2, px: 3, borderRadius: 2.5, borderColor: divider, color: paperText, fontWeight: 600 }}
          >
            Open Dashboard
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};
