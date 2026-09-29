import React, { useState } from 'react';
import { Box, Container, IconButton, Link, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Link as RouterLink } from 'react-router-dom';
import { SealedBidLogo } from '../SealedBidLogo';

export const Footer: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;

  const [copied, setCopied] = useState(false);

  const sampleAddress = localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || '32da60bb68a1aaf7e81552b4af29b0b88848e96154a373bee';

  const handleCopy = () => {
    void navigator.clipboard.writeText(sampleAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
        mt: { xs: 10, md: 15 },
        pt: { xs: 7, md: 10 },
        pb: 5,
        background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={{ xs: 6, md: 8 }}
          sx={{ mb: 8 }}
        >
          {/* Brand & Description & Socials */}
          <Box sx={{ maxWidth: 360 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <SealedBidLogo size={32} color="#D94A42" />
              <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: paperText }}>
                SealedAuction
              </Typography>
            </Stack>
            <Typography sx={{ color: mutedText, fontSize: 13.5, lineHeight: 1.65, mb: 3 }}>
              Privacy-preserving sealed-bid auctions built on Midnight Network using Compact Zero-Knowledge circuits.
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Tooltip title="GitHub Repository">
                <IconButton
                  component="a"
                  href="https://github.com/shakshi-06/SealedAuction"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${theme.palette.divider}`,
                    color: mutedText,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: redMain,
                      color: redMain,
                      background: isDark ? 'rgba(217,74,66,0.08)' : 'rgba(217,74,66,0.05)',
                    },
                  }}
                >
                  <CodeRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Midnight Website">
                <IconButton
                  component="a"
                  href="https://midnight.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${theme.palette.divider}`,
                    color: mutedText,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: redMain,
                      color: redMain,
                      background: isDark ? 'rgba(217,74,66,0.08)' : 'rgba(217,74,66,0.05)',
                    },
                  }}
                >
                  <LanguageRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Contact / Support">
                <IconButton
                  component="a"
                  href="mailto:contact@midnight.network"
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${theme.palette.divider}`,
                    color: mutedText,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: redMain,
                      color: redMain,
                      background: isDark ? 'rgba(217,74,66,0.08)' : 'rgba(217,74,66,0.05)',
                    },
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ minWidth: 150 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: paperText,
                mb: 2.5,
              }}
            >
              NAVIGATION
            </Typography>
            <Stack spacing={1.5}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Verify Result', path: '/verify' },
                { label: 'Proof Dashboard', path: '/dashboard' },
                { label: 'How It Works', path: '/privacy' },
                { label: 'Admin Portal', path: '/admin' },
              ].map((item) => (
                <Link
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  underline="none"
                  sx={{
                    color: mutedText,
                    fontSize: 13.5,
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    '&:hover': { color: redMain },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Midnight Docs Links */}
          <Box sx={{ minWidth: 160 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: paperText,
                mb: 2.5,
              }}
            >
              MIDNIGHT DOCS
            </Typography>
            <Stack spacing={1.5}>
              {[
                { label: 'Midnight Network', href: 'https://midnight.network' },
                { label: 'Developer Docs', href: 'https://docs.midnight.network' },
                { label: 'Compact Toolchain', href: 'https://docs.midnight.network/develop/reference/compact/overview' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.6,
                    color: mutedText,
                    fontSize: 13.5,
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    '&:hover': { color: redMain },
                  }}
                >
                  {item.label}
                  <OpenInNewRoundedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Preprod Status & Contract Address */}
          <Box sx={{ minWidth: 260, maxWidth: 300 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: paperText,
                mb: 2.5,
              }}
            >
              PREPROD STATUS
            </Typography>

            {/* Status Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                py: 0.6,
                px: 1.5,
                borderRadius: 5,
                background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <Typography sx={{ color: '#10B981', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em' }}>
                Preprod Testnet Active
              </Typography>
            </Box>

            {/* Contract Address Section */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ color: mutedText, fontSize: 11.5, fontWeight: 500 }}>
                  Contract Address:
                </Typography>
                <Typography
                  onClick={handleCopy}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: copied ? '#10B981' : redMain,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {copied ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
                  {copied ? 'Copied' : 'Copy'}
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: '"DM Mono", monospace',
                  fontSize: 11,
                  color: mutedText,
                  wordBreak: 'break-all',
                  letterSpacing: '0.02em',
                }}
              >
                {sampleAddress.slice(0, 18)}...{sampleAddress.slice(-6)}
              </Box>
            </Box>
          </Box>
        </Stack>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: theme.palette.divider,
            pt: 4,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              color: mutedText,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            © 2026 SealedAuction. Built for the Midnight New Moon to Full Hackathon by Shakshi Kotwala.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
