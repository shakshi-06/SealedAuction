import React from 'react';
import { AppBar, Box, Button, Stack, Typography } from '@mui/material';
import { useWallet } from '../../contexts';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';

export const Header: React.FC = () => {
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/' },
    { label: 'Auction room', path: '/dashboard' },
    { label: 'Create auction', path: '/admin' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(11,11,11,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(244,241,236,0.08)', zIndex: 1100 }}>
      <Box sx={{ width: 'min(1380px, calc(100% - 40px))', mx: 'auto', py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', minWidth: 160 }}>
          <Box sx={{ width: 34, height: 34, display: 'grid', placeItems: 'center', border: '1px solid #B3262D', color: '#F4F1EC', position: 'relative', '&::after': { content: '""', position: 'absolute', width: 8, height: 8, background: '#B3262D', right: -4, bottom: -4 } }}>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 13, fontWeight: 500 }}>SA</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.03em', fontSize: 17, lineHeight: 1 }}>SealedAuction</Typography>
            <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 9, color: '#A8A39D', letterSpacing: '0.14em', mt: 0.5 }}>PRIVATE MARKET</Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' }, background: '#151313', border: '1px solid #2A2928', p: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Button key={item.path} onClick={() => navigate(item.path)} sx={{ px: 2, color: active ? '#F4F1EC' : '#8D8882', background: active ? '#2A2928' : 'transparent', '&:hover': { color: '#F4F1EC', background: '#211F1E' } }}>
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, minWidth: 210 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, color: '#A8A39D', fontFamily: '"DM Mono", monospace', fontSize: 11 }}>
            <Box sx={{ width: 6, height: 6, background: '#B3262D', borderRadius: '50%' }} />
            PREPROD
          </Box>
          {!isConnected ? (
            <Button onClick={() => connect()} disabled={isConnecting} variant="outlined" startIcon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />} sx={{ minWidth: 150 }}>
              {isConnecting ? 'Connecting' : 'Connect wallet'}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #3A3735', background: '#151313', pl: 1.3, pr: 0.5, py: 0.5 }}>
              <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#F4F1EC' }}>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}</Typography>
              <Button size="small" onClick={disconnect} sx={{ minWidth: 0, px: 1, color: '#D95C61' }}>Exit</Button>
            </Box>
          )}
          <ArrowOutwardRoundedIcon sx={{ display: { xs: 'none', sm: 'block' }, color: '#6E6A65', fontSize: 18 }} />
        </Box>
      </Box>
    </AppBar>
  );
};
