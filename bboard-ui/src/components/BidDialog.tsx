import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Stack } from '@mui/material';
import React, { useState } from 'react';

export interface BidDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (amount: bigint, liquidity: bigint) => void;
}

export const BidDialog: React.FC<Readonly<BidDialogProps>> = ({ isOpen, onCancel, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [liquidity, setLiquidity] = useState('');

  const amountValid = /^[0-9]+$/.test(amount) && amount.length > 0;
  const liquidityValid = /^[0-9]+$/.test(liquidity) && liquidity.length > 0;
  const coversBid = amountValid && liquidityValid && BigInt(liquidity) >= BigInt(amount);
  const canSubmit = amountValid && liquidityValid && coversBid;

  const reset = () => {
    setAmount('');
    setLiquidity('');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        reset();
        onCancel();
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        <Typography variant="h4" sx={{ fontSize: '1.1rem' }} data-testid="bid-dialog-title">
          Seal your bid
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            Your bid amount stays sealed until the reveal phase. Only a commitment hash is submitted now.
          </Typography>
          <TextField
            label="Bid amount"
            variant="outlined"
            fullWidth
            size="small"
            autoComplete="off"
            data-testid="bid-dialog-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            error={amount.length > 0 && !amountValid}
          />
          <TextField
            label="Wallet liquidity available"
            variant="outlined"
            fullWidth
            size="small"
            autoComplete="off"
            data-testid="bid-dialog-liquidity"
            value={liquidity}
            onChange={(e) => setLiquidity(e.target.value.replace(/[^0-9]/g, ''))}
            error={liquidity.length > 0 && !liquidityValid}
            helperText={
              amountValid && liquidityValid && !coversBid
                ? 'Liquidity must cover the bid amount'
                : 'Proven at reveal without disclosing the balance'
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="bid-dialog-cancel-btn"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          data-testid="bid-dialog-submit-btn"
          onClick={() => {
            onSubmit(BigInt(amount), BigInt(liquidity));
            reset();
          }}
        >
          Seal bid
        </Button>
      </DialogActions>
    </Dialog>
  );
};
