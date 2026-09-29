import React from 'react';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import { Header } from './Header';

const footerGroups = [
  { title: 'Platform', links: [{ label: 'Auction room', href: '/dashboard' }, { label: 'Create auction', href: '/admin' }, { label: 'Verify result', href: '/verify' }] },
  { title: 'Learn', links: [{ label: 'Privacy model', href: '/privacy' }, { label: 'How sealed bids work', href: '/privacy' }] },
];

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.35, backgroundImage: 'radial-gradient(circle at 85% 8%, rgba(217,74,66,0.09), transparent 24rem)', zIndex: 0 } }}>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Header />
      <Box component="main">{children}</Box>
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', mt: { xs: 8, md: 13 }, pt: { xs: 6, md: 9 }, pb: 4 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={{ xs: 6, md: 10 }}>
            <Box sx={{ maxWidth: 360 }}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                <Box component="img" src="/sealedbid-logo.png" alt="SealedBid logo" sx={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 1.5, background: '#fff' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em' }}>SealedBid</Typography>
              </Stack>
              <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.7 }}>Private auctions with public proof. Make high-signal decisions without giving away your strategy.</Typography>
              <Typography sx={{ color: 'primary.main', fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.13em', mt: 3 }}>SEALED / VERIFIED / PRIVATE</Typography>
            </Box>
            <Stack direction="row" spacing={{ xs: 7, sm: 12 }} flexWrap="wrap" useFlexGap>
              {footerGroups.map((group) => <Box key={group.title} sx={{ minWidth: 130 }}><Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2.2 }}>{group.title}</Typography><Stack spacing={1.3}>{group.links.map((link) => <Link key={link.label} href={link.href} underline="none" sx={{ color: 'text.secondary', fontSize: 13, '&:hover': { color: 'primary.main' } }}>{link.label}</Link>)}</Stack></Box>)}
              <Box sx={{ minWidth: 150 }}><Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2.2 }}>Network</Typography><Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Midnight Preprod</Typography><Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 1 }}>Built by Shakshi Kotwala.</Typography></Box>
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 7, pt: 3 }}>
            <Typography sx={{ color: 'text.secondary', fontFamily: '"DM Mono", monospace', fontSize: 10, letterSpacing: '0.05em' }}>© 2025 SEALEDBID. ALL RIGHTS RESERVED.</Typography>
            <Link href="#root" underline="none" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, color: 'text.secondary', fontSize: 12, '&:hover': { color: 'primary.main' } }}>Back to top <ArrowUpwardRoundedIcon sx={{ fontSize: 15 }} /></Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  </Box>
);
