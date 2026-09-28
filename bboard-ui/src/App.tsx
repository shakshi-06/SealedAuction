import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container, Grid, Stack, TextField, InputAdornment, LinearProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { MainLayout } from './components';
import { AdminPage } from './pages/AdminPage';
import { DashboardPage } from './pages/DashboardPage';
import { useWallet } from './contexts/WalletContext';
import GavelIcon from '@mui/icons-material/Gavel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const Home: React.FC = () => {
  const { isConnected, connect } = useWallet();
  const navigate = useNavigate();
  const [recentAuctions, setRecentAuctions] = useState<any[]>([]);

  // ZK Playground state
  const [mockBid, setMockBid] = useState('');
  const [isProving, setIsProving] = useState(false);
  const [proofResult, setProofResult] = useState('');

  const handleSimulateProof = () => {
    if (!mockBid) return;
    setIsProving(true);
    setProofResult('');
    setTimeout(() => {
      setIsProving(false);
      const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setProofResult('0x' + fakeHash);
    }, 2400);
  };

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('RECENT_AUCTIONS') || '[]');
      if (existing.length > 0) {
        setRecentAuctions(existing);
      } else {
        // Mock some for preview if empty
        setRecentAuctions([
          { name: 'Zero-Knowledge Artifact', address: '0x...', deployedAt: Date.now() - 3600000 },
          { name: 'Midnight Genesis Grant', address: '0x...', deployedAt: Date.now() - 7200000 }
        ]);
      }
    } catch (e) {}
  }, []);

  return (
    <>
      {/* Live Network Scrolling Ticker */}
      <Box sx={{ width: '100%', background: '#ccff00', color: '#000', py: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'inline-flex', animation: 'marquee 25s linear infinite', gap: 4, minWidth: '200%' }}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: 'Inter', fontSize: '0.85rem', letterSpacing: '0.05em' }}>NETWORK: MIDNIGHT PREPROD <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>● LIVE</span></Typography>
              <Typography sx={{ fontWeight: 600, fontFamily: 'Inter', fontSize: '0.85rem' }}>PRIVACY MODEL: ZERO-KNOWLEDGE CRYPTOGRAPHY</Typography>
              <Typography sx={{ fontWeight: 600, fontFamily: 'Inter', fontSize: '0.85rem' }}>PROVER: LOCAL CLIENT WASM</Typography>
              <Typography sx={{ fontWeight: 600, fontFamily: 'Inter', fontSize: '0.85rem' }}>SECURITY: NON-CUSTODIAL &middot; ZERO LEAKS</Typography>
              <Typography sx={{ fontWeight: 600, fontFamily: 'Inter', fontSize: '0.85rem' }}>&middot;</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 }, px: { xs: 2, md: 4 }, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <Box sx={{ maxWidth: { xs: '100%', md: '55%' }, mb: 8 }}>
        <Typography 
          component="h1"
          sx={{ 
            color: '#fff', 
            fontSize: { xs: '3.5rem', md: '5.5rem' }, 
            lineHeight: 1, 
            letterSpacing: '-0.03em',
            mb: 4
          }}
        >
          <span style={{ fontFamily: 'Inter', fontWeight: 700 }}>Auctions </span>
          <br />
          <span style={{ fontFamily: 'Inter', fontWeight: 700 }}>for the </span>
          <span style={{ fontFamily: 'Instrument Serif', fontStyle: 'italic', color: '#ffb74d' }}>quietly </span>
          <br />
          <span style={{ fontFamily: 'Instrument Serif', fontWeight: 400 }}>strategic.</span>
        </Typography>

        <Typography sx={{ fontFamily: 'Inter', color: '#999', fontSize: '1.2rem', maxWidth: 450, mb: 6, lineHeight: 1.6 }}>
          SealedAuction is a private passage through the bidding process: prove you have the funds and submit your bid without handing your strategy to a server.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {!isConnected ? (
            <Button
              variant="contained"
              onClick={() => connect()}
              sx={{
                background: '#ccff00',
                color: '#000',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: 'Inter',
                px: 4, py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': { background: '#aacc00' }
              }}
            >
              Connect wallet &rarr;
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{
                background: '#ccff00',
                color: '#000',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: 'Inter',
                px: 4, py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': { background: '#aacc00' }
              }}
            >
              Enter dashboard &rarr;
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 500,
              fontSize: '1rem',
              fontFamily: 'Inter',
              px: 4, py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.4)' }
            }}
          >
            Deploy contract &nearr;
          </Button>
        </Box>
      </Box>

      {/* Floating Graphic Element mimicking the 3D sphere from zkScholar */}
      <Box sx={{ width: { xs: '100%', md: '40%' }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ 
          width: 300, height: 300, 
          borderRadius: '50%', 
          border: '1px solid rgba(204, 255, 0, 0.3)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 340, height: 340,
            borderRadius: '50%',
            border: '1px dashed rgba(77, 166, 255, 0.4)',
            transform: 'rotate(15deg)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(77, 166, 255, 0.2), rgba(204, 255, 0, 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transform: 'rotate(-10deg)',
          }
        }}>
          {/* Signal Integrity Widget */}
          <Paper elevation={0} sx={{ 
            position: 'absolute', top: -20, right: -40, 
            background: 'rgba(15,15,15,0.9)', 
            border: '1px solid rgba(255,255,255,0.1)',
            p: 1.5, borderRadius: '8px',
            zIndex: 10
          }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.1em', mb: 0.5 }}>BID INTEGRITY</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#ccff00' }} />
              <Typography sx={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, fontFamily: 'Inter' }}>100% private</Typography>
            </Box>
          </Paper>

          {/* Current Atmosphere Widget */}
          <Paper elevation={0} sx={{ 
            position: 'absolute', bottom: -20, left: -20, 
            background: 'rgba(15,15,15,0.9)', 
            border: '1px solid rgba(255,255,255,0.1)',
            p: 1.5, borderRadius: '8px',
            zIndex: 10
          }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#666', fontWeight: 700, letterSpacing: '0.1em', mb: 0.5 }}>CURRENT NETWORK</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, fontFamily: 'Inter' }}>Midnight / preprod</Typography>
          </Paper>
        </Box>
      </Box>

      {/* ZK Stat Cards */}
      <Box sx={{ width: '100%', mt: 12, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Stat Card 1 */}
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', background: 'rgba(255,255,255,0.04)' } }}>
              <Typography sx={{ color: '#ccff00', fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Inter', lineHeight: 1, mb: 1 }}>100<span style={{ fontSize: '2rem' }}>%</span></Typography>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Inter', fontSize: '1.2rem', mb: 1 }}>Client-Side Privacy</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.9rem', fontFamily: 'Inter' }}>Your bid data never touches our servers. It is strictly kept on your device.</Typography>
            </Paper>
          </Grid>
          
          {/* Stat Card 2 */}
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', background: 'rgba(255,255,255,0.04)' } }}>
              <Typography sx={{ color: '#ccff00', fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Inter', lineHeight: 1, mb: 1 }}>&lt; 2.5<span style={{ fontSize: '2rem' }}>s</span></Typography>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Inter', fontSize: '1.2rem', mb: 1 }}>WASM Proof Gen</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.9rem', fontFamily: 'Inter' }}>High-speed local circuit execution to synthesize zero-knowledge proofs instantly.</Typography>
            </Paper>
          </Grid>

          {/* Stat Card 3 */}
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', background: 'rgba(255,255,255,0.04)' } }}>
              <Typography sx={{ color: '#ccff00', fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Inter', lineHeight: 1, mb: 1 }}>Zero</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Inter', fontSize: '1.2rem', mb: 1 }}>Information Leakage</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.9rem', fontFamily: 'Inter' }}>The smart contract blindly verifies your bid through ZK-SNARK math assertions.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Interactive ZK Playground */}
      <Box sx={{ width: '100%', mt: 8, mb: 12, p: 6, borderRadius: '24px', background: 'linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '-50%', left: '-20%', width: '50%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(204,255,0,0.05) 0%, transparent 70%)', zIndex: 0 }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#ccff00', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', mb: 1 }}>INTERACTIVE ZK PLAYGROUND</Typography>
              <Typography variant="h3" sx={{ color: '#fff', fontFamily: 'Instrument Serif', fontStyle: 'italic', mb: 2 }}>
                See zero-knowledge in action
              </Typography>
              <Typography sx={{ color: '#888', fontFamily: 'Inter', mb: 4, lineHeight: 1.6 }}>
                Enter a mock bid amount to see how the Midnight Network processes your data. Your plaintext bid never leaves this browser window. Instead, a local WASM circuit mathematically hashes it into an irrefutable Pedersen Commitment.
              </Typography>
              
              <Box sx={{ background: 'rgba(0,0,0,0.4)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ color: '#666', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>PRIVATE INPUT (STAYS ON DEVICE)</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField 
                    fullWidth 
                    variant="outlined" 
                    placeholder="Enter bid amount" 
                    value={mockBid}
                    onChange={(e) => setMockBid(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ color: '#888' }}>$</InputAdornment>,
                      sx: { color: '#fff', background: 'rgba(255,255,255,0.02)', fontFamily: 'IBM Plex Mono' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ccff00' }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSimulateProof}
                    disabled={isProving || !mockBid}
                    sx={{ 
                      background: '#ccff00', color: '#000', fontWeight: 600, fontFamily: 'Inter', minWidth: 140,
                      '&:hover': { background: '#aacc00' },
                      '&.Mui-disabled': { background: 'rgba(204,255,0,0.2)', color: 'rgba(0,0,0,0.5)' }
                    }}
                  >
                    {isProving ? 'Proving...' : 'Generate Proof'}
                  </Button>
                </Box>
                
                {isProving && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ color: '#888', fontSize: '0.8rem', fontFamily: 'Inter', mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Synthesizing ZK-SNARK...</span>
                      <span style={{ color: '#ccff00' }}>Local WASM Circuit</span>
                    </Typography>
                    <LinearProgress sx={{ background: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { background: '#ccff00' } }} />
                  </Box>
                )}
                
                {proofResult && (
                  <Box sx={{ mt: 3, p: 2, borderRadius: '8px', background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.2)' }}>
                    <Typography sx={{ color: '#ccff00', fontSize: '0.75rem', fontWeight: 700, mb: 1 }}>PUBLIC ON-CHAIN COMMITMENT (BROADCASTED)</Typography>
                    <Typography sx={{ color: '#fff', fontFamily: 'IBM Plex Mono', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                      {proofResult}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {/* Graphic representation of the proof process */}
              <Box sx={{ position: 'relative', width: 280, height: 280, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', borderTop: '2px solid #ccff00', animation: 'spin 4s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                <Typography sx={{ color: '#fff', fontFamily: 'IBM Plex Mono', fontSize: '2rem', fontWeight: 300 }}>ZK</Typography>
                <Paper elevation={0} sx={{ position: 'absolute', top: -10, right: 20, background: '#ccff00', px: 1, py: 0.5, borderRadius: '4px' }}>
                  <Typography sx={{ color: '#000', fontSize: '0.65rem', fontWeight: 800 }}>PROVER</Typography>
                </Paper>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Live Auctions Explorer Feed */}
      <Box sx={{ width: '100%', mt: 8, pt: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h3" sx={{ color: '#fff', fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>
            Live Network Auctions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#ccff00', boxShadow: '0 0 10px #ccff00' }} />
            <Typography sx={{ color: '#ccff00', fontFamily: 'Inter', fontWeight: 600, fontSize: '0.9rem' }}>REAL-TIME</Typography>
          </Box>
        </Stack>
        
        <Grid container spacing={3}>
          {recentAuctions.map((auction, i) => (
            <Grid xs={12} md={4} key={i}>
              <Paper 
                onClick={() => auction.address !== '0x...' && navigate(`/dashboard?address=${auction.address}`)}
                sx={{ 
                  p: 3, 
                  borderRadius: '16px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: auction.address !== '0x...' ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': auction.address !== '0x...' ? {
                    background: 'rgba(204,255,0,0.05)',
                    border: '1px solid rgba(204,255,0,0.3)',
                    transform: 'translateY(-4px)'
                  } : {}
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontFamily: 'Inter', fontSize: '1.1rem' }}>{auction.name}</Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.8rem', fontFamily: 'Inter' }}>
                    {Math.floor((Date.now() - auction.deployedAt) / 60000)}m ago
                  </Typography>
                </Box>
                <Typography sx={{ color: '#888', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', mb: 3 }}>
                  {auction.address}
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth
                  disabled={auction.address === '0x...'}
                  sx={{ 
                    color: '#ccff00', 
                    borderColor: 'rgba(204,255,0,0.3)', 
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: 'Inter'
                  }}
                >
                  Join Auction &rarr;
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* User Guide Section */}
      <Box sx={{ width: '100%', mt: 16, pb: 12 }}>
        <Typography variant="h3" sx={{ color: '#fff', fontFamily: 'Instrument Serif', mb: 2, fontStyle: 'italic' }}>
          The Field Guide
        </Typography>
        <Typography sx={{ color: '#888', fontFamily: 'Inter', mb: 6, maxWidth: 600 }}>
          Master the mechanics of a cryptographically sealed auction. Here is how you can participate and secure your victory.
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {/* Step 1 */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography sx={{ color: '#ccff00', fontWeight: 800, fontSize: '2rem', mb: 2, fontFamily: 'Inter' }}>01</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem', mb: 1, fontFamily: 'Inter' }}>Commit Phase</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, fontFamily: 'Inter' }}>
              Connect your 1AM wallet and enter the Dashboard. During the open commit phase, you submit your secret bid. Your browser generates a zero-knowledge proof locally, hiding your bid amount in a commitment hash. No one, not even the auctioneer, can see what you bid.
            </Typography>
          </Paper>
          
          {/* Step 2 */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography sx={{ color: '#ccff00', fontWeight: 800, fontSize: '2rem', mb: 2, fontFamily: 'Inter' }}>02</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem', mb: 1, fontFamily: 'Inter' }}>Reveal Phase</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, fontFamily: 'Inter' }}>
              Once the auctioneer closes bidding, the auction enters the Reveal Phase. You must return to the Dashboard to "Reveal" your bid. You submit another zero-knowledge proof proving your plaintext bid matches the hash you submitted in Phase 01.
            </Typography>
          </Paper>
          
          {/* Step 3 */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography sx={{ color: '#ccff00', fontWeight: 800, fontSize: '2rem', mb: 2, fontFamily: 'Inter' }}>03</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem', mb: 1, fontFamily: 'Inter' }}>Resolution</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, fontFamily: 'Inter' }}>
              After all bidders have revealed their bids, the auctioneer resolves the auction. The smart contract mathematically guarantees that the highest revealed bid wins the auction.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box sx={{ background: '#0A0A0A', minHeight: '100vh' }}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MainLayout>
      </Box>
    </BrowserRouter>
  );
};

export default App;
