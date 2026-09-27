import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';

export interface TextPromptDialogProps {
  prompt: string;
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}

export const TextPromptDialog: React.FC<Readonly<TextPromptDialogProps>> = ({
  prompt,
  isOpen,
  onCancel,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 0;

  const reset = () => setText('');

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
        <Typography variant="h4" sx={{ fontSize: '1.1rem' }}>
          {prompt}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) {
              onSubmit(text.trim());
              reset();
            }
          }}
          data-testid="text-prompt-input"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            onCancel();
          }}
          data-testid="text-prompt-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit(text.trim());
            reset();
          }}
          data-testid="text-prompt-submit-btn"
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
};
