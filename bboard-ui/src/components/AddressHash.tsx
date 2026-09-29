import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export interface AddressHashProps {
  address: string;
  sx?: Record<string, unknown>;
  visibleLength?: number;
}

export const AddressHash: React.FC<AddressHashProps> = ({ address, sx, visibleLength = 12 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paperText = theme.palette.text.primary;
  const mutedText = theme.palette.text.secondary;
  const redMain = theme.palette.primary.main;
  const redSoft = theme.palette.error.main;

  if (!address) return null;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const head = address.slice(0, visibleLength);
  const tail = address.slice(visibleLength);

  if (isExpanded) {
    return (
      <Box
        onClick={toggleExpand}
        sx={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 11,
          color: paperText,
          wordBreak: 'break-all',
          cursor: 'pointer',
          p: 1.2,
          borderRadius: 2,
          background: isDark ? 'rgba(217,74,66,0.1)' : 'rgba(217,74,66,0.06)',
          border: `1px solid ${redMain}`,
          transition: 'all 0.25s ease',
          boxShadow: `0 4px 14px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(217,74,66,0.12)'}`,
          ...sx,
        }}
        title="Click to collapse address"
      >
        <Typography component="span" sx={{ color: redMain, fontSize: 10, mr: 1, fontWeight: 700, letterSpacing: '0.08em' }}>
          HASH:
        </Typography>
        {address}
        <Typography component="span" sx={{ color: redSoft, fontSize: 10, ml: 1, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          [collapse]
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={toggleExpand}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        fontFamily: '"DM Mono", monospace',
        fontSize: 11,
        color: mutedText,
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
        py: 0.5,
        px: 1.2,
        borderRadius: 1.8,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: redMain,
          color: paperText,
          background: isDark ? 'rgba(217,74,66,0.06)' : 'rgba(217,74,66,0.04)',
          '& .hash-blur': { filter: 'blur(1.5px)', opacity: 0.85 },
          '& .hash-hint': { opacity: 1 },
        },
        ...sx,
      }}
      title="Click to reveal full contract address"
    >
      <span style={{ fontWeight: 500 }}>{head}</span>
      <span
        className="hash-blur"
        style={{
          filter: 'blur(3.5px)',
          opacity: 0.5,
          transition: 'all 0.3s ease',
          marginLeft: '3px',
          letterSpacing: '0.5px',
        }}
      >
        {tail ? tail.slice(0, 10) : '..........'}
      </span>
      <Typography
        className="hash-hint"
        component="span"
        sx={{
          fontSize: 9,
          color: redMain,
          ml: 1,
          opacity: 0.7,
          fontWeight: 700,
          transition: 'opacity 0.2s ease',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}
      >
        [reveal]
      </Typography>
    </Box>
  );
};
