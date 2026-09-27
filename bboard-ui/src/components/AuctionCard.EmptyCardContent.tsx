import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Box, Button, CardActions, CardContent, Stack, Typography } from '@mui/material';
import { TextPromptDialog } from './TextPromptDialog';

export interface EmptyCardContentProps {
  onCreateAuctionCallback: () => void;
  onJoinAuctionCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({
  onCreateAuctionCallback,
  onJoinAuctionCallback,
}) => {
  const [textPromptOpen, setTextPromptOpen] = useState(false);

  return (
    <React.Fragment>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 6 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            border: '1px solid #3D3D3D',
            mx: 'auto',
          }}
        />
        <Typography align="center" variant="body2" data-testid="empty-auction-message">
          Start a new sealed-bid auction, or join one by contract address.
        </Typography>
      </CardContent>
      <CardActions disableSpacing sx={{ justifyContent: 'center', pb: 4 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" data-testid="auction-deploy-btn" onClick={onCreateAuctionCallback}>
            Deploy new auction
          </Button>
          <Button
            variant="outlined"
            data-testid="auction-join-btn"
            onClick={() => setTextPromptOpen(true)}
          >
            Join auction
          </Button>
        </Stack>
      </CardActions>
      <TextPromptDialog
        prompt="Enter contract address"
        isOpen={textPromptOpen}
        onCancel={() => setTextPromptOpen(false)}
        onSubmit={(text) => {
          setTextPromptOpen(false);
          onJoinAuctionCallback(text);
        }}
      />
    </React.Fragment>
  );
};
