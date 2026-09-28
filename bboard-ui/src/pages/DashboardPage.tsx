import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, LinearProgress, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
  return CompiledContract.make('auction', Contract).pipe(CompiledContract.withWitnesses(witnesses), CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString())) as any;
}

const phaseCopy = [
  { label: 'Commit open', detail: 'Submit a sealed offer while the room is accepting bids.' },
  { label: 'Reveal open', detail: 'Prove that your revealed offer matches your commitment.' },
  { label: 'Resolved', detail: 'The room has been finalized on-chain.' },
];

const Surface: React.FC<React.PropsWithChildren<{ sx?: Record<string, unknown> }>> = ({ children, sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)', ...sx }}>
      {children}
    </Paper>
  );
};

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  const { session, isConnected, connect } = useWallet();
  const [searchParams] = useSearchParams();
  const urlAddress = searchParams.get('address');
  const [address, setAddress] = useState(urlAddress || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || '');
  const [contractLedger, setContractLedger] = useState<Ledger | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [localBid, setLocalBid] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const recentAuctions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]'); } catch { return []; }
  }, []);
  const auction = recentAuctions.find((item: any) => item.address === address);
  const title = searchParams.get('title') || auction?.name || 'Private artifact / 01';
  const description = searchParams.get('desc') || auction?.desc || 'A confidential sealed-bid room secured by Midnight.';
  const shareUrl = `${window.location.origin}/dashboard?address=${encodeURIComponent(address)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`;
  const phase = contractLedger ? Number(contractLedger.phase) : 0;
  const currentPhase = phaseCopy[phase] || phaseCopy[0];

  const fetchState = useCallback(async () => {
    if (!session || !address) return;
    setLoadingState(true);
    try {
      const state = await session.providers.publicDataProvider.queryContractState(address);
      setContractLedger(state?.data ? ledger(state.data) : null);
    } catch (error) {
      console.error(error);
      setContractLedger(null);
    } finally { setLoadingState(false); }
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
    const labels: Record<string, string> = { commitBid: 'Sealing your bid', advanceToReveal: 'Opening reveal phase', revealBid: 'Revealing your bid', resolveAuction: 'Resolving auction' };
    setActionStatus({ type: 'info', message: `${labels[action]}. Confirm the transaction in your wallet.` });
    try {
      const walletAddress = session.unshieldedAddress;
      const adminSk = getOrCreateSecret('admin', walletAddress);
      const bidderSk = getOrCreateSecret('bidder', walletAddress);
      const nonce = getOrCreateSecret(`nonce_${address}`, walletAddress);
      const amount = action === 'revealBid' && localBid ? BigInt(localBid) : BigInt(bidAmount || 0);
      const privateState = { auctioneer_secret: adminSk, bidder_secret: bidderSk, bid_amount: amount, bid_nonce: nonce };
      const args: any[] = [];
      if (action === 'commitBid') args.push((pureCircuits as any).computeBidCommitment(amount, nonce));
      const txData = await createUnprovenCallTx(session.providers as any, { contractAddress: address, compiledContract: getCompiledContract(privateState), circuitId: action, args });
      await submitTxAsync(session.providers as any, { unprovenTx: txData.private.unprovenTx });
      if (action === 'commitBid' && bidAmount) { saveUserBid(walletAddress, address, bidAmount); setLocalBid(bidAmount); }
      setActionStatus({ type: 'success', message: `${labels[action]} complete. The room is updating.` });
      setBidAmount('');
      void fetchState();
    } catch (error: any) {
      setActionStatus({ type: 'error', message: error?.message || 'The transaction could not be completed.' });
    }
    window.setTimeout(() => setActionStatus(null), 9000);
  };

  if (!isConnected) return <Container maxWidth="sm" sx={{ py: 14 }}><Surface sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}><LockOutlinedIcon sx={{ color: redMain, fontSize: 32, mb: 2 }} /><Typography variant="h4" sx={{ color: paperText, mb: 1 }}>Enter the auction room</Typography><Typography sx={{ color: mutedText, lineHeight: 1.7, mb: 3 }}>Connect a Midnight wallet to sync the room state and participate in a sealed auction.</Typography><Button variant="contained" onClick={() => connect()} endIcon={<OpenInNewRoundedIcon />}>Connect wallet</Button></Surface></Container>;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 6, md: 9 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'end' }} spacing={3} sx={{ mb: 5 }}>
        <Box><Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>AUCTION ROOM / PRIVATE ACCESS</Typography><Typography variant="h2" sx={{ color: paperText, fontSize: { xs: 42, md: 60 } }}>Participate without broadcasting.</Typography><Typography sx={{ color: mutedText, mt: 1, maxWidth: 590, lineHeight: 1.7 }}>The room state is public. Your sealed offer is not. Keep this tab available through the reveal phase.</Typography></Box>
        <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<ShareOutlinedIcon />} onClick={() => setShareOpen(true)} disabled={!address}>Share room</Button><Button variant="outlined" onClick={() => void fetchState()} disabled={loadingState}>{loadingState ? <CircularProgress size={18} /> : 'Sync state'}</Button></Stack>
      </Stack>

      <Surface sx={{ p: { xs: 2.5, md: 4 }, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'end' }}><TextField fullWidth label="Auction contract address" value={address} onChange={(event) => setAddress(event.target.value)} InputProps={{ sx: { fontFamily: '"DM Mono", monospace', fontSize: 12 } }} /><Button variant="contained" onClick={() => void fetchState()} disabled={loadingState} sx={{ minWidth: 120 }}>Load room</Button></Stack>
      </Surface>

      {!contractLedger && <Surface sx={{ p: { xs: 4, md: 7 }, textAlign: 'center', borderStyle: 'dashed' }}><Typography sx={{ color: mutedText }}>{address ? 'No indexed room state found. Check the address and sync again.' : 'Enter a contract address to load an auction room.'}</Typography></Surface>}

      {contractLedger && <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Surface sx={{ p: { xs: 3, md: 4 }, height: '100%', position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', width: 220, height: 220, border: `1px solid ${isDark ? '#3A3735' : '#D0CDC8'}`, right: -90, bottom: -90, transform: 'rotate(45deg)' } }}>
            <Stack justifyContent="space-between" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="start"><Box><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>ROOM OBJECT</Typography><Typography sx={{ color: paperText, fontSize: 25, mt: 1 }}>{title}</Typography></Box><Chip label={currentPhase.label.toUpperCase()} size="small" sx={{ color: redSoft, border: `1px solid ${redMain}`, background: 'rgba(179,38,45,0.1)' }} /></Stack>
              <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 250, py: 3 }}><Box sx={{ width: 180, height: 180, border: `1px solid ${redMain}`, transform: 'rotate(45deg)', display: 'grid', placeItems: 'center', background: 'rgba(179,38,45,0.06)' }}><LockOutlinedIcon sx={{ color: redSoft, fontSize: 38, transform: 'rotate(-45deg)' }} /></Box></Box>
              <Box><Typography sx={{ color: mutedText, lineHeight: 1.65, fontSize: 14, mb: 2 }}>{description}</Typography><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, wordBreak: 'break-all' }}>{address}</Typography></Box>
            </Stack>
          </Surface>
        </Grid>
        <Grid item xs={12} md={7}>
          <Surface sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 4 }}><Box><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>ROOM STATUS</Typography><Typography variant="h4" sx={{ color: paperText, mt: 1 }}>{currentPhase.label}</Typography><Typography sx={{ color: mutedText, mt: 0.7, fontSize: 14 }}>{currentPhase.detail}</Typography></Box><Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11 }}>ROUND {contractLedger.round.toString().padStart(2, '0')}</Typography></Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 4 }}>{['Commit', 'Reveal', 'Resolve'].map((label, index) => <Box key={label} sx={{ borderTop: `3px solid ${index <= phase ? redMain : (isDark ? '#3A3735' : '#D0CDC8')}`, pt: 1.5 }}><Typography sx={{ color: index <= phase ? paperText : mutedText, fontSize: 13 }}>{label}</Typography><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, mt: 0.5 }}>{index < phase ? 'COMPLETE' : index === phase ? 'CURRENT' : 'LOCKED'}</Typography></Box>)}</Box>
            <Grid container spacing={1.5} sx={{ mb: 4 }}><Grid item xs={6}><Metric label="Highest revealed" value={contractLedger.highest_bid.toString()} suffix="TOK" /></Grid><Grid item xs={6}><Metric label="Your local bid" value={localBid ? 'SAVED' : 'NONE'} suffix="" /></Grid></Grid>
            {actionStatus && <Box sx={{ p: 2, border: `1px solid ${actionStatus.type === 'error' ? '#8F3439' : redMain}`, background: actionStatus.type === 'error' ? 'rgba(179,38,45,0.12)' : 'rgba(179,38,45,0.08)', mb: 3 }}><Stack direction="row" spacing={1.5} alignItems="center">{actionStatus.type === 'info' ? <CircularProgress size={16} sx={{ color: redSoft }} /> : <CheckCircleOutlineRoundedIcon sx={{ color: redSoft, fontSize: 18 }} />}<Typography sx={{ color: actionStatus.type === 'error' ? redSoft : paperText, fontSize: 13 }}>{actionStatus.message}</Typography></Stack>{actionStatus.type === 'success' && <Button href={`https://preprod.midnightexplorer.com/contracts/${address}`} target="_blank" endIcon={<OpenInNewRoundedIcon />} sx={{ color: redSoft, p: 0, mt: 1 }}>View transaction context</Button>}</Box>}
            {phase === 0 && <Box><Typography sx={{ color: paperText, fontSize: 20, mb: 1 }}>Place a sealed bid</Typography><Typography sx={{ color: mutedText, fontSize: 14, lineHeight: 1.6, mb: 2 }}>The amount is committed to the room as a cryptographic hash. Save the local receipt before leaving.</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><TextField fullWidth label="Private bid amount" value={bidAmount} onChange={(event) => setBidAmount(event.target.value.replace(/[^0-9]/g, ''))} /><Button variant="contained" onClick={() => void handleAction('commitBid')} disabled={!bidAmount}>Seal bid</Button></Stack></Box>}
            {phase === 1 && <Box><Typography sx={{ color: paperText, fontSize: 20, mb: 1 }}>Reveal your bid</Typography><Typography sx={{ color: mutedText, fontSize: 14, lineHeight: 1.6, mb: 2 }}>{localBid ? `A private receipt for ${localBid} TOK is available on this device.` : 'No local receipt was found. Restore your private bid before continuing.'}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><Button variant="contained" onClick={() => void handleAction('revealBid')} disabled={!localBid}>Reveal and prove</Button>{localBid && <Button variant="outlined" onClick={downloadBackup}>Export receipt</Button>}</Stack></Box>}
            {phase === 2 && <Box sx={{ border: `1px solid ${redMain}`, p: 2.5, background: 'rgba(179,38,45,0.08)' }}><Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>ROOM RESOLVED</Typography><Typography sx={{ color: paperText, fontSize: 26, mt: 1 }}>{contractLedger.highest_bid.toString()} TOK</Typography><Typography sx={{ color: mutedText, fontSize: 13, mt: 0.5 }}>Final highest revealed bid recorded by the contract.</Typography></Box>}
            <Divider sx={{ borderColor: divider, my: 4 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><Button variant="outlined" disabled={phase !== 0} onClick={() => void handleAction('advanceToReveal')}>Open reveal phase</Button><Button variant="outlined" disabled={phase !== 1} onClick={() => void handleAction('resolveAuction')}>Resolve room</Button></Stack>
          </Surface>
        </Grid>
      </Grid>}

      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ color: paperText }}>Share this auction room</DialogTitle><DialogContent><Typography sx={{ color: mutedText, lineHeight: 1.7, mb: 2 }}>Send this link to participants. The contract address is public, while each bid remains private until reveal.</Typography><TextField fullWidth value={shareUrl} InputProps={{ readOnly: true, sx: { fontFamily: '"DM Mono", monospace', fontSize: 12 } }} /></DialogContent><DialogActions><Button onClick={() => setShareOpen(false)}>Close</Button><Button variant="contained" startIcon={<ContentCopyOutlinedIcon />} onClick={() => { void navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}>{copied ? 'Copied' : 'Copy link'}</Button></DialogActions></Dialog>
    </Container>
  );
};

const Metric: React.FC<{ label: string; value: string; suffix: string }> = ({ label, value, suffix }) => {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${theme.palette.divider}`, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }}>
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>{label}</Typography>
      <Typography sx={{ color: theme.palette.text.primary, fontFamily: '"DM Mono", monospace', fontSize: 20, mt: 1 }}>{value} <Box component="span" sx={{ color: theme.palette.text.secondary, fontSize: 10 }}>{suffix}</Box></Typography>
    </Box>
  );
};
