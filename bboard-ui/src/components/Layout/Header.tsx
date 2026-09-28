import React from 'react';
import { AppBar, Box, Button, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { useWallet, useAppTheme } from '../../contexts';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

export const Header: React.FC = () => {
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;
  const divider = theme.palette.divider;

  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Auction room', path: '/dashboard' },
    { label: 'Create auction', path: '/admin' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Verify', path: '/verify' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: isDark ? 'rgba(11,11,11,0.88)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${divider}`, zIndex: 1100 }}>
      <Box sx={{ width: 'min(1380px, calc(100% - 40px))', mx: 'auto', py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', minWidth: 160 }}>
          <Box sx={{ width: 34, height: 34, display: 'grid', placeItems: 'center', border: `1px solid ${redMain}`, color: paperText, position: 'relative', '&::after': { content: '""', position: 'absolute', width: 8, height: 8, background: redMain, right: -4, bottom: -4 } }}>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 13, fontWeight: 500 }}>SA</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.03em', fontSize: 17, lineHeight: 1, color: paperText }}>SealedAuction</Typography>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 9, color: mutedText, letterSpacing: '0.14em', mt: 0.5 }}>PRIVATE MARKET</Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' }, background: theme.palette.background.default, borderRadius: 1.5, border: `1px solid ${divider}`, p: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Button key={item.path} onClick={() => navigate(item.path)} sx={{ px: 2, color: active ? paperText : mutedText, background: active ? theme.palette.background.paper : 'transparent', boxShadow: active && !isDark ? '0 1px 4px rgba(0,0,0,0.05)' : 'none', '&:hover': { color: paperText, background: isDark ? '#211F1E' : '#F5F5F5' } }}>
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, minWidth: 210 }}>
          <IconButton onClick={toggleTheme} sx={{ color: mutedText, '&:hover': { color: paperText } }}>
            {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, color: mutedText, fontFamily: '"DM Mono", monospace', fontSize: 11 }}>
            <Box sx={{ width: 6, height: 6, background: redMain, borderRadius: '50%' }} />
            PREPROD
          </Box>
          {!isConnected ? (
            <Button onClick={() => connect()} disabled={isConnecting} variant="outlined" startIcon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />} sx={{ minWidth: 150 }}>
              {isConnecting ? 'Connecting' : 'Connect wallet'}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${divider}`, borderRadius: 1.5, background: theme.palette.background.default, pl: 1.3, pr: 0.5, py: 0.5 }}>
              <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 11, color: paperText }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}</Typography>
              <Button size="small" onClick={disconnect} sx={{ minWidth: 0, px: 1, color: redSoft }}>Exit</Button>
            </Box>
          )}
          <ArrowOutwardRoundedIcon sx={{ display: { xs: 'none', sm: 'block' }, color: mutedText, fontSize: 18 }} />
        </Box>
      </Box>
    </AppBar>
  );
};
