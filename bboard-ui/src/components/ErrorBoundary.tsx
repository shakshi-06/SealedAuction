import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid rgba(217,74,66,0.3)',
              background: 'rgba(217,74,66,0.04)',
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: '#D94A42', fontSize: 44, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              Something went wrong
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred. Please try reloading the page.'}
            </Typography>
            <Button
              variant="contained"
              onClick={this.handleReset}
              startIcon={<RefreshRoundedIcon />}
              sx={{ background: '#B3262D', borderRadius: 2.5, px: 3, py: 1, fontWeight: 700 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
