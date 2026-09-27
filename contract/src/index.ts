// Re-export generated contract types
// These will be available after running: yarn compile
export type {
  Ledger,
  ImpureCircuits,
  PureCircuits,
  Contract,
} from '../../contracts/managed/auction/contract/index.js';
export {
  Contract,
  ledger,
  pureCircuits,
} from '../../contracts/managed/auction/contract/index.js';

// Phase enum — must match the values used in auction.compact
// phase: 0 = COMMIT, 1 = REVEAL, 2 = RESOLVED
export enum Phase {
  COMMIT = 0,
  REVEAL = 1,
  RESOLVED = 2,
}
