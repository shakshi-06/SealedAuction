import React, { useState, useCallback } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { Box, Typography, Button, Paper, CircularProgress, IconButton, Alert, Tooltip, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function getCompiledContract() {
  const witnesses = {
    auctioneer_secret: ({ privateState }: any) => [privateState, privateState.auctioneer_secret],
    bidder_secret: ({ privateState }: any) => [privateState, privateState.bidder_secret],
    bid_amount: ({ privateState }: any) => [privateState, privateState.bid_amount],
    bid_nonce: ({ privateState }: any) => [privateState, privateState.bid_nonce],
  };
  return CompiledContract.make('auction', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString()),
  ) as any;
}

export const AdminPage = () => {
  const { session, isConnected } = useWallet();
  const [status, setStatus] = useState<'idle' | 'deploying' | 'deployed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = useCallback(async () => {
    if (!session || !isConnected) return;
    setStatus('deploying');
    setErrorMsg(null);
    try {
      const compiledContract = getCompiledContract();

      const adminSk = new Uint8Array(32); // Using zero-key for testing
      const adminHash = (pureCircuits as any).auctioneer_key(adminSk);

      const deployTxData = await createUnprovenDeployTx(session.providers as any, {
        compiledContract,
        args: [adminHash],
        privateStateId: 'DeployerState',
        initialPrivateState: {
          auctioneer_secret: adminSk,
          bidder_secret: new Uint8Array(32),
          bid_amount: 0n,
          bid_nonce: new Uint8Array(32),
        },
        signingKey: sampleSigningKey(),
      });

      const contractAddress = deployTxData.public.contractAddress;

      await submitTxAsync(session.providers as any, {
        unprovenTx: deployTxData.private.unprovenTx,
      });

      setDeployedAddress(contractAddress);
      localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', contractAddress);
      
      // Save to recent auctions for the Explorer feed
      try {
        const existing = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
        const items = ["Rare zkNFT #001", "Midnight Genesis Grant", "Zero-Knowledge Artifact", "Encrypted Data Cache"];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        existing.unshift({
          address: contractAddress,
          name: randomItem,
          deployedAt: Date.now()
        });
        localStorage.setItem('RECENT_AUCTIONS', JSON.stringify(existing.slice(0, 6))); // Keep last 6
      } catch (e) {}

      setStatus('deployed');
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e?.message ?? String(e));
    }
  }, [session, isConnected]);

  if (!isConnected) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, maxWidth: 500, textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="h5" color="white" gutterBottom fontWeight="bold">
            Admin Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please connect your 1AM wallet in the top right to access the deployment controls.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '700px', margin: '0 auto', p: { xs: 2, md: 4 } }}>
      <Paper elevation={24} sx={{ p: 5, borderRadius: 4, background: 'linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h4" color="white" fontWeight="800" gutterBottom>
          Deploy Contract
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Deploy a fresh instance of the Sealed-Bid Auction contract to the Midnight Preprod Network. You will be assigned the Auctioneer role.
        </Typography>

        {(status === 'idle' || status === 'error') && (
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleDeploy} 
            startIcon={<RocketLaunchIcon />}
            sx={{ 
              background: 'linear-gradient(90deg, #4da6ff, #0066cc)', 
              color: 'white', 
              px: 4, 
              py: 1.5, 
              borderRadius: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Deploy to Preprod
          </Button>
        )}

        {status === 'deploying' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.05)', p: 3, borderRadius: 3 }}>
            <CircularProgress size={24} sx={{ color: '#4da6ff' }} />
            <Typography color="white" fontWeight="bold">
              Deploying... Check your 1AM wallet popup to sign the transaction.
            </Typography>
          </Box>
        )}

        {status === 'deployed' && deployedAddress && (
          <Box sx={{ mt: 4, background: 'rgba(77, 166, 255, 0.1)', p: 4, borderRadius: 4, border: '1px solid rgba(77, 166, 255, 0.3)' }}>
            <Typography variant="h6" color="#4da6ff" gutterBottom fontWeight="bold">
              🎉 Contract Deployed Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Contract Address:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ background: 'rgba(0,0,0,0.5)', p: 2, borderRadius: 2 }}>
              <Typography variant="body1" color="white" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', flexGrow: 1 }}>
                {deployedAddress}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy Address"}>
                <IconButton onClick={() => { navigator.clipboard.writeText(deployedAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); }} sx={{ color: '#4da6ff' }}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Button 
              href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`} 
              target="_blank" 
              endIcon={<OpenInNewIcon />}
              sx={{ mt: 3, color: '#4da6ff' }}
            >
              View on Midnight Explorer
            </Button>
          </Box>
        )}

        {status === 'error' && errorMsg && (
          <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Deployment Failed</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, wordBreak: 'break-all' }}>
              {errorMsg}
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};
