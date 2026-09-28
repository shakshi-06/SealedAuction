import React from 'react';
import { AppBar, Box, Typography, Button, Stack, IconButton, useTheme } from '@mui/material';
import { useWallet, useAppTheme } from '../../contexts';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export const Header: React.FC = () => {
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin', path: '/admin' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Verify', path: '/verify' },
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
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20, 20, 20, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '24px',
        py: 1.5,
        px: 3,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box 
            sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: '50%', 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#fff'
            }}
          >
            <Box 
              component="img" 
              src="/logo.png" 
              alt="SealedAuction Logo" 
              sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                transform: 'scale(1.35)',
                transformOrigin: 'center center'
              }} 
            />
          </Box>
        </Box>

        {/* Navigation */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)', p: 0.5, borderRadius: '20px', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? (theme.palette.mode === 'dark' ? '#ccff00' : 'text.primary') : 'text.secondary',
                  textTransform: 'none',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                  px: 3,
                  py: 1,
                  borderRadius: '16px',
                  background: isActive ? (theme.palette.mode === 'dark' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
                  '&:hover': { color: 'text.primary', background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        {/* Connect & Theme Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {!isConnected ? (
            <Button
              onClick={() => connect()}
              disabled={isConnecting}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{
                background: theme.palette.primary.main,
                color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                borderRadius: '16px',
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                '&:hover': {
                  background: theme.palette.mode === 'dark' ? '#aacc00' : theme.palette.primary.dark,
                  transform: 'scale(1.02)'
                },
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect wallet'}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', p: 0.5, pr: 2, borderRadius: '16px', border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
              <Box sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.mode === 'dark' ? '#000' : '#fff', px: 2, py: 0.75, borderRadius: '12px', fontWeight: '600', fontFamily: 'Inter' }}>
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
