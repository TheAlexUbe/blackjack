import { BettingAdvice, TableRules } from '../types/blackjack';

export function getRecommendedBet(trueCount: number, rules: TableRules, unitBet: number = 10): BettingAdvice {
  let recommendedUnits = 1;
  let reason = '';

  if (trueCount <= 1) {
    recommendedUnits = 1;
    reason = 'La casa mantiene ventaja matemática (True Count ≤ +1). Apuesta la unidad mínima de mesa.';
  } else if (trueCount === 2) {
    recommendedUnits = 2;
    reason = 'Ventaja del jugador estimada en ~0.5%. Sube a 2 unidades (Rampa de apuestas).';
  } else if (trueCount === 3) {
    recommendedUnits = 4;
    reason = 'Ventaja del jugador estimada en ~1.0%. Aumenta a 4 unidades para capitalizar la alta concentración de dieces y ases.';
  } else if (trueCount === 4) {
    recommendedUnits = 6;
    reason = 'Fuerte ventaja del jugador (~1.5%). Aumenta a 6 unidades.';
  } else {
    // True Count >= 5
    recommendedUnits = 8;
    reason = `¡Zapato muy caliente! TC de +${trueCount} con ventaja superior a +2.0%. Apuesta máxima de rampa (8 unidades).`;
  }

  const rawAmount = recommendedUnits * unitBet;
  const clampedAmount = Math.min(rules.maxBet, Math.max(rules.minBet, rawAmount));

  return {
    trueCount,
    recommendedUnits,
    recommendedAmount: clampedAmount,
    reason,
  };
}
