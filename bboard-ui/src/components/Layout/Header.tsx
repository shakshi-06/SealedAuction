import React from 'react';
import { AppBar, Box, Typography, Button, Stack } from '@mui/material';
import { useWallet } from '../../contexts/WalletContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const Header: React.FC = () => {
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin', path: '/admin' },
  ];

  return (
    <AppBar
      position="sticky"
      data-testid="header"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        pt: 3,
        px: { xs: 2, md: 8 },
        zIndex: 1100,
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(20, 20, 20, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        py: 1.5,
        px: 3,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box 
            component="img" 
            src="/logo.png" 
            alt="SealedAuction Logo" 
            sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
          />
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Sealed<span style={{ opacity: 0.7 }}>Auction</span>
          </Typography>
        </Box>

        {/* Navigation */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, background: 'rgba(0,0,0,0.5)', p: 0.5, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? '#ccff00' : '#888',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                  px: 3,
                  py: 1,
                  borderRadius: '16px',
                  background: isActive ? 'rgba(204, 255, 0, 0.1)' : 'transparent',
                  '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        {/* Connect Button */}
        <Box>
          {!isConnected ? (
            <Button
              onClick={() => connect()}
              disabled={isConnecting}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{
                background: '#ccff00',
                color: '#000',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: '16px',
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#aacc00',
                  transform: 'scale(1.02)'
                },
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect wallet'}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.05)', p: 0.5, pr: 2, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ bgcolor: '#ccff00', color: '#000', px: 2, py: 0.75, borderRadius: '12px', fontWeight: '600', fontFamily: 'Inter' }}>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
              </Box>
              <Button size="small" onClick={disconnect} sx={{ color: '#ff6b6b', textTransform: 'none', fontWeight: 'bold', fontFamily: 'Inter' }}>
                Disconnect
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </AppBar>
  );
};
