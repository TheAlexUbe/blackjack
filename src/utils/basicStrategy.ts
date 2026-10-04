import { Card } from '../types/cards';
import { StrategyAdvice, TableRules } from '../types/blackjack';
import { calculateHandScore, canSplitHand } from './cardDeck';

export function getDealerUpcardValue(dealerCard: Card): number {
  if (dealerCard.rank === 'A') return 11;
  return dealerCard.value;
}

export function getBasicStrategyAction(
  playerCards: Card[],
  dealerUpcard: Card,
  rules: TableRules,
  canDouble: boolean = true,
  canSplit: boolean = true
): StrategyAdvice {
  const score = calculateHandScore(playerCards);
  const upcardVal = getDealerUpcardValue(dealerUpcard);
  const upcardLabel = dealerUpcard.rank === 'A' ? 'un As' : `${dealerUpcard.value}`;

  // 1. PAIRS (Splitting)
  if (canSplit && canSplitHand(playerCards) && playerCards.length === 2) {
    const pairRank = playerCards[0].rank;

    // A,A and 8,8 always split
    if (pairRank === 'A') {
      return {
        recommendedAction: 'split',
        actionLabel: 'Dividir Ases (Split)',
        isDeviation: false,
        explanation: 'Siempre divide un par de Ases para tener dos oportunidades de 21.',
      };
    }
    if (pairRank === '8') {
      if (rules.allowSurrender && upcardVal === 11 && rules.dealerHitsSoft17) {
        return {
          recommendedAction: 'surrender',
          actionLabel: 'Rendirse (Surrender)',
          isDeviation: false,
          explanation: '8-8 contra As del crupier en mesa H17 se rinde si está permitido.',
        };
      }
      return {
        recommendedAction: 'split',
        actionLabel: 'Dividir Ochos (Split)',
        isDeviation: false,
        explanation: 'Siempre divide 8-8: un 16 duro es la peor mano, dividirlos mejora tus probabilidades.',
      };
    }
    // 10,10, J,J, Q,Q, K,K: Never split
    if (['10', 'J', 'Q', 'K'].includes(pairRank)) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand)',
        isDeviation: false,
        explanation: 'Un 20 es una mano ganadora formidable. Nunca la dividas con estrategia básica.',
      };
    }
    // 9,9: Split vs 2-6, 8,9. Stand vs 7, 10, A
    if (pairRank === '9') {
      if ([7, 10, 11].includes(upcardVal)) {
        return {
          recommendedAction: 'stand',
          actionLabel: 'Plantarse (Stand)',
          isDeviation: false,
          explanation: `Con 9-9 (18) contra ${upcardLabel}, plantarse es la mejor jugada.`,
        };
      }
      return {
        recommendedAction: 'split',
        actionLabel: 'Dividir Nueves (Split)',
        isDeviation: false,
        explanation: `Divide 9-9 contra ${upcardLabel} para capitalizar la debilidad del crupier.`,
      };
    }
    // 7,7: Split vs 2-7
    if (pairRank === '7') {
      if (upcardVal >= 2 && upcardVal <= 7) {
        return {
          recommendedAction: 'split',
          actionLabel: 'Dividir Sietes (Split)',
          isDeviation: false,
          explanation: `Divide 7-7 contra carta débil (${upcardLabel}).`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Con 7-7 (14) contra carta fuerte (${upcardLabel}), pide carta.`,
      };
    }
    // 6,6: Split vs 2-6 (if DAS) or 3-6
    if (pairRank === '6') {
      if (upcardVal >= 2 && upcardVal <= 6) {
        return {
          recommendedAction: 'split',
          actionLabel: 'Dividir Seises (Split)',
          isDeviation: false,
          explanation: `Divide 6-6 contra carta débil (${upcardLabel}).`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Con 6-6 contra ${upcardLabel}, pide carta.`,
      };
    }
    // 5,5: Treat as hard 10: Double vs 2-9, else Hit (NEVER SPLIT 5s)
    if (pairRank === '5') {
      if (canDouble && upcardVal >= 2 && upcardVal <= 9) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: 'Nunca dividas cincos (10). Dobla contra 2 al 9.',
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: 'Pide carta con 5-5 (10) contra 10 o As.',
      };
    }
    // 4,4: Split vs 5-6 (if DAS), else Hit
    if (pairRank === '4') {
      if (rules.allowDoubleAfterSplit && (upcardVal === 5 || upcardVal === 6)) {
        return {
          recommendedAction: 'split',
          actionLabel: 'Dividir Cuatros (Split)',
          isDeviation: false,
          explanation: 'Divide 4-4 únicamente contra 5 o 6 con doblaje tras división.',
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: 'Con 4-4 (8), pide carta.',
      };
    }
    // 2,2 and 3,3: Split vs 2-7
    if (pairRank === '2' || pairRank === '3') {
      if (upcardVal >= 2 && upcardVal <= 7) {
        return {
          recommendedAction: 'split',
          actionLabel: `Dividir ${pairRank}-${pairRank} (Split)`,
          isDeviation: false,
          explanation: `Divide ${pairRank}-${pairRank} contra carta baja del crupier (${upcardLabel}).`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Pide carta con ${pairRank}-${pairRank} contra ${upcardLabel}.`,
      };
    }
  }

  // 2. SOFT TOTALS (Hands with an Ace counting as 11)
  if (score.isSoft && playerCards.length >= 2) {
    const total = score.total;
    // Soft 20 (A,9) or Soft 21 (A,10): Always Stand
    if (total >= 20) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand)',
        isDeviation: false,
        explanation: `Un suave ${total} es una mano excelente. Siempre plántate.`,
      };
    }
    // Soft 19 (A,8): Double vs 6 (if H17: vs 6), else Stand
    if (total === 19) {
      if (canDouble && upcardVal === 6 && rules.dealerHitsSoft17) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: 'Con A,8 (suave 19) contra 6 en mesa H17, doblar ofrece el mayor EV.',
        };
      }
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand)',
        isDeviation: false,
        explanation: `Con A,8 (suave 19) contra ${upcardLabel}, plántate.`,
      };
    }
    // Soft 18 (A,7): Double vs 2-6 (or 3-6 in S17), Stand vs 7-8, Hit vs 9, 10, A
    if (total === 18) {
      if (canDouble && upcardVal >= 2 && upcardVal <= 6) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: `Dobla suave 18 contra el crupier débil (${upcardLabel}).`,
        };
      }
      if (upcardVal === 7 || upcardVal === 8) {
        return {
          recommendedAction: 'stand',
          actionLabel: 'Plantarse (Stand)',
          isDeviation: false,
          explanation: `Plántate en suave 18 contra ${upcardLabel}.`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Pide carta en suave 18 contra carta fuerte (${upcardLabel}) para intentar mejorar.`,
      };
    }
    // Soft 17 (A,6): Double vs 3-6, else Hit
    if (total === 17) {
      if (canDouble && upcardVal >= 3 && upcardVal <= 6) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: `Dobla suave 17 contra carta débil (${upcardLabel}).`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Pide carta con suave 17 contra ${upcardLabel}.`,
      };
    }
    // Soft 15 or 16 (A,4 / A,5): Double vs 4-6, else Hit
    if (total === 15 || total === 16) {
      if (canDouble && upcardVal >= 4 && upcardVal <= 6) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: `Dobla suave ${total} contra la mayor probabilidad de bust del crupier (${upcardLabel}).`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Pide carta con suave ${total} contra ${upcardLabel}.`,
      };
    }
    // Soft 13 or 14 (A,2 / A,3): Double vs 5-6, else Hit
    if (total === 13 || total === 14) {
      if (canDouble && (upcardVal === 5 || upcardVal === 6)) {
        return {
          recommendedAction: 'double',
          actionLabel: 'Doblar (Double)',
          isDeviation: false,
          explanation: `Dobla suave ${total} contra 5 o 6.`,
        };
      }
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit)',
        isDeviation: false,
        explanation: `Pide con suave ${total} contra ${upcardLabel}.`,
      };
    }
  }

  // 3. HARD TOTALS
  const hardTotal = score.total;

  // Surrender rules (if allowed and 2 cards)
  if (rules.allowSurrender && playerCards.length === 2) {
    if (hardTotal === 16 && [9, 10, 11].includes(upcardVal)) {
      return {
        recommendedAction: 'surrender',
        actionLabel: 'Rendirse (Surrender)',
        isDeviation: false,
        explanation: `16 duro contra ${upcardLabel} pierde más del 50% de las veces; rendirse ahorra la mitad de la apuesta.`,
      };
    }
    if (hardTotal === 15 && upcardVal === 10) {
      return {
        recommendedAction: 'surrender',
        actionLabel: 'Rendirse (Surrender)',
        isDeviation: false,
        explanation: '15 duro contra 10 se rinde para preservar bankroll.',
      };
    }
  }

  // 17 and above: Always Stand
  if (hardTotal >= 17) {
    return {
      recommendedAction: 'stand',
      actionLabel: 'Plantarse (Stand)',
      isDeviation: false,
      explanation: `Con ${hardTotal} duro el riesgo de pasarse es demasiado alto. Siempre plántate.`,
    };
  }

  // 13 - 16: Stand vs 2-6 (Bust cards), Hit vs 7-A
  if (hardTotal >= 13 && hardTotal <= 16) {
    if (upcardVal >= 2 && upcardVal <= 6) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand)',
        isDeviation: false,
        explanation: `El crupier tiene carta débil (${upcardLabel}) y probable bust. No arriesgues pasarte con ${hardTotal}.`,
      };
    }
    return {
      recommendedAction: 'hit',
      actionLabel: 'Pedir (Hit)',
      isDeviation: false,
      explanation: `El crupier muestra ${upcardLabel} (mano potencialmente fuerte). Debes pedir con ${hardTotal}.`,
    };
  }

  // 12: Stand vs 4-6, Hit vs 2, 3, and 7-A
  if (hardTotal === 12) {
    if (upcardVal >= 4 && upcardVal <= 6) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand)',
        isDeviation: false,
        explanation: `Con 12 plántate ante 4, 5 o 6 porque el crupier se pasará frecuentemente.`,
      };
    }
    return {
      recommendedAction: 'hit',
      actionLabel: 'Pedir (Hit)',
      isDeviation: false,
      explanation: `Con 12 contra ${upcardLabel}, la matemática indica pedir carta.`,
    };
  }

  // 11: Always Double (against everything including Ace if H17, or Hit vs Ace in S17)
  if (hardTotal === 11) {
    if (canDouble) {
      if (upcardVal === 11 && !rules.dealerHitsSoft17) {
        return {
          recommendedAction: 'hit',
          actionLabel: 'Pedir (Hit)',
          isDeviation: false,
          explanation: '11 contra As en mesa S17: pedir carta es ligeramente más seguro que doblar.',
        };
      }
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double)',
        isDeviation: false,
        explanation: `11 es la mejor mano para doblar contra ${upcardLabel}.`,
      };
    }
    return {
      recommendedAction: 'hit',
      actionLabel: 'Pedir (Hit)',
      isDeviation: false,
      explanation: 'Pide carta con 11.',
    };
  }

  // 10: Double vs 2-9, Hit vs 10, A
  if (hardTotal === 10) {
    if (canDouble && upcardVal >= 2 && upcardVal <= 9) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double)',
        isDeviation: false,
        explanation: `Dobla 10 contra carta débil o media (${upcardLabel}).`,
      };
    }
    return {
      recommendedAction: 'hit',
      actionLabel: 'Pedir (Hit)',
      isDeviation: false,
      explanation: `Con 10 contra carta fuerte (${upcardLabel}), solo pide carta.`,
    };
  }

  // 9: Double vs 3-6, Hit otherwise
  if (hardTotal === 9) {
    if (canDouble && upcardVal >= 3 && upcardVal <= 6) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double)',
        isDeviation: false,
        explanation: `Dobla 9 contra el rango de bust del crupier (3 a 6).`,
      };
    }
    return {
      recommendedAction: 'hit',
      actionLabel: 'Pedir (Hit)',
      isDeviation: false,
      explanation: `Pide carta con 9 contra ${upcardLabel}.`,
    };
  }

  // 8 or less: Always Hit
  return {
    recommendedAction: 'hit',
    actionLabel: 'Pedir (Hit)',
    isDeviation: false,
    explanation: `Con ${hardTotal} es imposible pasarse. Siempre pide carta.`,
  };
}
