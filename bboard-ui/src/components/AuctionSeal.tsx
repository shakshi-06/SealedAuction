import React from 'react';
import { Box, Typography } from '@mui/material';
import { Phase } from '../../../contract/src/index';
import { type BBoardDerivedState } from '../../../api/src/index';

export interface AuctionSealProps {
  state: BBoardDerivedState;
}

/**
 * The signature visual of the auction: a sealed block in the commit phase,
 * cracking open on reveal, and settling into a resolved winner line.
 * This is the single deliberate motion moment on the page; everything
 * around it stays still.
 */
export const AuctionSeal: React.FC<Readonly<AuctionSealProps>> = ({ state }) => {
  if (state.phase === Phase.COMMIT) {
    return (
      <Box
        data-testid="auction-seal-commit"
        sx={{
          height: 160,
          backgroundColor: '#000',
          border: '1px solid #3D3D3D',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            color: '#8A8A8A',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '0.7rem',
          }}
        >
          {state.hasActiveBid ? 'Bid sealed, pending reveal' : 'No bid sealed'}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            border: '2px solid #3D3D3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #8A8A8A' }} />
        </Box>
      </Box>
    );
  }

  if (state.phase === Phase.REVEAL) {
    return (
      <Box
        data-testid="auction-seal-reveal"
        sx={{
          height: 160,
          backgroundColor: '#000',
          border: '1px solid #E8332B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          position: 'relative',
          overflow: 'hidden',
          '@keyframes pulse': {
            '0%': { opacity: 0.35 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.35 },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(232,51,43,0.12) 100%)',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            color: '#E8332B',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '0.7rem',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          Reveal phase open
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontSize: '1.8rem', fontFamily: '"IBM Plex Mono", monospace' }}
          data-testid="auction-highest-bid"
        >
          {state.highestBid > 0n ? state.highestBid.toString() : '—'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      data-testid="auction-seal-resolved"
      sx={{
        height: 160,
        backgroundColor: '#000',
        border: '1px solid #3D3D3D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          color: '#8A8A8A',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontSize: '0.7rem',
        }}
      >
        Auction resolved
      </Typography>
      <Typography variant="h3" sx={{ fontSize: '2.1rem', fontFamily: '"IBM Plex Mono", monospace' }} data-testid="auction-final-bid">
        {state.highestBid.toString()}
      </Typography>
    </Box>
  );
};
