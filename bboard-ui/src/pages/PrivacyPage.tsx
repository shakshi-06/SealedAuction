import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { colors } from '../config/theme';

const panelSx = {
  border: `1px solid ${colors.line}`,
  backgroundColor: 'rgba(255,255,255,0.025)',
  boxShadow: 'none',
};
const monoSx = { fontFamily: '"DM Mono", monospace' };

const DetailCard: React.FC<{ number: string; eyebrow: string; title: string; children: React.ReactNode }> = ({ number, eyebrow, title, children }) => (
  <Paper sx={{ ...panelSx, p: { xs: 3, md: 4 }, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4 }}>
      <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em' }}>{eyebrow}</Typography>
      <Typography sx={{ ...monoSx, color: colors.red, fontSize: 13 }}>{number}</Typography>
    </Box>
    <Typography variant="h4" sx={{ color: colors.paper, mb: 2 }}>{title}</Typography>
    <Box sx={{ color: colors.muted, lineHeight: 1.75, fontSize: 15 }}>{children}</Box>
  </Paper>
);

export const PrivacyPage: React.FC = () => (
  <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 } }}>
    <Box sx={{ maxWidth: 900, mb: { xs: 6, md: 9 } }}>
      <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 11, letterSpacing: '0.14em', mb: 2 }}>PRIVACY MODEL / AUCTION.COMPACT</Typography>
      <Typography variant="h1" sx={{ color: colors.paper, fontSize: { xs: 44, md: 72 }, lineHeight: 0.98, mb: 3 }}>
        A sealed bid, with a precise reveal.
      </Typography>
      <Typography sx={{ color: colors.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.65, maxWidth: 760 }}>
        This auction hides a bid during commit, then discloses the bid amount when its owner reveals it. The contract keeps the rules public while the proof connects a reveal to its earlier commitment.
      </Typography>
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
      <DetailCard number="01" eyebrow="COMMIT PHASE" title="Only the commitment is recorded">
        <Typography component="p" sx={{ m: 0 }}>
          A bidder supplies a commitment derived from the bid amount and a 32-byte nonce. The <Box component="code" sx={{ ...monoSx, color: colors.paper, fontSize: 12 }}>commitBid</Box> circuit stores that 32-byte commitment and a bidder nullifier in the public ledger. The amount and nonce are witnesses, not ledger fields.
        </Typography>
      </DetailCard>

      <DetailCard number="02" eyebrow="REVEAL PHASE" title="The amount is disclosed at reveal">
        <Typography component="p" sx={{ m: 0 }}>
          During <Box component="code" sx={{ ...monoSx, color: colors.paper, fontSize: 12 }}>revealBid</Box>, the bidder supplies the amount and nonce again. The circuit checks that their commitment exists, then calls <Box component="code" sx={{ ...monoSx, color: colors.paper, fontSize: 12 }}>disclose(amount)</Box>. This means a successfully revealed bid amount is public from reveal onward, and the public <Box component="code" sx={{ ...monoSx, color: colors.paper, fontSize: 12 }}>highest_bid</Box> can be updated.
        </Typography>
      </DetailCard>

      <DetailCard number="03" eyebrow="PROVING PATH" title="Proofs use the configured provider">
        <Typography component="p" sx={{ m: 0 }}>
          The browser builds transactions with the Compact contract and fetches proving configuration from the app assets. In <Box component="code" sx={{ ...monoSx, color: colors.paper, fontSize: 12 }}>midnight.ts</Box>, the connected wallet API supplies the configured proving provider used to prove each transaction. Private state is held by the browser provider, but this page does not claim that every proving operation runs locally.
        </Typography>
      </DetailCard>
    </Box>

    <Paper sx={{ ...panelSx, mt: 3, p: { xs: 3, md: 4 } }}>
      <Typography sx={{ ...monoSx, color: colors.redSoft, fontSize: 10, letterSpacing: '0.13em', mb: 2 }}>WHAT THE LEDGER SHOWS</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
        {[
          ['Before reveal', 'Commitment hashes, phase, round, and public set membership.'],
          ['After reveal', 'The revealed amount, its commitment, and the updated highest bid.'],
          ['At resolution', 'The resolved phase and the final highest revealed bid.'],
        ].map(([label, description]) => (
          <Box key={label}>
            <Typography sx={{ color: colors.paper, fontWeight: 600, mb: 0.75 }}>{label}</Typography>
            <Typography sx={{ color: colors.muted, lineHeight: 1.6, fontSize: 14 }}>{description}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  </Container>
);
