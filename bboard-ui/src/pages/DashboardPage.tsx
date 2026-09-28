import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress, Chip, Stack, Grid, useTheme } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Contract, ledger, Ledger, pureCircuits } from '../managed/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { getOrCreateSecret, saveUserBid, getUserBid } from '../utils/secrets';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import { QRCodeSVG } from 'qrcode.react';
import { Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';

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

const PHASES = ['COMMIT (Bidding Open)', 'REVEAL (Bidding Closed)', 'RESOLVED (Auction Ended)'];

export const DashboardPage = () => {
  const theme = useTheme();
  const { session, isConnected, connect } = useWallet();
  const [searchParams] = useSearchParams();
  const urlAddress = searchParams.get('address');
  const [address, setAddress] = useState(urlAddress || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || '');
  const [contractLedger, setContractLedger] = useState<Ledger | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [localBid, setLocalBid] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: 'info' | 'success' | 'error', message: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Metadata & Roles
  const savedAuctions = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
  const myAuction = savedAuctions.find((a: any) => a.address === address);
  
  const displayTitle = searchParams.get('title') || myAuction?.name || 'Mystery Asset';
  const displayDesc = searchParams.get('desc') || myAuction?.desc || 'A cryptographically sealed asset available for auction on Midnight.';
  
  const isAuctioneer = !!myAuction;

  const fetchState = useCallback(async () => {
    if (!session || !address) return;
    setLoadingState(true);
    try {
      const state = await session.providers.publicDataProvider.queryContractState(address);
      if (state?.data) {
        setContractLedger(ledger(state.data));
      } else {
        setContractLedger(null);
      }
    } catch (e) {
      console.error(e);
      setContractLedger(null);
    } finally {
      setLoadingState(false);
    }
  }, [session, address]);

  useEffect(() => {
    if (address && session) {
      fetchState();
      const interval = setInterval(fetchState, 5000);
      
      const savedBid = getUserBid(session.unshieldedAddress, address);
      if (savedBid) setLocalBid(savedBid);

      return () => clearInterval(interval);
    }
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
        nonce: Array.from(nonce)
      }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bid-backup-${address.substring(0,8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAction = async (action: 'commitBid' | 'advanceToReveal' | 'revealBid' | 'resolveAuction') => {
    if (!session || !address) return;
    setActionStatus({ type: 'info', message: `Executing ${action}... Please approve in wallet.` });
    try {
      const adminSk = getOrCreateSecret('admin', session.unshieldedAddress);
      const bidderSk = getOrCreateSecret('bidder', session.unshieldedAddress);
      const nonce = getOrCreateSecret(`nonce_${address}`, session.unshieldedAddress);
      
      let amount = BigInt(bidAmount || 0);
      if (action === 'revealBid' && localBid) {
        amount = BigInt(localBid);
      }

      const privateState = {
        auctioneer_secret: adminSk,
        bidder_secret: bidderSk,
        bid_amount: amount,
        bid_nonce: nonce,
      };

      const compiledContract = getCompiledContract(privateState);
      // If commitBid, we need to pass the commitment hash as an argument
      const args = [];
      if (action === 'commitBid') {
         const commitment = (pureCircuits as any).computeBidCommitment(amount, nonce);
         args.push(commitment);
      }

      const txData = await createUnprovenCallTx(session.providers as any, {
        contractAddress: address,
        compiledContract,
        circuitId: action,
        args,
      });

      await submitTxAsync(session.providers as any, {
        unprovenTx: txData.private.unprovenTx,
      });

      if (action === 'commitBid' && bidAmount) {
         saveUserBid(session.unshieldedAddress, address, bidAmount);
         setLocalBid(bidAmount);
      }

      setActionStatus({ type: 'success', message: `Success: ${action} completed on-chain!` });
      setBidAmount('');
      fetchState();
    } catch (e: any) {
      console.error(e);
      setActionStatus({ type: 'error', message: `Error: ${e.message}` });
    }
    setTimeout(() => setActionStatus(null), 10000);
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.primary" mb={2}>Connect Wallet to view Dashboard</Typography>
        <Button variant="contained" onClick={() => connect()}>Connect Wallet</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: { xs: 2, md: 4 } }}>
      <Paper elevation={24} sx={{ p: 4, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', color: 'text.primary', mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold" fontFamily="Instrument Serif" fontStyle="italic">Connect to Auction</Typography>
          {address && (
             <Button variant="outlined" size="small" startIcon={<ShareIcon />} onClick={() => setShareOpen(true)}>Share</Button>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField 
            fullWidth 
            variant="outlined" 
            label="Contract Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            sx={{ input: { color: 'text.primary', fontFamily: 'monospace' }, label: { color: 'text.secondary' } }}
          />
          <Button variant="contained" onClick={fetchState} disabled={loadingState} sx={{ background: theme.palette.primary.main, color: theme.palette.mode === 'dark' ? '#000' : '#fff', fontWeight: 'bold' }}>
            {loadingState ? <CircularProgress size={24} /> : 'Sync'}
          </Button>
        </Stack>
      </Paper>

      {contractLedger && (
        <Grid container spacing={4}>
          {/* Asset Visualization */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', border: theme.palette.mode === 'dark' ? '1px solid rgba(204,255,0,0.1)' : '1px solid rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 150, height: 150, mb: 4, borderRadius: '20px', background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(204,255,0,0.2), rgba(77,166,255,0.2))' : 'linear-gradient(135deg, rgba(170,204,0,0.2), rgba(0,102,204,0.2))', border: `1px dashed ${theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.5)' : 'rgba(170,204,0,0.5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: theme.palette.primary.main, fontFamily: 'Instrument Serif', fontSize: '3rem' }}>?</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary" mb={1} fontFamily="Inter">{displayTitle}</Typography>
              <Typography color="text.secondary" textAlign="center" fontFamily="Inter">{displayDesc}</Typography>
            </Paper>
          </Grid>

          {/* Bidding Controls */}
          <Grid item xs={12} md={7}>
            <Paper elevation={24} sx={{ p: 4, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(20,20,30,0.9)' : '#fff', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', color: 'text.primary', height: '100%' }}>
              
              {/* Winner Podium */}
              {contractLedger.phase === 2n && (
                <Box sx={{ p: 4, mb: 4, borderRadius: 3, background: theme.palette.mode === 'dark' ? 'linear-gradient(90deg, rgba(204,255,0,0.1), rgba(204,255,0,0.05))' : 'linear-gradient(90deg, rgba(170,204,0,0.1), rgba(170,204,0,0.05))', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.4)' : 'rgba(170,204,0,0.4)'}`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>🏆</Typography>
                  <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main} fontFamily="Instrument Serif" fontStyle="italic" mb={1}>
                    Auction Resolved
                  </Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontFamily: 'Inter' }}>
                    Winning Bid: <strong>{contractLedger.highest_bid.toString()} tokens</strong>
                  </Typography>
                </Box>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight="bold" fontFamily="Inter">Auction Status</Typography>
                <Chip 
                  label={PHASES[Number(contractLedger.phase)] || 'UNKNOWN'} 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: 'Inter',
                    background: contractLedger.phase === 0n ? (theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.2)' : 'rgba(170,204,0,0.2)') : contractLedger.phase === 1n ? 'rgba(255,165,0,0.2)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                    color: contractLedger.phase === 0n ? theme.palette.primary.main : contractLedger.phase === 1n ? '#ffa500' : 'text.primary',
                    border: `1px solid ${contractLedger.phase === 0n ? theme.palette.primary.main : contractLedger.phase === 1n ? '#ffa500' : (theme.palette.mode === 'dark' ? '#444' : '#ccc')}`
                  }}
                />
              </Stack>

              <Stepper activeStep={Number(contractLedger.phase)} alternativeLabel sx={{ mb: 4, '& .MuiStepIcon-root.Mui-active': { color: theme.palette.primary.main }, '& .MuiStepIcon-root.Mui-completed': { color: theme.palette.primary.main } }}>
                <Step><StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Inter' } }}>Commit Phase</StepLabel></Step>
                <Step><StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Inter' } }}>Reveal Phase</StepLabel></Step>
                <Step><StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Inter' } }}>Resolved</StepLabel></Step>
              </Stepper>
              
              <Stack spacing={2} mb={4} sx={{ p: 3, background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Round:</Typography>
                  <Typography fontWeight="bold">{contractLedger.round.toString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Highest Bid:</Typography>
                  <Typography fontWeight="bold">{contractLedger.highest_bid.toString()} tokens</Typography>
                </Box>
                
                <Box sx={{ borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Commitments Received:</Typography>
                  <Typography fontWeight="bold">{Number(contractLedger.bid_commitments?.size ?? 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Bids Revealed:</Typography>
                  <Typography fontWeight="bold">{Number((contractLedger as any).revealed_bids?.size ?? 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Awaiting Revelation:</Typography>
                  <Typography fontWeight="bold">
                    {Number(contractLedger.bid_commitments?.size ?? 0) - Number((contractLedger as any).revealed_bids?.size ?? 0)}
                  </Typography>
                </Box>
              </Stack>

              {contractLedger.phase === 1n && localBid && (
                <Paper sx={{ p: 2, mb: 3, background: theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.1)' : 'rgba(170,204,0,0.1)', color: theme.palette.primary.main, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.2)' : 'rgba(170,204,0,0.2)'}` }}>
                  <Typography variant="subtitle2" fontWeight="bold">Local Backup Found</Typography>
                  <Typography variant="body2" mb={1}>Your unrevealed bid is {localBid} tokens. You can securely reveal it now.</Typography>
                  <Button size="small" variant="outlined" sx={{ borderColor: 'inherit', color: 'inherit' }} onClick={downloadBackup}>
                    Export Secret Backup
                  </Button>
                </Paper>
              )}

              {actionStatus && (
                <Paper sx={{ p: 2, mb: 3, display: 'flex', flexDirection: 'column', gap: 1, background: actionStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.1)' : 'rgba(170,204,0,0.1)', color: actionStatus.type === 'error' ? '#ff4d4d' : theme.palette.primary.main, border: `1px solid ${actionStatus.type === 'error' ? 'rgba(255,0,0,0.3)' : theme.palette.mode === 'dark' ? 'rgba(204,255,0,0.2)' : 'rgba(170,204,0,0.2)'}` }}>
                  <Typography fontWeight="bold" fontFamily="Inter" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {actionStatus.type === 'info' && <CircularProgress size={16} color="inherit" />}
                    {actionStatus.message}
                  </Typography>
                  {actionStatus.type === 'success' && (
                    <Button 
                      href={`https://preprod.midnightexplorer.com/contracts/${address}`} 
                      target="_blank" 
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      sx={{ alignSelf: 'flex-start', color: 'inherit', textTransform: 'none', p: 0, '&:hover': { background: 'transparent', textDecoration: 'underline' } }}
                    >
                      View on Midnight Explorer
                    </Button>
                  )}
                </Paper>
              )}

              <Stack direction="column" spacing={3}>
                {contractLedger.phase === 0n && (
                  <Box>
                    <Typography mb={2} fontWeight="bold" fontFamily="Inter">Submit a Secret Bid</Typography>
                    <Stack direction="row" spacing={2}>
                      <TextField 
                        label="Bid Amount" 
                        type="number" 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(e.target.value)}
                        sx={{ input: { color: 'text.primary' }, label: { color: 'text.secondary' }, flexGrow: 1 }}
                      />
                      <Button variant="contained" onClick={() => handleAction('commitBid')} sx={{ background: theme.palette.primary.main, color: theme.palette.mode === 'dark' ? '#000' : '#fff', fontWeight: 'bold' }}>
                        Commit Bid &rarr;
                      </Button>
                    </Stack>
                  </Box>
                )}

                {contractLedger.phase === 1n && (
                  <Button variant="outlined" onClick={() => handleAction('revealBid')} sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main, fontWeight: 'bold', py: 1.5 }}>
                    Reveal My Bid
                  </Button>
                )}
                
                {isAuctioneer && (
                  <Box sx={{ borderTop: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', pt: 3, mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: '100%', fontFamily: 'Inter' }}>Auctioneer Controls (Admin Only):</Typography>
                    {contractLedger.phase === 0n && (
                      <Button variant="outlined" onClick={() => handleAction('advanceToReveal')} sx={{ borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', color: 'text.primary' }}>
                        Close Bidding (Advance to Reveal)
                      </Button>
                    )}
                    {contractLedger.phase === 1n && (
                      <Button variant="contained" onClick={() => handleAction('resolveAuction')} sx={{ background: theme.palette.text.primary, color: theme.palette.background.default }}>
                        Resolve Auction (End Round)
                      </Button>
                    )}
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Inter', fontWeight: 'bold' }}>Share this Auction</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
          <Box sx={{ background: '#fff', p: 2, borderRadius: '16px' }}>
            <QRCodeSVG value={`${window.location.origin}/dashboard?address=${address}&title=${encodeURIComponent(displayTitle)}&desc=${encodeURIComponent(displayDesc)}`} size={220} />
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center" fontFamily="Inter">
            Scan this QR code or copy the link below to share this exact auction with other bidders.
          </Typography>
          <Stack direction="row" spacing={1} width="100%">
            <TextField 
              fullWidth 
              size="small"
              value={`${window.location.origin}/dashboard?address=${address}&title=${encodeURIComponent(displayTitle)}&desc=${encodeURIComponent(displayDesc)}`} 
              InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }} 
            />
            <Button variant="contained" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/dashboard?address=${address}&title=${encodeURIComponent(displayTitle)}&desc=${encodeURIComponent(displayDesc)}`)} sx={{ background: theme.palette.primary.main, color: theme.palette.mode === 'dark' ? '#000' : '#fff' }}>Copy</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
