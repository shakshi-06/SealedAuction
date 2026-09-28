/**
 * A Single Page Application (SPA) for connecting to and managing a deployed
 * sealed-bid auction contract.
 *
 * @packageDocumentation
 */
import './globals';
import './fonts.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material';
import { setNetworkId, NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import App from './App';
import { ThemeContextProvider } from './contexts/ThemeContext';
import '@midnight-ntwrk/dapp-connector-api';
import * as pino from 'pino';

import { WalletProvider } from './contexts/WalletContext';

const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
setNetworkId(networkId);

export const logger = pino.pino({
  level: import.meta.env.VITE_LOGGING_LEVEL as string,
});

logger.trace(`networkId = ${networkId}`);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
);
