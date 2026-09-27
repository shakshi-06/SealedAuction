import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress, Chip, Stack, Grid } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Contract, ledger, Ledger, pureCircuits } from '../managed/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';

function getCompiledContract() {
  const witnesses = {
    auctioneer_secret: ({ privateState }: any) => [privateState, privateState.auctioneer_secret ?? new Uint8Array(32)],
    bidder_secret: ({ privateState }: any) => [privateState, privateState.bidder_secret ?? new Uint8Array(32)],
    bid_amount: ({ privateState }: any) => [privateState, privateState.bid_amount ?? 0n],
    bid_nonce: ({ privateState }: any) => [privateState, privateState.bid_nonce ?? new Uint8Array(32)],
  };
  return CompiledContract.make('auction', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

const PHASES = ['COMMIT (Bidding Open)', 'REVEAL (Bidding Closed)', 'RESOLVED (Auction Ended)'];

export const DashboardPage = () => {
  const { session, isConnected, connect } = useWallet();
  const [searchParams] = useSearchParams();
  const urlAddress = searchParams.get('address');
  const [address, setAddress] = useState(urlAddress || localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || '');
  const [contractLedger, setContractLedger] = useState<Ledger | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

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
      return () => clearInterval(interval);
    }
  }, [session, address, fetchState]);

  const handleAction = async (action: 'commitBid' | 'advanceToReveal' | 'revealBid' | 'resolveAuction') => {
    if (!session || !address) return;
    setActionStatus(`Executing ${action}... Please approve in wallet.`);
    try {
      const compiledContract = getCompiledContract();
      
      const adminSk = new Uint8Array(32); // Mock: Same key used in deployer
      const bidderSk = new Uint8Array(32); // Mock: Bidder secret key
      const nonce = new Uint8Array(32); // Mock: nonce
      const amount = BigInt(bidAmount || 0);

      const privateState = {
        auctioneer_secret: adminSk,
        bidder_secret: bidderSk,
        bid_amount: amount,
        bid_nonce: nonce,
      };

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

      setActionStatus(`Success: ${action}`);
      setBidAmount('');
      fetchState();
    } catch (e: any) {
      console.error(e);
      setActionStatus(`Error: ${e.message}`);
    }
    setTimeout(() => setActionStatus(null), 5000);
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="white" mb={2}>Connect Wallet to view Dashboard</Typography>
        <Button variant="contained" onClick={() => connect()}>Connect Wallet</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: { xs: 2, md: 4 } }}>
      <Paper elevation={24} sx={{ p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} fontFamily="Instrument Serif" fontStyle="italic">Connect to Auction</Typography>
        <Stack direction="row" spacing={2}>
          <TextField 
            fullWidth 
            variant="outlined" 
            label="Contract Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            sx={{ input: { color: 'white', fontFamily: 'monospace' }, label: { color: '#aaa' } }}
          />
          <Button variant="contained" onClick={fetchState} disabled={loadingState} sx={{ background: '#ccff00', color: '#000', fontWeight: 'bold' }}>
            {loadingState ? <CircularProgress size={24} /> : 'Sync'}
          </Button>
        </Stack>
      </Paper>

      {contractLedger && (
        <Grid container spacing={4}>
          {/* Asset Visualization */}
          <Grid xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(204,255,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 150, height: 150, mb: 4, borderRadius: '20px', background: 'linear-gradient(135deg, rgba(204,255,0,0.2), rgba(77,166,255,0.2))', border: '1px dashed rgba(204,255,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#ccff00', fontFamily: 'Instrument Serif', fontSize: '3rem' }}>?</Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="white" mb={1} fontFamily="Inter">Mystery Asset</Typography>
              <Typography color="text.secondary" textAlign="center" fontFamily="Inter">A cryptographically sealed asset available for auction on Midnight.</Typography>
            </Paper>
          </Grid>

          {/* Bidding Controls */}
          <Grid xs={12} md={7}>
            <Paper elevation={24} sx={{ p: 4, borderRadius: 4, background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', height: '100%' }}>
              
              {/* Winner Podium */}
              {contractLedger.phase === 2n && (
                <Box sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(90deg, rgba(204,255,0,0.1), rgba(204,255,0,0.05))', border: '1px solid rgba(204,255,0,0.4)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>🏆</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ccff00" fontFamily="Instrument Serif" fontStyle="italic" mb={1}>
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
                    background: contractLedger.phase === 0n ? 'rgba(204,255,0,0.2)' : contractLedger.phase === 1n ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.1)',
                    color: contractLedger.phase === 0n ? '#ccff00' : contractLedger.phase === 1n ? '#ffa500' : '#fff',
                    border: `1px solid ${contractLedger.phase === 0n ? '#ccff00' : contractLedger.phase === 1n ? '#ffa500' : '#444'}`
                  }}
                />
              </Stack>
              
              <Stack spacing={2} mb={4} sx={{ p: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Round:</Typography>
                  <Typography fontWeight="bold">{contractLedger.round.toString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontFamily="Inter">Highest Bid:</Typography>
                  <Typography fontWeight="bold">{contractLedger.highest_bid.toString()} tokens</Typography>
                </Box>
              </Stack>

              {actionStatus && (
                <Paper sx={{ p: 2, mb: 3, background: 'rgba(204,255,0,0.1)', color: '#ccff00', border: '1px solid rgba(204,255,0,0.2)' }}>
                  <Typography fontWeight="bold" fontFamily="Inter">{actionStatus}</Typography>
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
                        sx={{ input: { color: 'white' }, label: { color: '#aaa' }, flexGrow: 1 }}
                      />
                      <Button variant="contained" onClick={() => handleAction('commitBid')} sx={{ background: '#ccff00', color: '#000', fontWeight: 'bold' }}>
                        Commit Bid &rarr;
                      </Button>
                    </Stack>
                  </Box>
                )}

                {contractLedger.phase === 1n && (
                  <Button variant="outlined" onClick={() => handleAction('revealBid')} sx={{ color: '#ccff00', borderColor: '#ccff00', fontWeight: 'bold', py: 1.5 }}>
                    Reveal My Bid
                  </Button>
                )}
                
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3, mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: '100%', fontFamily: 'Inter' }}>Auctioneer Controls (Admin Only):</Typography>
                  {contractLedger.phase === 0n && (
                    <Button variant="outlined" onClick={() => handleAction('advanceToReveal')} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                      Close Bidding (Advance to Reveal)
                    </Button>
                  )}
                  {contractLedger.phase === 1n && (
                    <Button variant="contained" onClick={() => handleAction('resolveAuction')} sx={{ background: '#fff', color: '#000' }}>
                      Resolve Auction (End Round)
                    </Button>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
