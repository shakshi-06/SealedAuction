import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Container, InputAdornment, LinearProgress, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { MainLayout } from './components';
import { AdminPage } from './pages/AdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { VerifyPage } from './pages/VerifyPage';
import { useWallet } from './contexts/WalletContext';

const Surface: React.FC<React.PropsWithChildren<{ sx?: Record<string, unknown>; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }>> = ({ children, sx, className, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper className={className} onClick={onClick} elevation={0} sx={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)', ...sx }}>
      {children}
    </Paper>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isConnected, connect } = useWallet();
  const [recentAuctions, setRecentAuctions] = useState<any[]>([]);
  const [mockBid, setMockBid] = useState('');
  const [isProving, setIsProving] = useState(false);
  const [proofResult, setProofResult] = useState('');
  
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
      setRecentAuctions(saved.slice(0, 3));
    } catch {
      setRecentAuctions([]);
    }
  }, []);

  const simulateProof = () => {
    if (!mockBid) return;
    setIsProving(true);
    setProofResult('');
    window.setTimeout(() => {
      setIsProving(false);
      setProofResult(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
    }, 1600);
  };

  return (
    <>
      <Box sx={{ borderBottom: `1px solid ${divider}`, overflow: 'hidden', whiteSpace: 'nowrap', background: isDark ? '#111010' : '#FFFFFF' }}>
        <Box sx={{ display: 'inline-flex', minWidth: '200%', animation: 'marquee 32s linear infinite', py: 1.2 }}>
          {[0, 1, 2, 3].map((item) => (
            <Typography key={item} sx={{ px: 5, color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em' }}>
              MIDNIGHT PREPROD <span style={{ color: redMain }}>●</span> COMMIT REVEAL RESOLVE <span style={{ color: mutedText }}>/</span> PRIVATE BY DESIGN
            </Typography>
          ))}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ pt: { xs: 8, md: 13 }, pb: { xs: 8, md: 15 } }}>
        <Grid container spacing={{ xs: 7, md: 10 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={3} sx={{ animation: 'revealUp 0.7s ease both' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 8, height: 8, background: redMain }} />
                <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11, letterSpacing: '0.13em' }}>SEALED-BID AUCTIONS</Typography>
              </Stack>
              <Typography component="h1" sx={{ maxWidth: 770, fontSize: { xs: '3.5rem', sm: '5rem', md: '6.8rem' }, lineHeight: 0.94, color: paperText }}>
                The price stays <Box component="span" sx={{ color: redSoft }}>private.</Box>
                <br />
                The result stays <Box component="span" sx={{ fontStyle: 'italic', fontWeight: 500 }}>provable.</Box>
              </Typography>
              <Typography sx={{ maxWidth: 570, color: mutedText, fontSize: { xs: 17, md: 20 }, lineHeight: 1.6 }}>
                A confidential auction room built on Midnight. Commit your offer without showing your strategy, then prove the bid is authentic when the room opens.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => isConnected ? navigate('/dashboard') : connect()} sx={{ minWidth: 172 }}>
                  {isConnected ? 'Enter auction room' : 'Connect to begin'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/privacy')} sx={{ minWidth: 150 }}>Understand the model</Button>
              </Stack>
              <Stack direction="row" spacing={{ xs: 2, sm: 4 }} sx={{ pt: 3, flexWrap: 'wrap', rowGap: 1 }}>
                {['No bid leakage', 'Client-side proofing', 'Open verification'].map((label) => (
                  <Stack direction="row" spacing={1} alignItems="center" key={label}>
                    <VerifiedOutlinedIcon sx={{ color: redMain, fontSize: 17 }} />
                    <Typography sx={{ color: mutedText, fontSize: 12 }}>{label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Surface sx={{ minHeight: { xs: 400, md: 500 }, p: { xs: 3, md: 4 }, position: 'relative', overflow: 'hidden', animation: 'revealUp 0.7s 0.12s ease both', '&::before': { content: '""', position: 'absolute', left: 0, right: 0, height: 1, background: redMain, opacity: 0.75, animation: 'scan 5s ease-in-out infinite' } }}>
              <Stack justifyContent="space-between" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>LIVE AUCTION ROOM</Typography>
                    <Typography sx={{ color: paperText, fontSize: 22, mt: 1 }}>Private artifact / 01</Typography>
                  </Box>
                  <Chip label="COMMIT OPEN" size="small" sx={{ color: redSoft, border: `1px solid ${redMain}`, background: 'rgba(179,38,45,0.1)' }} />
                </Stack>
                <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 230, position: 'relative' }}>
                  <Box sx={{ width: 190, height: 190, border: `1px solid ${isDark ? '#403B38' : '#C0BBB8'}`, transform: 'rotate(45deg)', animation: 'slowFloat 6s ease-in-out infinite', display: 'grid', placeItems: 'center' }}>
                    <Box sx={{ width: 122, height: 122, border: `1px solid ${redMain}`, display: 'grid', placeItems: 'center', transform: 'rotate(-45deg)', background: 'rgba(179,38,45,0.06)' }}>
                      <LockOutlinedIcon sx={{ color: redSoft, fontSize: 30 }} />
                    </Box>
                  </Box>
                  <Typography sx={{ position: 'absolute', bottom: 0, color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10 }}>YOUR OFFER IS SEALED</Typography>
                </Box>
                <Box sx={{ borderTop: `1px solid ${divider}`, pt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}><Typography sx={{ color: mutedText, fontSize: 12 }}>Commitment status</Typography><Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11 }}>WAITING FOR REVEAL</Typography></Stack>
                  <LinearProgress variant="determinate" value={62} sx={{ height: 3, background: divider, '& .MuiLinearProgress-bar': { background: redMain } }} />
                </Box>
              </Stack>
            </Surface>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 10, md: 15 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3} sx={{ mb: 3 }}>
            <Box>
              <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>WHY THIS EXISTS</Typography>
              <Typography variant="h3" sx={{ color: paperText, maxWidth: 620 }}>A fairer room for high-signal decisions.</Typography>
            </Box>
            <Typography sx={{ color: mutedText, maxWidth: 390, lineHeight: 1.7, alignSelf: 'end' }}>Traditional auctions reveal too much, too early. SealedAuction creates a deliberate gap between making an offer and revealing it.</Typography>
          </Stack>
          <Grid container spacing={2}>
            {[
              { icon: <VisibilityOffOutlinedIcon />, title: 'Strategy stays yours', text: 'Only a commitment is published during bidding. Your number remains on your device.' },
              { icon: <LockOutlinedIcon />, title: 'Proof replaces trust', text: 'The reveal is checked against the original commitment by a Midnight circuit.' },
              { icon: <GavelOutlinedIcon />, title: 'The room has a record', text: 'Every phase change is anchored on-chain and independently inspectable.' },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Surface sx={{ p: 3.2, minHeight: 205, transition: 'transform 220ms ease, border-color 220ms ease', '&:hover': { transform: 'translateY(-5px)', borderColor: redMain } }}>
                  <Box sx={{ color: redMain, mb: 3 }}>{item.icon}</Box>
                  <Typography sx={{ color: paperText, fontSize: 20, mb: 1 }}>{item.title}</Typography>
                  <Typography sx={{ color: mutedText, lineHeight: 1.65, fontSize: 14 }}>{item.text}</Typography>
                  <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, mt: 3 }}>0{index + 1}</Typography>
                </Surface>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={2} sx={{ mt: { xs: 10, md: 15 } }}>
          <Grid item xs={12} md={7}>
            <Surface sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
              <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>SEE THE MECHANIC</Typography>
              <Typography variant="h4" sx={{ color: paperText, mb: 1 }}>A bid becomes a commitment.</Typography>
              <Typography sx={{ color: mutedText, lineHeight: 1.6, maxWidth: 520, mb: 3 }}>Type a test amount and watch the private input become a public commitment. This is a visual demo, not a live transaction.</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField fullWidth value={mockBid} onChange={(event) => setMockBid(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Enter a test amount" InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace' }}>TOK</Typography></InputAdornment> }} />
                <Button variant="contained" onClick={simulateProof} disabled={isProving || !mockBid} sx={{ minWidth: 145 }}>{isProving ? <CircularProgress size={18} color="inherit" /> : 'Create proof'}</Button>
              </Stack>
              {isProving && <Box sx={{ mt: 3 }}><Typography sx={{ color: mutedText, fontSize: 12, mb: 1 }}>Preparing local circuit</Typography><LinearProgress sx={{ background: divider, '& .MuiLinearProgress-bar': { background: redMain } }} /></Box>}
              {proofResult && <Box sx={{ mt: 3, p: 2, border: `1px solid ${redMain}`, background: 'rgba(179,38,45,0.08)' }}><Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 10, mb: 1 }}>PUBLIC COMMITMENT</Typography><Typography sx={{ color: paperText, fontFamily: '"DM Mono", monospace', fontSize: 12, wordBreak: 'break-all' }}>{proofResult}</Typography></Box>}
            </Surface>
          </Grid>
          <Grid item xs={12} md={5}>
            <Surface sx={{ p: { xs: 3, md: 4 }, height: '100%', background: isDark ? '#1C1A1A' : '#F5F5F5', color: paperText, borderColor: divider }}>
              <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 2 }}>THREE PHASES</Typography>
              <Stack spacing={2.5}>
                {[['01', 'Commit', 'Submit a sealed offer.'], ['02', 'Reveal', 'Prove the offer matches.'], ['03', 'Resolve', 'Finalize the highest valid bid.']].map(([number, title, text]) => <Stack key={number} direction="row" spacing={2}><Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 12, pt: 0.3 }}>{number}</Typography><Box><Typography sx={{ color: paperText, fontSize: 18 }}>{title}</Typography><Typography sx={{ color: mutedText, fontSize: 13, mt: 0.4 }}>{text}</Typography></Box></Stack>)}
              </Stack>
              <Button variant="outlined" onClick={() => navigate('/privacy')} endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 4, color: paperText, borderColor: divider, '&:hover': { borderColor: redMain, background: 'rgba(179,38,45,0.06)' } }}>Read the privacy model</Button>
            </Surface>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 10, md: 15 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="end" sx={{ mb: 3 }}><Box><Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1 }}>YOUR ROOMS</Typography><Typography variant="h4" sx={{ color: paperText }}>Recent auctions</Typography></Box><Button onClick={() => navigate('/dashboard')} endIcon={<ArrowForwardRoundedIcon />} sx={{ color: redSoft }}>Open room</Button></Stack>
          {recentAuctions.length > 0 ? <Grid container spacing={2}>{recentAuctions.map((auction) => <Grid item xs={12} md={4} key={auction.address}><Surface sx={{ p: 2.5, cursor: 'pointer', '&:hover': { borderColor: redMain } }} onClick={() => navigate(`/dashboard?address=${auction.address}`)}><Typography sx={{ color: paperText, fontSize: 18, mb: 1 }}>{auction.name || 'Untitled auction'}</Typography><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{auction.address}</Typography></Surface></Grid>)}</Grid> : <Surface sx={{ p: 3, borderStyle: 'dashed' }}><Typography sx={{ color: mutedText }}>No rooms saved yet. Create the first private auction when you are ready.</Typography></Surface>}
        </Box>
      </Container>
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/verify" element={<VerifyPage />} />
      </Routes>
    </MainLayout>
  </BrowserRouter>
);

export default App;
