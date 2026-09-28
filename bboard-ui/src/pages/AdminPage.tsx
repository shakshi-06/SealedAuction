import React, { useCallback, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, pureCircuits } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { colors } from '../config/theme';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { getOrCreateSecret } from '../utils/secrets';

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
const panelSx = {
  border: `1px solid ${colors.line}`,
  backgroundColor: 'rgba(255,255,255,0.025)',
  boxShadow: 'none',
};
const monoSx = { fontFamily: '"DM Mono", monospace' };

export const AdminPage: React.FC = () => {
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
        const existing = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
        existing.unshift({
          address: contractAddress,
          name: title || defaultTitle,
          desc: desc || defaultDescription,
          deployedAt: Date.now(),
        });
        localStorage.setItem('RECENT_AUCTIONS', JSON.stringify(existing.slice(0, 20)));
      } catch (_error) {
        // Deployment succeeded even if this browser-only feed cannot be updated.
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
    <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 880, mb: { xs: 6, md: 9 } }}>
        <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 11, letterSpacing: '0.14em', mb: 2 }}>
          ADMIN / AUCTION ROOM CREATION
        </Typography>
        <Typography variant="h1" sx={{ color: colors.paper, fontSize: { xs: 44, md: 72 }, lineHeight: 0.98, mb: 3 }}>
          Make the room before the bidding begins.
        </Typography>
        <Typography sx={{ color: colors.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.65, maxWidth: 700 }}>
          Configure a sealed-bid auction, review its public presentation, then deploy a fresh contract to Midnight Preprod.
          The contract is the source of auction state. Your editorial metadata is kept locally for the room feed.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.15fr) minmax(360px, 0.85fr)' }, gap: { xs: 3, md: 5 }, alignItems: 'start' }}>
        <Paper sx={{ ...panelSx, p: { xs: 3, md: 5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 5 }}>
            <Box>
              <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 1 }}>DEPLOYMENT BRIEF</Typography>
              <Typography variant="h4" sx={{ color: colors.paper }}>Create an auction</Typography>
            </Box>
            <LockOutlinedIcon sx={{ color: colors.redSoft, mt: 0.5 }} />
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 5 }}>
            {[['01', 'Describe', 'Name the room.'], ['02', 'Review', 'Check the public card.'], ['03', 'Deploy', 'Publish on Preprod.']].map(([number, label, detail]) => (
              <Box key={number} sx={{ borderTop: `2px solid ${number === '03' ? colors.red : colors.line}`, pt: 1.5 }}>
                <Typography sx={{ ...monoSx, color: number === '03' ? colors.redSoft : colors.muted, fontSize: 11 }}>{number}</Typography>
                <Typography sx={{ color: colors.paper, mt: 1, fontWeight: 600 }}>{label}</Typography>
                <Typography sx={{ color: colors.quiet, fontSize: 12, mt: 0.5 }}>{detail}</Typography>
              </Box>
            ))}
          </Box>

          {(status === 'idle' || status === 'error') && (
            <Box component="form" onSubmit={(event) => { event.preventDefault(); void handleDeploy(); }} sx={{ display: 'grid', gap: 2.5 }}>
              <TextField
                label="Auction title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="For example, Study in Red No. 4"
                fullWidth
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Description"
                value={desc}
                onChange={(event) => setDesc(event.target.value)}
                placeholder="A short note for bidders"
                multiline
                minRows={4}
                fullWidth
                inputProps={{ maxLength: 300 }}
              />
              <Typography sx={{ color: colors.quiet, fontSize: 12, lineHeight: 1.6 }}>
                Both fields are optional. They label the room in this browser and are not constructor arguments in auction.compact.
              </Typography>

              {!isConnected ? (
                <Button variant="contained" onClick={() => void connect('preprod')} disabled={isConnecting} startIcon={isConnecting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />} sx={{ justifySelf: 'start', mt: 1 }}>
                  {isConnecting ? 'Connecting wallet' : 'Connect wallet to deploy'}
                </Button>
              ) : (
                <Button type="submit" variant="contained" startIcon={<RocketLaunchOutlinedIcon />} sx={{ justifySelf: 'start', mt: 1 }}>
                  Deploy to Preprod
                </Button>
              )}
            </Box>
          )}

          {status === 'deploying' && (
            <Box sx={{ border: `1px solid ${colors.line}`, p: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
              <CircularProgress size={18} sx={{ color: colors.redSoft }} />
              <Typography sx={{ color: colors.paper, fontSize: 14 }}>Waiting for the wallet to sign and submit the deployment.</Typography>
            </Box>
          )}

          {status === 'error' && errorMsg && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 0, backgroundColor: 'rgba(179,38,45,0.12)', color: colors.paper }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Deployment failed</Typography>
              <Typography sx={{ ...monoSx, fontSize: 11, wordBreak: 'break-word' }}>{errorMsg}</Typography>
            </Alert>
          )}

          {status === 'deployed' && deployedAddress && (
            <Box sx={{ mt: 2, border: `1px solid ${colors.red}`, p: { xs: 2.5, md: 3 }, backgroundColor: 'rgba(179,38,45,0.09)' }}>
              <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 1 }}>DEPLOYMENT SUBMITTED</Typography>
              <Typography sx={{ color: colors.paper, fontSize: 18, mb: 2 }}>Your room has an address.</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ border: `1px solid ${colors.line}`, backgroundColor: colors.ink, p: 1.5 }}>
                <Typography sx={{ ...monoSx, color: colors.paper, fontSize: 11, wordBreak: 'break-all', flexGrow: 1 }}>{deployedAddress}</Typography>
                <Tooltip title={copied ? 'Copied' : 'Copy address'}>
                  <IconButton onClick={handleCopy} aria-label="Copy contract address" size="small"><ContentCopyOutlinedIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="contained" href={`/dashboard?address=${deployedAddress}&title=${encodeURIComponent(title || defaultTitle)}&desc=${encodeURIComponent(desc || defaultDescription)}`} endIcon={<LaunchOutlinedIcon />}>Open dashboard</Button>
                <Button variant="outlined" href={`https://preprod.midnightexplorer.com/contracts/${deployedAddress}`} target="_blank" rel="noreferrer" endIcon={<LaunchOutlinedIcon />}>View explorer</Button>
              </Stack>
            </Box>
          )}
        </Paper>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Paper sx={{ ...panelSx, p: { xs: 3, md: 4 } }}>
            <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 3 }}>LIVE PREVIEW / PUBLIC CARD</Typography>
            <Typography variant="h4" sx={{ color: colors.paper, mb: 1.5, overflowWrap: 'anywhere' }}>{title.trim() || defaultTitle}</Typography>
            <Typography sx={{ color: colors.muted, lineHeight: 1.65, minHeight: 72, overflowWrap: 'anywhere' }}>{desc.trim() || defaultDescription}</Typography>
            <Box sx={{ borderTop: `1px solid ${colors.line}`, mt: 4, pt: 2.5, display: 'grid', gap: 1.25 }}>
              <Stack direction="row" justifyContent="space-between"><Typography sx={{ color: colors.quiet, fontSize: 12 }}>Network</Typography><Typography sx={{ ...monoSx, color: colors.paper, fontSize: 11 }}>MIDNIGHT PREPROD</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography sx={{ color: colors.quiet, fontSize: 12 }}>Phase</Typography><Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 11 }}>COMMIT</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography sx={{ color: colors.quiet, fontSize: 12 }}>Bids</Typography><Typography sx={{ ...monoSx, color: colors.paper, fontSize: 11 }}>SEALED</Typography></Stack>
            </Box>
          </Paper>

          <Paper sx={{ ...panelSx, p: { xs: 3, md: 4 } }}>
            <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 2 }}>NETWORK NOTE</Typography>
            <Typography sx={{ color: colors.paper, lineHeight: 1.65, fontSize: 14 }}>
              Deployments use your connected wallet and Midnight Preprod. The title, description, and recent room list are browser-local metadata. They do not alter the contract ledger.
            </Typography>
            <Typography sx={{ ...monoSx, color: colors.quiet, fontSize: 10, lineHeight: 1.7, mt: 2 }}>
              LOCAL METADATA / RECENT_AUCTIONS
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};
