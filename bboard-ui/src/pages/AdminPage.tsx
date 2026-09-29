import React, { useCallback, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { getOrCreateSecret } from '../utils/secrets';
import { AddressHash } from '../components';

function getCompiledContract(state?: any) {
  const witnesses = {
    auctioneer_secret: ({ privateState }: any) => [privateState, state?.auctioneer_secret ?? new Uint8Array(32)],
    bidder_secret: ({ privateState }: any) => [privateState, state?.bidder_secret ?? new Uint8Array(32)],
    bid_amount: ({ privateState }: any) => [privateState, state?.bid_amount ?? 0n],
    bid_nonce: ({ privateState }: any) => [privateState, state?.bid_nonce ?? new Uint8Array(32)],
  };
  return CompiledContract.make('auction', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

const defaultTitle = 'Zero-Knowledge Artifact';
const defaultDescription = 'A cryptographically sealed asset available for auction on Midnight.';
const monoSx = { fontFamily: '"DM Mono", monospace' };

export const AdminPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  const panelSx = {
    border: `1px solid ${divider}`,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.015)',
    boxShadow: isDark ? 'none' : '0 12px 32px rgba(91, 52, 40, 0.05)',
    backdropFilter: 'blur(12px)',
    overflow: 'hidden',
  };

  const { session, isConnected, connect, isConnecting } = useWallet();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleDeploy = useCallback(async () => {
    if (!session || !isConnected) return;
    setStatus('deploying');
    setErrorMsg(null);
    try {
      const adminSk = getOrCreateSecret('admin', session.unshieldedAddress);
      const compiledContract = getCompiledContract({ auctioneer_secret: adminSk });
      const adminHash = (pureCircuits as any).auctioneer_key(adminSk);

      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract,
        args: [adminHash],
        signingKey: sampleSigningKey(),
      });
      const contractAddress = deployTxData.public.contractAddress;

      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      setDeployedAddress(contractAddress);
      localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', contractAddress);
      try {
        const myRooms = JSON.parse(localStorage.getItem('MY_CREATED_ROOMS') || '[]');
        myRooms.unshift(contractAddress);
        localStorage.setItem('MY_CREATED_ROOMS', JSON.stringify(myRooms));
      } catch (_e) {}

      try {
        const existing = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
        existing.unshift({
          address: contractAddress,
          name: title || defaultTitle,
          desc: desc || defaultDescription,
          deployedAt: Date.now(),
        });
        localStorage.setItem('RECENT_AUCTIONS', JSON.stringify(existing.slice(0, 20)));
      } catch (_error) {
        // Deployment succeeded even if local feed storage fails.
      }

      setStatus('deployed');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error?.message ?? String(error));
    }
  }, [session, isConnected, title, desc]);

  const handleCopy = useCallback(() => {
    if (!deployedAddress) return;
    void navigator.clipboard.writeText(deployedAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [deployedAddress]);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 10, md: 16 } }}>
      {/* Header Banner */}
      <Box sx={{ maxWidth: 840, mb: { xs: 6, md: 8 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
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
            ADMIN / AUCTION ROOM CREATION
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
          Make the room before the bidding begins.
        </Typography>
        <Typography sx={{ color: mutedText, fontSize: { xs: 15, md: 18 }, lineHeight: 1.65, maxWidth: 680 }}>
          Configure a sealed-bid auction, review its public presentation, then deploy a fresh smart contract to Midnight Preprod.
        </Typography>
      </Box>

      {/* Main Form & Preview Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
          gap: { xs: 3, md: 4 },
          alignItems: 'start',
        }}
      >
        {/* Left Column: Form & Step Workflow */}
        <Paper sx={{ ...panelSx, p: { xs: 3.5, sm: 5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box>
              <Typography sx={{ ...monoSx, color: redMain, fontSize: 10, letterSpacing: '0.13em', fontWeight: 700, mb: 0.5 }}>
                DEPLOYMENT BRIEF
              </Typography>
              <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Create an auction
              </Typography>
            </Box>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                background: isDark ? 'rgba(217,74,66,0.1)' : 'rgba(217,74,66,0.06)',
                border: `1px solid ${redMain}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOutlinedIcon sx={{ color: redSoft, fontSize: 22 }} />
            </Box>
          </Stack>

          {/* Workflow Steps Indicator */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4.5 }}>
            {[
              ['01', 'Describe', 'Name the room.'],
              ['02', 'Review', 'Check the public card.'],
              ['03', 'Deploy', 'Publish on Preprod.'],
            ].map(([number, label, detail], index) => {
              const isCurrent = (status === 'idle' || status === 'error') && index === 0;
              const isDeploying = status === 'deploying' && index === 2;
              const isDone = status === 'deployed';

              return (
                <Box
                  key={number}
                  sx={{
                    borderTop: `2.5px solid ${isCurrent || isDeploying || isDone ? redMain : divider}`,
                    pt: 1.8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    sx={{
                      ...monoSx,
                      color: isCurrent || isDeploying || isDone ? redMain : mutedText,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {number}
                  </Typography>
                  <Typography sx={{ color: paperText, mt: 0.5, fontWeight: 700, fontSize: 14 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: mutedText, fontSize: 12, mt: 0.3 }}>
                    {detail}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Creation Form */}
          {(status === 'idle' || status === 'error') && (
            <Box component="form" onSubmit={(event) => { event.preventDefault(); void handleDeploy(); }} sx={{ display: 'grid', gap: 3 }}>
              <Box>
                <Typography sx={{ color: paperText, fontSize: 13, fontWeight: 600, mb: 1 }}>
                  Auction title
                </Typography>
                <TextField
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="For example, 17th Century Gold Coin Artifact"
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ color: paperText, fontSize: 13, fontWeight: 600, mb: 1 }}>
                  Description & Information
                </Typography>
                <TextField
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                  placeholder="Provide details for prospective bidders regarding bid timeline, item asset details, or terms."
                  multiline
                  minRows={4}
                  fullWidth
                  inputProps={{ maxLength: 300 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Box>

              <Typography sx={{ color: mutedText, fontSize: 12.5, lineHeight: 1.6 }}>
                Titles and descriptions are editorial room labels stored locally in your browser workspace feed.
              </Typography>

              <Box sx={{ pt: 1 }}>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    onClick={() => void connect('preprod')}
                    disabled={isConnecting}
                    startIcon={isConnecting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
                    size="large"
                    sx={{
                      py: 1.2,
                      px: 3.5,
                      borderRadius: 2.5,
                      fontSize: 14,
                      fontWeight: 700,
                      background: redMain,
                      '&:hover': { background: '#c23b34' },
                    }}
                  >
                    {isConnecting ? 'Connecting wallet' : 'Connect wallet to deploy'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<RocketLaunchOutlinedIcon />}
                    size="large"
                    sx={{
                      py: 1.2,
                      px: 3.5,
                      borderRadius: 2.5,
                      fontSize: 14,
                      fontWeight: 700,
                      background: redMain,
                      '&:hover': { background: '#c23b34' },
                    }}
                  >
                    Deploy room to Preprod
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Deployment Loading State */}
          {status === 'deploying' && (
            <Box
              sx={{
                border: `1px solid ${redMain}`,
                borderRadius: 3,
                p: 3.5,
                display: 'flex',
                gap: 2.5,
                alignItems: 'center',
                background: isDark ? 'rgba(217,74,66,0.08)' : 'rgba(217,74,66,0.04)',
              }}
            >
              <CircularProgress size={22} sx={{ color: redSoft }} />
              <Box>
                <Typography sx={{ color: paperText, fontWeight: 700, fontSize: 15, mb: 0.5 }}>
                  Submitting transaction to Midnight Preprod...
                </Typography>
                <Typography sx={{ color: mutedText, fontSize: 13 }}>
                  Please approve the deployment in your wallet window to publish the contract.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Deployment Error State */}
          {status === 'error' && errorMsg && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: 2.5,
                backgroundColor: 'rgba(179,38,45,0.12)',
                color: paperText,
                border: '1px solid rgba(179,38,45,0.3)',
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Deployment failed</Typography>
              <Typography sx={{ ...monoSx, fontSize: 11.5, wordBreak: 'break-word' }}>{errorMsg}</Typography>
            </Alert>
          )}

          {/* Deployment Success State */}
          {status === 'deployed' && deployedAddress && (
            <Box
              sx={{
                border: `1px solid ${redMain}`,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                backgroundColor: isDark ? 'rgba(217,74,66,0.1)' : 'rgba(217,74,66,0.05)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <CheckCircleOutlineRoundedIcon sx={{ color: redSoft, fontSize: 20 }} />
                <Typography sx={{ ...monoSx, color: redMain, fontSize: 11, letterSpacing: '0.13em', fontWeight: 700 }}>
                  DEPLOYMENT SUBMITTED SUCCESSFULLY
                </Typography>
              </Stack>
              <Typography sx={{ color: paperText, fontSize: 20, fontWeight: 800, mb: 2 }}>
                Your auction contract is live.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: mutedText, fontSize: 12, mb: 1 }}>Contract Address:</Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    border: `1px solid ${divider}`,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    p: 1.5,
                  }}
                >
                  <Typography sx={{ ...monoSx, color: paperText, fontSize: 12, wordBreak: 'break-all', flexGrow: 1 }}>
                    {deployedAddress}
                  </Typography>
                  <Tooltip title={copied ? 'Copied' : 'Copy address'}>
                    <IconButton onClick={handleCopy} aria-label="Copy contract address" size="small">
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  href={`/dashboard?address=${deployedAddress}&title=${encodeURIComponent(title || defaultTitle)}&desc=${encodeURIComponent(desc || defaultDescription)}`}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ py: 1, px: 2.5, borderRadius: 2, background: redMain }}
                >
                  Open Dashboard
                </Button>
                <Button
                  variant="outlined"
                  href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<LaunchOutlinedIcon />}
                  sx={{ py: 1, px: 2.5, borderRadius: 2, borderColor: divider, color: paperText }}
                >
                  View on Explorer
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Right Column: Live Preview & Guidance */}
        <Box sx={{ display: 'grid', gap: 3 }}>
          {/* Live Preview Card */}
          <Paper sx={{ ...panelSx, p: { xs: 3, md: 3.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography sx={{ ...monoSx, color: redMain, fontSize: 10, letterSpacing: '0.13em', fontWeight: 700 }}>
                LIVE PREVIEW / PUBLIC CARD
              </Typography>
              <Chip
                label="Preview"
                size="small"
                sx={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 9,
                  height: 20,
                  fontWeight: 700,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}
              />
            </Stack>

            {/* Simulated Card Surface */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${divider}`,
                background: theme.palette.background.paper,
                mb: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: redMain,
                    background: isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.08)',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Sealed Auction
                </Typography>
                <LockOutlinedIcon sx={{ fontSize: 15, color: mutedText, opacity: 0.6 }} />
              </Stack>

              <Typography sx={{ color: paperText, fontSize: 18, fontWeight: 700, mb: 1, lineHeight: 1.35 }}>
                {title.trim() || defaultTitle}
              </Typography>

              <Typography sx={{ color: mutedText, fontSize: 13, lineHeight: 1.6, minHeight: 48, mb: 2, overflowWrap: 'anywhere' }}>
                {desc.trim() || defaultDescription}
              </Typography>

              <Box sx={{ pt: 1 }}>
                <AddressHash address={deployedAddress || '32da60bb68a1aaf7e81552b4af29b0b88848e96154a373bee'} />
              </Box>
            </Paper>

            {/* Spec Details List */}
            <Box sx={{ borderTop: `1px solid ${divider}`, pt: 2.5, display: 'grid', gap: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: mutedText, fontSize: 12, fontWeight: 500 }}>Target Network</Typography>
                <Typography sx={{ ...monoSx, color: paperText, fontSize: 11, fontWeight: 600 }}>MIDNIGHT PREPROD</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: mutedText, fontSize: 12, fontWeight: 500 }}>Initial Phase</Typography>
                <Typography sx={{ ...monoSx, color: redSoft, fontSize: 11, fontWeight: 700 }}>COMMIT PHASE</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: mutedText, fontSize: 12, fontWeight: 500 }}>Bid Privacy</Typography>
                <Typography sx={{ ...monoSx, color: paperText, fontSize: 11, fontWeight: 600 }}>ZK-SEALED</Typography>
              </Stack>
            </Box>
          </Paper>

          {/* Network Guidance Box */}
          <Paper sx={{ ...panelSx, p: { xs: 3, md: 3.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <InfoOutlinedIcon sx={{ color: redMain, fontSize: 18 }} />
              <Typography sx={{ ...monoSx, color: redMain, fontSize: 10, letterSpacing: '0.13em', fontWeight: 700 }}>
                NETWORK NOTE
              </Typography>
            </Stack>
            <Typography sx={{ color: paperText, lineHeight: 1.65, fontSize: 13.5 }}>
              Deployments use your connected wallet to sign on Midnight Preprod. Contract state is publicly verifiable while individual bid choices remain hidden.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};
