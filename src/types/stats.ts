export interface PlayerStats {
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  blackjacks: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  maxBankroll: number;
  // Conteo Quizzes
  quizzesTaken: number;
  quizzesCorrect: number;
  // Strategy accuracy
  strategyDecisionsTaken: number;
  strategyCorrect: number;
}

export interface DrillStats {
  cardsCountedTotal: number;
  speedDrillRounds: number;
  speedDrillCorrect: number;
  averageResponseTimeMs: number;
}
