import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Container, InputAdornment, LinearProgress, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { MainLayout, AddressHash, ErrorBoundary } from './components';
import { AdminPage } from './pages/AdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { VerifyPage } from './pages/VerifyPage';
import { useWallet } from './contexts/WalletContext';

const Surface: React.FC<React.PropsWithChildren<{ sx?: Record<string, unknown>; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }>> = ({ children, sx, className, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper className={className} onClick={onClick} elevation={0} sx={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, boxShadow: isDark ? 'none' : '0 12px 30px rgba(91, 52, 40, 0.07)', ...sx }}>
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
      <Box className="status-ticker" sx={{ borderTop: `1px solid ${divider}`, borderBottom: `1px solid ${divider}`, overflow: 'hidden', whiteSpace: 'nowrap', background: isDark ? '#201817' : '#FFFDFC', position: 'relative', maskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)', '&::before, &::after': { content: '""', position: 'absolute', top: 0, bottom: 0, width: { xs: 52, sm: 96, md: 140 }, zIndex: 2, pointerEvents: 'none', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }, '&::before': { left: 0, background: `linear-gradient(90deg, ${isDark ? '#201817' : '#FFFDFC'} 8%, transparent 100%)`, maskImage: 'linear-gradient(90deg, black 20%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, black 20%, transparent)' }, '&::after': { right: 0, background: `linear-gradient(270deg, ${isDark ? '#201817' : '#FFFDFC'} 8%, transparent 100%)`, maskImage: 'linear-gradient(270deg, black 20%, transparent)', WebkitMaskImage: 'linear-gradient(270deg, black 20%, transparent)' } }}>
        <Box className="status-ticker__track" sx={{ display: 'inline-flex', minWidth: '200%', animation: 'marquee 34s linear infinite', py: 1.45, '&:hover': { animationPlayState: 'paused' } }}>
          {[0, 1, 2, 3].map((item) => (
            <Typography key={item} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2.3, px: 4.5, color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em' }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', background: redMain, boxShadow: `0 0 0 4px ${isDark ? 'rgba(217,74,66,0.12)' : 'rgba(217,74,66,0.10)'}` }} />
              <Box component="span" sx={{ color: paperText }}>MIDNIGHT PREPROD</Box>
              <Box component="span" sx={{ opacity: 0.55 }}>/</Box>
              COMMIT <Box component="span" sx={{ color: redMain }}>→</Box> REVEAL <Box component="span" sx={{ color: redMain }}>→</Box> RESOLVE
              <Box component="span" sx={{ opacity: 0.55 }}>/</Box>
              PRIVATE BY DESIGN
            </Typography>
          ))}
        </Box>
      </Box>

      <Box className="faded-grid-bg" sx={{ width: '100%', position: 'relative' }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 7, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
            <Grid item xs={12} md={6.5}>
              <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ textAlign: { xs: 'center', md: 'left' }, animation: 'revealUp 0.7s ease both' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, background: redMain }} />
                  <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11, letterSpacing: '0.13em' }}>SEALED-BID AUCTIONS</Typography>
                </Stack>
                <Typography component="h1" sx={{ maxWidth: 680, fontSize: { xs: '2.2rem', sm: '2.9rem', md: '3.5rem' }, lineHeight: 1.12, color: paperText, fontWeight: 800 }}>
                  The price stays
                  <br />
                  <Box component="span" sx={{ color: redSoft }}>private.</Box>
                  <br />
                  The result stays
                  <br />
                  <Box component="span" sx={{ color: redSoft }}>provable.</Box>
                </Typography>
                <Typography sx={{ maxWidth: 540, color: mutedText, fontSize: { xs: 15, md: 16 }, lineHeight: 1.6 }}>
                  A confidential auction room built on Midnight. Commit your offer without showing your strategy, then prove the bid is authentic when the room opens.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={1.5} sx={{ pt: 0.5 }}>
                  <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => isConnected ? navigate('/dashboard') : connect()} sx={{ minWidth: 172 }}>
                    {isConnected ? 'Enter auction room' : 'Connect to begin'}
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/privacy')} sx={{ minWidth: 150 }}>Understand the model</Button>
                </Stack>
                <Stack direction="row" justifyContent={{ xs: 'center', md: 'flex-start' }} spacing={{ xs: 2, sm: 3 }} sx={{ pt: 1, flexWrap: 'wrap', rowGap: 1 }}>
                  {['No bid leakage', 'Client-side proofing', 'Open verification'].map((label) => (
                    <Stack direction="row" spacing={1} alignItems="center" key={label}>
                      <VerifiedOutlinedIcon sx={{ color: redMain, fontSize: 17 }} />
                      <Typography sx={{ color: mutedText, fontSize: 12 }}>{label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5.5}>
              <Surface sx={{ maxWidth: 480, width: '100%', ml: { md: 'auto' }, mr: { md: 0 }, mx: 'auto', p: { xs: 3, md: 3.5 }, position: 'relative', overflow: 'hidden', animation: 'revealUp 0.7s 0.12s ease both', '&::before': { content: '""', position: 'absolute', left: 0, right: 0, height: 1, background: redMain, opacity: 0.75, animation: 'scan 5s ease-in-out infinite' } }}>
                <Stack justifyContent="space-between" spacing={2.5} sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.12em' }}>LIVE AUCTION ROOM</Typography>
                    <Chip label="COMMIT OPEN" size="small" sx={{ color: redSoft, border: `1px solid ${redMain}`, background: 'rgba(179,38,45,0.1)', height: 24, fontSize: 10 }} />
                  </Stack>
                  <Box sx={{ display: 'grid', placeItems: 'center', py: 1.5 }}>
                    <div className="sb-card">
                      <div className="sb-border"></div>
                      <div className="sb-content">
                        <div className="sb-logo">
                          <div className="sb-logo1">
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ height: '30px', width: '30px' }}>
                              <path d="M16 2L3 8V16C3 23.5 8.5 30 16 32C23.5 30 29 23.5 29 16V8L16 2ZM16 7L24 10.7V16C24 21.2 20.3 25.8 16 27.4C11.7 25.8 8 21.2 8 16V10.7L16 7Z" fill={redMain} />
                              <path d="M12.5 11.5C12.5 10.7 13.2 10 14 10H18C18.8 10 19.5 10.7 19.5 11.5V13.2C19.5 14 18.8 14.7 18 14.7H14C13.2 14.7 12.5 15.4 12.5 16.2V18.5C12.5 19.3 13.2 20 14 20H18.5" fill="none" stroke={redMain} strokeWidth="2.4" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="sb-logo2">
                            <svg viewBox="0 0 125 32" xmlns="http://www.w3.org/2000/svg" style={{ height: '30px', width: '125px' }}>
                              <text x="0" y="23" fill={redMain} fontFamily='"Inter", sans-serif' fontWeight="800" fontSize="19" letterSpacing="1px">EALEDBID</text>
                            </svg>
                          </div>
                          <span className="sb-trail"></span>
                        </div>
                        <span className="sb-logo-bottom-text">SEALEDBID.APP</span>
                      </div>
                      <span className="sb-bottom-text">ZERO KNOWLEDGE AUCTIONS</span>
                    </div>
                  </Box>
                  <Box sx={{ borderTop: `1px solid ${divider}`, pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ color: mutedText, fontSize: 12 }}>Commitment status</Typography>
                      <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 11 }}>WAITING FOR REVEAL</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={62} sx={{ height: 3, background: divider, '& .MuiLinearProgress-bar': { background: redMain } }} />
                  </Box>
                </Stack>
              </Surface>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 11 } }}>
        <Box sx={{ mt: { xs: 7, md: 11 } }}>
          <Grid container spacing={3} alignItems="flex-end" sx={{ mb: 4 }}>
            <Grid item xs={12} md={7}>
              <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 11, letterSpacing: '0.14em', mb: 1.5, fontWeight: 500 }}>WHY THIS EXISTS</Typography>
              <Typography variant="h3" sx={{ color: paperText, fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' }, fontWeight: 800, lineHeight: 1.15 }}>A fairer room for high-signal decisions.</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography sx={{ color: mutedText, fontSize: 15, lineHeight: 1.7, pb: 0.5 }}>Traditional auctions reveal too much, too early. SealedBid creates a deliberate gap between making an offer and revealing it.</Typography>
            </Grid>
          </Grid>
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

        <Grid container spacing={3} alignItems="stretch" sx={{ mt: { xs: 8, md: 12 } }}>
          {/* Left Card: SEE THE MECHANIC */}
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Surface sx={{ p: { xs: 3.5, md: 4.5 }, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 4 }}>
              <Box>
                <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1, fontWeight: 700 }}>SEE THE MECHANIC</Typography>
                <Typography variant="h4" sx={{ color: paperText, fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>A bid becomes a commitment.</Typography>
                <Typography sx={{ color: mutedText, lineHeight: 1.6, maxWidth: 520, fontSize: 14, mb: 3 }}>
                  Type a test amount and watch your private input turn into a public commitment. This is a visual demo running locally.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                  <TextField fullWidth value={mockBid} onChange={(event) => setMockBid(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Enter a test amount" InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 13 }}>TOK</Typography></InputAdornment>, sx: { borderRadius: 2.5 } }} />
                  <Button variant="contained" onClick={simulateProof} disabled={isProving || !mockBid} sx={{ minWidth: 145, height: 48, borderRadius: 2.5, background: redMain, fontWeight: 700, '&:hover': { background: '#c23b34' } }}>
                    {isProving ? <CircularProgress size={18} color="inherit" /> : 'Create proof'}
                  </Button>
                </Stack>
                {isProving && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, border: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <Typography sx={{ color: mutedText, fontSize: 12, mb: 1, fontFamily: '"DM Mono", monospace' }}>Generating ZK proof locally...</Typography>
                    <LinearProgress sx={{ height: 4, borderRadius: 2, background: divider, '& .MuiLinearProgress-bar': { background: redMain } }} />
                  </Box>
                )}
                {proofResult && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, border: `1px solid ${redMain}`, background: isDark ? 'rgba(217,74,66,0.08)' : 'rgba(217,74,66,0.05)' }}>
                    <Typography sx={{ color: redSoft, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.1em', mb: 0.5, fontWeight: 700 }}>PUBLIC COMMITMENT HASH</Typography>
                    <Typography sx={{ color: paperText, fontFamily: '"DM Mono", monospace', fontSize: 11, wordBreak: 'break-all' }}>{proofResult}</Typography>
                  </Box>
                )}
              </Box>
              <Typography sx={{ color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 10, mt: 3, opacity: 0.7, fontWeight: 700, letterSpacing: '0.1em' }}>
                ZERO-KNOWLEDGE CIRCUIT DEMO
              </Typography>
            </Surface>
          </Grid>

          {/* Right Card: THREE PHASES */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Surface sx={{ p: { xs: 3.5, md: 4.5 }, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 4, background: isDark ? '#1C1919' : '#F8F7F7', borderColor: divider }}>
              <Box>
                <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 1, fontWeight: 700 }}>THREE PHASES</Typography>
                <Typography variant="h4" sx={{ color: paperText, fontWeight: 800, mb: 3, letterSpacing: '-0.02em' }}>How it executes.</Typography>
                <Stack spacing={2.5}>
                  {[
                    ['01', 'Commit', 'Submit a sealed offer without revealing your number.'],
                    ['02', 'Reveal', 'Prove your offer matches the initial commitment.'],
                    ['03', 'Resolve', 'Finalize the winning bid on-chain automatically.'],
                  ].map(([num, title, desc]) => (
                    <Stack key={num} direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'rgba(217,74,66,0.12)', border: `1px solid ${redMain}`, display: 'grid', placeItems: 'center', mt: 0.2 }}>
                        <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 11, fontWeight: 700 }}>{num}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: paperText, fontWeight: 700, fontSize: 16 }}>{title}</Typography>
                        <Typography sx={{ color: mutedText, fontSize: 13, lineHeight: 1.5, mt: 0.3 }}>{desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
              <Button variant="outlined" onClick={() => navigate('/privacy')} endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 3.5, alignSelf: 'flex-start', color: paperText, borderColor: divider, borderRadius: 2.5, px: 2.5, py: 1, fontSize: 13, fontWeight: 600, '&:hover': { borderColor: redMain, color: redMain, background: 'rgba(217,74,66,0.06)' } }}>
                Read the privacy model
              </Button>
            </Surface>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 10, md: 14 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3.5 }}>
            <Box>
              <Typography sx={{ color: redMain, fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.14em', mb: 0.8, fontWeight: 700 }}>
                YOUR ROOMS
              </Typography>
              <Typography variant="h4" sx={{ color: paperText, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Recent auctions
              </Typography>
            </Box>
            <Button
              onClick={() => navigate('/dashboard')}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '18px !important' }} />}
              sx={{
                color: paperText,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 2.5,
                px: 2,
                py: 0.8,
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: redMain,
                  color: redMain,
                  background: isDark ? 'rgba(217,74,66,0.06)' : 'rgba(217,74,66,0.04)',
                },
              }}
            >
              Open room
            </Button>
          </Stack>
          {recentAuctions.length > 0 ? (
            <Grid container spacing={2.5}>
              {recentAuctions.map((auction) => (
                <Grid item xs={12} md={4} key={auction.address} sx={{ display: 'flex' }}>
                  <Surface
                    sx={{
                      p: 3,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderRadius: 3.5,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: redMain,
                        transform: 'translateY(-2px)',
                        boxShadow: isDark ? '0 12px 28px rgba(217,74,66,0.12)' : '0 12px 28px rgba(0,0,0,0.06)',
                      },
                    }}
                    onClick={() => navigate(`/dashboard?address=${auction.address}`)}
                  >
                    <Box>
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
                        <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: mutedText, opacity: 0.6 }} />
                      </Stack>
                      <Typography sx={{ color: paperText, fontSize: 17, fontWeight: 700, mb: 1.5, lineHeight: 1.35 }}>
                        {auction.name || 'Untitled auction'}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <AddressHash address={auction.address} />
                    </Box>
                  </Surface>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Surface sx={{ p: 4, borderStyle: 'dashed', textAlign: 'center' }}>
              <Typography sx={{ color: mutedText, fontSize: 14 }}>No rooms saved yet. Create the first private auction when you are ready.</Typography>
            </Surface>
          )}
        </Box>
      </Container>
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </MainLayout>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
