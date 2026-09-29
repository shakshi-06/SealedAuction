import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import { useSearchParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Contract, ledger, Ledger, pureCircuits } from '../managed/contract/index.js';
import { getOrCreateSecret, getUserBid, saveUserBid } from '../utils/secrets';

function getCompiledContract(privateState?: any) {
  const witnesses = {
    auctioneer_secret: ({ privateState: current }: any) => [current, privateState?.auctioneer_secret ?? new Uint8Array(32)],
    bidder_secret: ({ privateState: current }: any) => [current, privateState?.bidder_secret ?? new Uint8Array(32)],
    bid_amount: ({ privateState: current }: any) => [current, privateState?.bid_amount ?? 0n],
    bid_nonce: ({ privateState: current }: any) => [current, privateState?.bid_nonce ?? new Uint8Array(32)],
  };
  return CompiledContract.make('auction', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString())
  ) as any;
}

const phaseCopy = [
  { label: 'Commit Phase Open', detail: 'Submit a ZK-sealed bid while the room is accepting private offers.' },
  { label: 'Reveal Phase Open', detail: 'Prove that your revealed bid matches your on-chain commitment.' },
  { label: 'Auction Resolved', detail: 'The room has been finalized on-chain and winner resolved.' },
];

const Surface: React.FC<React.PropsWithChildren<{ sx?: Record<string, unknown> }>> = ({ children, sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3.5,
        boxShadow: isDark ? 'none' : '0 12px 30px rgba(91, 52, 40, 0.05)',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const { session, isConnected, connect } = useWallet();

  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  const urlAddress = searchParams.get('address');
  const [address, setAddress] = useState(urlAddress || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || '');
  const [contractLedger, setContractLedger] = useState<any | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [localBid, setLocalBid] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const recentAuctions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
    } catch {
      return [];
    }
  }, []);

  const myCreatedRooms = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('MY_CREATED_ROOMS') || '[]');
    } catch {
      return [];
    }
  }, []);

  const auction = recentAuctions.find((item: any) => item.address === address);
  const title = searchParams.get('title') || auction?.name || 'Zero-Knowledge Artifact';
  const description = searchParams.get('desc') || auction?.desc || 'A confidential sealed-bid room secured by Midnight.';
  const shareUrl = `${window.location.origin}/dashboard?address=${encodeURIComponent(address)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`;
  const phase = contractLedger ? Number(contractLedger.phase) : 0;
  const currentPhase = phaseCopy[phase] || phaseCopy[0];

  // Determine if the current user is the room creator / admin
  const isRoomAdmin = useMemo(() => {
    if (!address) return false;
    const defaultDeployed = localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS');
    return address === defaultDeployed || myCreatedRooms.includes(address);
  }, [address, myCreatedRooms]);

  const fetchState = useCallback(async () => {
    if (!session || !address) return;
    setLoadingState(true);
    try {
      const state = await session.providers.publicDataProvider.queryContractState(address);
      setContractLedger(state?.data ? ledger(state.data) : null);
    } catch (error) {
      console.error(error);
      setContractLedger(null);
    } finally {
      setLoadingState(false);
    }
  }, [session, address]);

  useEffect(() => {
    if (!session || !address) return;
    void fetchState();
    const interval = window.setInterval(fetchState, 5000);
    const savedBid = getUserBid(session.unshieldedAddress, address);
    if (savedBid) setLocalBid(savedBid);
    return () => window.clearInterval(interval);
  }, [session, address, fetchState]);

  const downloadBackup = () => {
    if (!localBid || !session) return;
    const adminSk = getOrCreateSecret('admin', session.unshieldedAddress);
    const bidderSk = getOrCreateSecret('bidder', session.unshieldedAddress);
    const nonce = getOrCreateSecret(`nonce_${address}`, session.unshieldedAddress);
    const backup = {
      address,
      bidAmount: localBid,
      secrets: {
        adminSk: Array.from(adminSk),
        bidderSk: Array.from(bidderSk),
        nonce: Array.from(nonce),
      },
      note: 'Keep this file private. It is required to reveal the bid.',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sealed-bid-${address.slice(0, 8)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleAction = async (action: 'commitBid' | 'advanceToReveal' | 'revealBid' | 'resolveAuction') => {
    if (!session || !address) return;

    // Strict validation: Only room admin can advance phase or resolve auction
    if ((action === 'advanceToReveal' || action === 'resolveAuction') && !isRoomAdmin) {
      setActionStatus({
        type: 'error',
        message: 'Only the auction room admin (creator) has permission to advance phases or resolve this auction.',
      });
      return;
    }

    const labels: Record<string, string> = {
      commitBid: 'Sealing your bid',
      advanceToReveal: 'Opening reveal phase',
      revealBid: 'Revealing your bid',
      resolveAuction: 'Resolving auction',
    };

    setActionStatus({ type: 'info', message: `${labels[action]}. Confirm transaction in your wallet.` });

    try {
      const walletAddress = session.unshieldedAddress;
      const adminSk = getOrCreateSecret('admin', walletAddress);
      const bidderSk = getOrCreateSecret('bidder', walletAddress);
      const nonce = getOrCreateSecret(`nonce_${address}`, walletAddress);

      // Explicitly pull stored localBid if in reveal phase
      const targetAmount = action === 'revealBid' ? (localBid || bidAmount) : bidAmount;
      const amount = BigInt(targetAmount || 0);

      const privateState = {
        auctioneer_secret: adminSk,
        bidder_secret: bidderSk,
        bid_amount: amount,
        bid_nonce: nonce,
      };

      const args: any[] = [];
      if (action === 'commitBid') {
        args.push((pureCircuits as any).computeBidCommitment(amount, nonce));
      }

      const txData = await createUnprovenCallTx(session.providers as any, {
        contractAddress: address,
        compiledContract: getCompiledContract(privateState),
        circuitId: action,
        args,
      });

      await submitTxAsync(session.providers as any, { unprovenTx: txData.private.unprovenTx });

      if (action === 'commitBid' && bidAmount) {
        saveUserBid(walletAddress, address, bidAmount);
        setLocalBid(bidAmount);
      }

      setActionStatus({ type: 'success', message: `${labels[action]} complete. The room is updating.` });
      setBidAmount('');
      void fetchState();
    } catch (error: any) {
      setActionStatus({ type: 'error', message: error?.message || 'The transaction could not be completed.' });
    }
    window.setTimeout(() => setActionStatus(null), 9000);
  };

  if (!isConnected) {
    return (
      <Container maxWidth="sm" sx={{ py: 14 }}>
        <Surface sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <LockOutlinedIcon sx={{ color: redMain, fontSize: 36, mb: 2 }} />
          <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, mb: 1 }}>
            Enter the auction room
          </Typography>
          <Typography sx={{ color: mutedText, lineHeight: 1.7, mb: 3.5, fontSize: 14 }}>
            Connect a Midnight wallet to sync the room state and participate in a sealed auction.
          </Typography>
          <Button
            variant="contained"
            onClick={() => connect()}
            endIcon={<OpenInNewRoundedIcon />}
            sx={{ py: 1.2, px: 3.5, borderRadius: 2.5, background: redMain, fontWeight: 700 }}
          >
            Connect wallet
          </Button>
        </Surface>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      {/* Header Banner */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: redMain, letterSpacing: '0.14em', fontWeight: 700 }}>
              AUCTION ROOM / PRIVATE ACCESS
            </Typography>
            {isRoomAdmin && (
              <Chip
                icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: '13px !important', color: `${redSoft} !important` }} />}
                label="ROOM ADMIN"
                size="small"
                sx={{ fontFamily: '"DM Mono", monospace', fontSize: 9, fontWeight: 700, color: redSoft, borderColor: redMain }}
                variant="outlined"
              />
            )}
          </Stack>
          <Typography variant="h2" sx={{ color: paperText, fontSize: { xs: 32, md: 48 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Participate without broadcasting.
          </Typography>
          <Typography sx={{ color: mutedText, mt: 1, maxWidth: 620, lineHeight: 1.65, fontSize: 14.5 }}>
            The room state is public on Midnight Preprod. Your bid amount remains private. Keep this tab available through the reveal phase.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ShareOutlinedIcon />}
            onClick={() => setShareOpen(true)}
            disabled={!address}
            sx={{ borderRadius: 2.5, px: 2, py: 1, fontSize: 13, borderColor: divider, color: paperText }}
          >
            Share room
          </Button>
          <Button
            variant="outlined"
            onClick={() => void fetchState()}
            disabled={loadingState}
            sx={{ borderRadius: 2.5, px: 2, py: 1, fontSize: 13, borderColor: divider, color: paperText }}
          >
            {loadingState ? <CircularProgress size={18} /> : 'Sync state'}
          </Button>
        </Stack>
      </Stack>

      {/* Contract Address Search Bar */}
      <Surface sx={{ p: { xs: 2.5, md: 3 }, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            label="Auction contract address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter Midnight contract hex address..."
            InputProps={{
              sx: { fontFamily: '"DM Mono", monospace', fontSize: 12, borderRadius: 2.5 },
            }}
          />
          <Button
            variant="contained"
            onClick={() => void fetchState()}
            disabled={loadingState}
            sx={{ minWidth: 130, height: 50, borderRadius: 2.5, background: redMain, fontWeight: 700 }}
          >
            Load room
          </Button>
        </Stack>
      </Surface>

      {!contractLedger && (
        <Surface sx={{ p: { xs: 5, md: 8 }, textAlign: 'center', borderStyle: 'dashed' }}>
          <Typography sx={{ color: mutedText, fontSize: 15 }}>
            {address ? 'No indexed room state found. Check the address and sync again.' : 'Enter a contract address to load an auction room.'}
          </Typography>
        </Surface>
      )}

      {contractLedger && (
        <Grid container spacing={3.5} alignItems="stretch">
          {/* Room Object Card */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Surface
              sx={{
                p: { xs: 3.5, md: 4 },
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700 }}>
                      ROOM OBJECT
                    </Typography>
                    <Typography sx={{ color: paperText, fontSize: 24, fontWeight: 800, mt: 0.5 }}>
                      {title}
                    </Typography>
                  </Box>
                  <Chip
                    label={currentPhase.label.toUpperCase()}
                    size="small"
                    sx={{ color: redSoft, border: `1px solid ${redMain}`, background: 'rgba(179,38,45,0.1)', fontFamily: '"DM Mono", monospace', fontSize: 9, fontWeight: 700 }}
                  />
                </Stack>

                <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 220, py: 2 }}>
                  <Box
                    sx={{
                      width: 160,
                      height: 160,
                      border: `1px solid ${redMain}`,
                      transform: 'rotate(45deg)',
                      display: 'grid',
                      placeItems: 'center',
                      background: isDark ? 'rgba(179,38,45,0.08)' : 'rgba(179,38,45,0.04)',
                    }}
                  >
                    <LockOutlinedIcon sx={{ color: redSoft, fontSize: 36, transform: 'rotate(-45deg)' }} />
                  </Box>
                </Box>

                <Typography sx={{ color: mutedText, lineHeight: 1.6, fontSize: 13.5, mb: 2 }}>
                  {description}
                </Typography>
              </Box>

              <Box sx={{ pt: 2, borderTop: `1px solid ${divider}` }}>
                <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, wordBreak: 'break-all' }}>
                  {address}
                </Typography>
              </Box>
            </Surface>
          </Grid>

          {/* Room Status & Controls */}
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Surface sx={{ p: { xs: 3.5, md: 4 }, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700 }}>
                      ROOM STATUS
                    </Typography>
                    <Typography variant="h4" sx={{ color: paperText, fontWeight: 800, mt: 0.5 }}>
                      {currentPhase.label}
                    </Typography>
                    <Typography sx={{ color: mutedText, mt: 0.5, fontSize: 13.5 }}>
                      {currentPhase.detail}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11, fontWeight: 700 }}>
                    ROUND {contractLedger.round.toString().padStart(2, '0')}
                  </Typography>
                </Stack>

                {/* Stepper Progress */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 4 }}>
                  {['Commit', 'Reveal', 'Resolve'].map((label, index) => (
                    <Box
                      key={label}
                      sx={{
                        borderTop: `3px solid ${index <= phase ? redMain : divider}`,
                        pt: 1.5,
                      }}
                    >
                      <Typography sx={{ color: index <= phase ? paperText : mutedText, fontSize: 13, fontWeight: 700 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 9.5, mt: 0.3, fontWeight: 600 }}>
                        {index < phase ? 'COMPLETE' : index === phase ? 'CURRENT' : 'LOCKED'}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Metrics Grid */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Metric label="Highest Revealed Bid" value={contractLedger.highest_bid.toString()} suffix="TOK" />
                  </Grid>
                  <Grid item xs={6}>
                    <Metric label="Your Sealed Local Bid" value={localBid ? `${localBid} TOK` : 'NONE'} suffix="" />
                  </Grid>
                </Grid>

                {/* Status Alert Banner */}
                {actionStatus && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `1px solid ${actionStatus.type === 'error' ? '#8F3439' : redMain}`,
                      background: actionStatus.type === 'error' ? 'rgba(179,38,45,0.12)' : 'rgba(179,38,45,0.08)',
                      mb: 3.5,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {actionStatus.type === 'info' ? (
                        <CircularProgress size={18} sx={{ color: redSoft }} />
                      ) : (
                        <CheckCircleOutlineRoundedIcon sx={{ color: redSoft, fontSize: 20 }} />
                      )}
                      <Typography sx={{ color: actionStatus.type === 'error' ? redSoft : paperText, fontSize: 13.5, fontWeight: 600 }}>
                        {actionStatus.message}
                      </Typography>
                    </Stack>
                    {actionStatus.type === 'success' && (
                      <Button
                        href={`https://preprod.midnightexplorer.com/contracts/${address}`}
                        target="_blank"
                        endIcon={<OpenInNewRoundedIcon />}
                        sx={{ color: redSoft, p: 0, mt: 1, fontSize: 12 }}
                      >
                        View transaction context
                      </Button>
                    )}
                  </Box>
                )}

                {/* Phase 0: Place Sealed Bid */}
                {phase === 0 && (
                  <Box sx={{ p: 3, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}` }}>
                    <Typography sx={{ color: paperText, fontSize: 18, fontWeight: 700, mb: 0.8 }}>
                      Place a sealed bid
                    </Typography>
                    <Typography sx={{ color: mutedText, fontSize: 13, lineHeight: 1.6, mb: 2.5 }}>
                      The amount is committed as a cryptographic hash on Midnight. Your plaintext amount is stored locally on this device.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <TextField
                        fullWidth
                        label="Private bid amount"
                        value={bidAmount}
                        onChange={(event) => setBidAmount(event.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 142"
                        InputProps={{
                          sx: { borderRadius: 2.5 },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => void handleAction('commitBid')}
                        disabled={!bidAmount}
                        sx={{ px: 3.5, height: 56, borderRadius: 2.5, background: redMain, fontWeight: 700, minWidth: 130 }}
                      >
                        Seal bid
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Phase 1: Reveal Bid */}
                {phase === 1 && (
                  <Box sx={{ p: 3, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divider}` }}>
                    <Typography sx={{ color: paperText, fontSize: 18, fontWeight: 700, mb: 0.8 }}>
                      Reveal your bid
                    </Typography>
                    <Typography sx={{ color: mutedText, fontSize: 13, lineHeight: 1.6, mb: 2.5 }}>
                      {localBid
                        ? `A private receipt for ${localBid} TOK is stored locally. Reveal to prove your bid on-chain.`
                        : 'No local bid receipt was found on this device.'}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        variant="contained"
                        onClick={() => void handleAction('revealBid')}
                        disabled={!localBid}
                        sx={{ py: 1.2, px: 3, borderRadius: 2.5, background: redMain, fontWeight: 700 }}
                      >
                        Reveal and prove bid
                      </Button>
                      {localBid && (
                        <Button
                          variant="outlined"
                          onClick={downloadBackup}
                          startIcon={<DownloadOutlinedIcon />}
                          sx={{ py: 1.2, px: 2.5, borderRadius: 2.5, borderColor: divider, color: paperText }}
                        >
                          Export receipt
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Phase 2: Resolved */}
                {phase === 2 && (
                  <Box sx={{ border: `1px solid ${redMain}`, borderRadius: 3, p: 3, background: 'rgba(179,38,45,0.08)' }}>
                    <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em', fontWeight: 700 }}>
                      ROOM RESOLVED
                    </Typography>
                    <Typography sx={{ color: paperText, fontSize: 32, fontWeight: 800, mt: 0.5 }}>
                      {contractLedger.highest_bid.toString()} TOK
                    </Typography>
                    <Typography sx={{ color: mutedText, fontSize: 13, mt: 0.5 }}>
                      Final highest revealed winning bid recorded on the Midnight contract ledger.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Admin Actions Bar */}
              <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${divider}` }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <AdminPanelSettingsOutlinedIcon sx={{ color: isRoomAdmin ? redMain : mutedText, fontSize: 16 }} />
                  <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: isRoomAdmin ? redMain : mutedText, fontWeight: 700, letterSpacing: '0.1em' }}>
                    ADMIN ACTIONS (AUCTIONEER ONLY)
                  </Typography>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Tooltip title={!isRoomAdmin ? 'Only the room creator / admin can open reveal phase' : ''}>
                    <span>
                      <Button
                        variant="outlined"
                        disabled={phase !== 0 || !isRoomAdmin}
                        onClick={() => void handleAction('advanceToReveal')}
                        sx={{ borderRadius: 2.5, px: 2.5, py: 1, fontSize: 12.5, fontWeight: 600, borderColor: divider, color: paperText }}
                      >
                        Open reveal phase
                      </Button>
                    </span>
                  </Tooltip>

                  <Tooltip title={!isRoomAdmin ? 'Only the room creator / admin can resolve the auction' : ''}>
                    <span>
                      <Button
                        variant="outlined"
                        disabled={phase !== 1 || !isRoomAdmin}
                        onClick={() => void handleAction('resolveAuction')}
                        sx={{ borderRadius: 2.5, px: 2.5, py: 1, fontSize: 12.5, fontWeight: 600, borderColor: divider, color: paperText }}
                      >
                        Resolve room
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            </Surface>
          </Grid>
        </Grid>
      )}

      {/* Share Room & QR Code Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}>
        <DialogTitle sx={{ color: paperText, fontWeight: 800, textAlign: 'center', pt: 2 }}>
          Share Auction Room
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: mutedText, fontSize: 13, mb: 3 }}>
            Scan QR code or copy link to join this sealed auction.
          </Typography>

          {/* QR Code Container */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: '#FFFFFF',
              display: 'inline-block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              mb: 3,
              border: `1px solid ${divider}`,
            }}
          >
            <Box
              component="img"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
              alt="Room QR Code"
              sx={{ width: 180, height: 180, display: 'block' }}
            />
          </Box>

          <TextField
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: '"DM Mono", monospace', fontSize: 11, borderRadius: 2 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setShareOpen(false)} sx={{ color: mutedText }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={copied ? <CheckCircleOutlineRoundedIcon /> : <ContentCopyOutlinedIcon />}
            onClick={() => {
              void navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }}
            sx={{ background: redMain, borderRadius: 2, px: 2.5, fontWeight: 700 }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const Metric: React.FC<{ label: string; value: string; suffix: string }> = ({ label, value, suffix }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2.2,
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
      }}
    >
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ color: theme.palette.text.primary, fontFamily: '"DM Mono", monospace', fontSize: 22, fontWeight: 700, mt: 0.8 }}>
        {value} <Box component="span" sx={{ color: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }}>{suffix}</Box>
      </Typography>
    </Box>
  );
};
