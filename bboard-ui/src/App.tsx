import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container, Grid } from '@mui/material';
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
            <Grid item xs={12} md={4} key={i}>
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
