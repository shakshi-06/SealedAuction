import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Typography,
  Chip,
  Stack,
  Button,
  Tooltip,
  Divider,
  Box,
} from '@mui/material';
import CopyIcon from '@mui/icons-material/ContentPasteOutlined';
import StopIcon from '@mui/icons-material/HighlightOffOutlined';
import { type BBoardDerivedState, type DeployedBBoardAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { Phase } from '../../../contract/src/index';
import { EmptyCardContent } from './AuctionCard.EmptyCardContent';
import { BidDialog } from './BidDialog';
import { AuctionSeal } from './AuctionSeal';

export interface AuctionCardProps {
  boardDeployment$?: Observable<BoardDeployment>;
}

const PHASE_LABEL: Record<number, string> = {
  [Phase.COMMIT]: 'Sealed',
  [Phase.REVEAL]: 'Revealing',
  [Phase.RESOLVED]: 'Resolved',
};

export const AuctionCard: React.FC<Readonly<AuctionCardProps>> = ({ boardDeployment$ }) => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedBoardAPI, setDeployedBoardAPI] = useState<DeployedBBoardAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [auctionState, setAuctionState] = useState<BBoardDerivedState>();
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(!!boardDeployment$);

  const onCreateAuction = useCallback(() => boardApiProvider.resolve(), [boardApiProvider]);
  const onJoinAuction = useCallback(
    (contractAddress: ContractAddress) => boardApiProvider.resolve(contractAddress),
    [boardApiProvider],
  );

  const runAction = useCallback(async (action: () => Promise<void>) => {
    try {
      setIsWorking(true);
      await action();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, []);

  const onClaimAuctioneer = useCallback(() => {
    if (deployedBoardAPI) void runAction(() => deployedBoardAPI.claimAuctioneer());
  }, [deployedBoardAPI, runAction]);

  const onSubmitBid = useCallback(
    (amount: bigint, liquidity: bigint) => {
      setBidDialogOpen(false);
      if (deployedBoardAPI) void runAction(() => deployedBoardAPI.prepareAndCommitBid(amount, liquidity));
    },
    [deployedBoardAPI, runAction],
  );

  const onAdvanceToReveal = useCallback(() => {
    if (deployedBoardAPI) void runAction(() => deployedBoardAPI.advanceToReveal());
  }, [deployedBoardAPI, runAction]);

  const onRevealBid = useCallback(() => {
    if (deployedBoardAPI) void runAction(() => deployedBoardAPI.revealBid());
  }, [deployedBoardAPI, runAction]);

  const onResolveAuction = useCallback(() => {
    if (deployedBoardAPI) void runAction(() => deployedBoardAPI.resolveAuction());
  }, [deployedBoardAPI, runAction]);

  const onCopyContractAddress = useCallback(async () => {
    if (deployedBoardAPI) {
      await navigator.clipboard.writeText(deployedBoardAPI.deployedContractAddress);
    }
  }, [deployedBoardAPI]);

  useEffect(() => {
    if (!boardDeployment$) return;
    const subscription = boardDeployment$.subscribe(setBoardDeployment);
    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment) return;
    if (boardDeployment.status === 'in-progress') return;

    setIsWorking(false);

    if (boardDeployment.status === 'failed') {
      setErrorMessage(
        boardDeployment.error.message.length ? boardDeployment.error.message : 'Encountered an unexpected error.',
      );
      return;
    }

    setDeployedBoardAPI(boardDeployment.api);
    const subscription = boardDeployment.api.state$.subscribe(setAuctionState);
    return () => subscription.unsubscribe();
  }, [boardDeployment]);

  const phase = auctionState?.phase;
  const phaseLabel = phase !== undefined ? PHASE_LABEL[phase] : undefined;

  return (
    <Card sx={{ position: 'relative', width: 400, minHeight: 460 }}>
      {!boardDeployment$ && (
        <EmptyCardContent onCreateAuctionCallback={onCreateAuction} onJoinAuctionCallback={onJoinAuction} />
      )}

      {boardDeployment$ && (
        <React.Fragment>
          <Backdrop
            sx={{ position: 'absolute', color: '#FAFAFA', zIndex: (t) => t.zIndex.drawer + 1 }}
            open={isWorking}
          >
            <CircularProgress data-testid="auction-working-indicator" sx={{ color: '#E8332B' }} />
          </Backdrop>
          <Backdrop
            sx={{
              position: 'absolute',
              zIndex: (t) => t.zIndex.drawer + 1,
              flexDirection: 'column',
              gap: 1,
              px: 3,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            open={!!errorMessage}
            onClick={() => setErrorMessage(undefined)}
          >
            <StopIcon fontSize="large" sx={{ color: '#E8332B' }} />
            <Typography component="div" data-testid="auction-error-message" variant="body2">
              {errorMessage}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8A8A8A' }}>
              Tap to dismiss
            </Typography>
          </Backdrop>

          <CardHeader
            title={toShortFormatContractAddress(deployedBoardAPI?.deployedContractAddress) ?? 'Loading...'}
            slotProps={{
              title: { sx: { fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85rem' } },
            }}
            action={
              <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1, pt: 1 }}>
                {phaseLabel && (
                  <Chip
                    label={phaseLabel}
                    size="small"
                    data-testid="auction-phase-chip"
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      backgroundColor: phase === Phase.REVEAL ? 'rgba(232,51,43,0.16)' : '#1A1A1A',
                      color: phase === Phase.REVEAL ? '#E8332B' : '#FAFAFA',
                      border: '1px solid #3D3D3D',
                    }}
                  />
                )}
                {deployedBoardAPI?.deployedContractAddress ? (
                  <Tooltip title="Copy contract address">
                    <IconButton size="small" onClick={onCopyContractAddress} data-testid="auction-copy-address-btn">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Skeleton variant="circular" width={20} height={20} />
                )}
              </Stack>
            }
          />

          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {auctionState ? (
              <React.Fragment>
                <AuctionSeal state={auctionState} />
                <Divider sx={{ borderColor: '#3D3D3D' }} />
                <Stack spacing={0.75}>
                  <StatRow label="Round" value={auctionState.round.toString()} />
                  <StatRow label="You are auctioneer" value={auctionState.isAuctioneer ? 'Yes' : 'No'} />
                  <StatRow label="You hold the sealed bid" value={auctionState.isCommittedBidder ? 'Yes' : 'No'} />
                </Stack>
              </React.Fragment>
            ) : (
              <Skeleton variant="rectangular" width="100%" height={220} />
            )}
          </CardContent>

          <CardActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 3 }}>
            {auctionState ? (
              <React.Fragment>
                {auctionState.phase === Phase.COMMIT && (
                  <React.Fragment>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={auctionState.isAuctioneer}
                      onClick={onClaimAuctioneer}
                      data-testid="auction-claim-btn"
                    >
                      Claim auctioneer role
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={auctionState.hasActiveBid}
                      onClick={() => setBidDialogOpen(true)}
                      data-testid="auction-open-bid-dialog-btn"
                    >
                      Seal a bid
                    </Button>
                    {auctionState.isAuctioneer && (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!auctionState.hasActiveBid}
                        onClick={onAdvanceToReveal}
                        data-testid="auction-advance-btn"
                      >
                        Open reveal phase
                      </Button>
                    )}
                  </React.Fragment>
                )}

                {auctionState.phase === Phase.REVEAL && (
                  <React.Fragment>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!auctionState.isCommittedBidder}
                      onClick={onRevealBid}
                      data-testid="auction-reveal-btn"
                    >
                      Reveal your bid
                    </Button>
                    {auctionState.isAuctioneer && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={onResolveAuction}
                        data-testid="auction-resolve-btn"
                      >
                        Resolve auction
                      </Button>
                    )}
                  </React.Fragment>
                )}

                {auctionState.phase === Phase.RESOLVED && (
                  <Typography variant="body2" data-testid="auction-resolved-message">
                    This auction has closed.
                  </Typography>
                )}
              </React.Fragment>
            ) : (
              <Skeleton variant="rectangular" width={120} height={32} />
            )}
          </CardActions>

          <BidDialog isOpen={bidDialogOpen} onCancel={() => setBidDialogOpen(false)} onSubmit={onSubmitBid} />
        </React.Fragment>
      )}
    </Card>
  );
};

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontSize: '0.8rem', fontFamily: '"IBM Plex Mono", monospace', color: '#FAFAFA' }}
    >
      {value}
    </Typography>
  </Box>
);

const toShortFormatContractAddress = (
  contractAddress: ContractAddress | undefined,
): React.ReactElement | undefined =>
  contractAddress ? (
    <span data-testid="auction-address">
      0x{contractAddress?.replace(/^[A-Fa-f0-9]{6}([A-Fa-f0-9]{8}).*([A-Fa-f0-9]{8})$/g, '$1...$2')}
    </span>
  ) : undefined;
