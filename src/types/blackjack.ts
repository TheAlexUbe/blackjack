import { Card, CountingSystemName } from './cards';

export type GamePhase =
  | 'betting'
  | 'dealing'
  | 'insurance'
  | 'player_turn'
  | 'dealer_turn'
  | 'round_over';

export type HandOutcome = 'win' | 'lose' | 'push' | 'blackjack' | 'surrendered';

export interface Hand {
  id: string;
  cards: Card[];
  bet: number;
  isCompleted: boolean;
  isDoubled: boolean;
  isSplit: boolean;
  outcome: HandOutcome | null;
  payout: number;
}

export interface TableRules {
  decksCount: number; // 1, 2, 4, 6, 8
  dealerHitsSoft17: boolean; // true = H17, false = S17
  blackjackPayoutRatio: number; // 1.5 (3:2) or 1.2 (6:5)
  allowSurrender: boolean;
  allowDoubleAfterSplit: boolean;
  penetration: number; // e.g. 0.75 (75% dealt before reshuffle)
  minBet: number;
  maxBet: number;
  countingSystem: CountingSystemName;
  quizFrequency: 'off' | 'every_round' | 'every_3_rounds' | 'random';
}

export type StrategyAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

export interface StrategyAdvice {
  recommendedAction: StrategyAction;
  actionLabel: string;
  isDeviation: boolean;
  deviationDescription?: string;
  explanation: string;
}

export interface BettingAdvice {
  trueCount: number;
  recommendedUnits: number;
  recommendedAmount: number;
  reason: string;
}
