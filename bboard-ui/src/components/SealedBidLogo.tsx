import React from 'react';

export const SealedBidLogo: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 32, color = '#D94A42', className }) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ height: size, width: size, display: 'block' }} className={className}>
    <path d="M16 2L3 8V16C3 23.5 8.5 30 16 32C23.5 30 29 23.5 29 16V8L16 2ZM16 7L24 10.7V16C24 21.2 20.3 25.8 16 27.4C11.7 25.8 8 21.2 8 16V10.7L16 7Z" fill={color} />
    <path d="M12.5 11.5C12.5 10.7 13.2 10 14 10H18C18.8 10 19.5 10.7 19.5 11.5V13.2C19.5 14 18.8 14.7 18 14.7H14C13.2 14.7 12.5 15.4 12.5 16.2V18.5C12.5 19.3 13.2 20 14 20H18.5" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
