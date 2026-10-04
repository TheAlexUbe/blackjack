import { Card } from '../types/cards';
import { StrategyAdvice, TableRules } from '../types/blackjack';
import { getBasicStrategyAction, getDealerUpcardValue } from './basicStrategy';
import { calculateHandScore, canSplitHand } from './cardDeck';

export interface DeviationRule {
  id: string;
  name: string;
  playerHandDesc: string;
  dealerCardDesc: string;
  index: number;
  direction: '>=' | '<=';
  normalAction: string;
  deviationAction: string;
  priority: number;
  importance: 'Crítica' | 'Alta' | 'Media' | 'Baja';
}

export const ILLUSTRIOUS_18: DeviationRule[] = [
  {
    id: 'insurance',
    name: 'Seguro (Insurance)',
    playerHandDesc: 'Cualquier mano',
    dealerCardDesc: 'As',
    index: 3,
    direction: '>=',
    normalAction: 'Rechazar seguro',
    deviationAction: 'Tomar Seguro (Apostar seguro)',
    priority: 1,
    importance: 'Crítica',
  },
  {
    id: '16_vs_10',
    name: '16 contra 10',
    playerHandDesc: '16 duro',
    dealerCardDesc: '10 / Figura',
    index: 0,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Plantarse (Stand)',
    priority: 2,
    importance: 'Crítica',
  },
  {
    id: '15_vs_10',
    name: '15 contra 10',
    playerHandDesc: '15 duro',
    dealerCardDesc: '10 / Figura',
    index: 4,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Plantarse (Stand)',
    priority: 3,
    importance: 'Crítica',
  },
  {
    id: '10_10_vs_5',
    name: 'Par 10-10 contra 5',
    playerHandDesc: '10-10 / Figuras',
    dealerCardDesc: '5',
    index: 5,
    direction: '>=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Dividir (Split)',
    priority: 4,
    importance: 'Media',
  },
  {
    id: '10_10_vs_6',
    name: 'Par 10-10 contra 6',
    playerHandDesc: '10-10 / Figuras',
    dealerCardDesc: '6',
    index: 4,
    direction: '>=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Dividir (Split)',
    priority: 5,
    importance: 'Media',
  },
  {
    id: '10_vs_10',
    name: '10 contra 10',
    playerHandDesc: '10 duro',
    dealerCardDesc: '10 / Figura',
    index: 4,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Doblar (Double)',
    priority: 6,
    importance: 'Alta',
  },
  {
    id: '12_vs_3',
    name: '12 contra 3',
    playerHandDesc: '12 duro',
    dealerCardDesc: '3',
    index: 2,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Plantarse (Stand)',
    priority: 7,
    importance: 'Alta',
  },
  {
    id: '12_vs_2',
    name: '12 contra 2',
    playerHandDesc: '12 duro',
    dealerCardDesc: '2',
    index: 3,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Plantarse (Stand)',
    priority: 8,
    importance: 'Alta',
  },
  {
    id: '11_vs_A',
    name: '11 contra As',
    playerHandDesc: '11 duro',
    dealerCardDesc: 'As',
    index: 1,
    direction: '>=',
    normalAction: 'Pedir en S17',
    deviationAction: 'Doblar (Double)',
    priority: 9,
    importance: 'Alta',
  },
  {
    id: '9_vs_2',
    name: '9 contra 2',
    playerHandDesc: '9 duro',
    dealerCardDesc: '2',
    index: 1,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Doblar (Double)',
    priority: 10,
    importance: 'Media',
  },
  {
    id: '10_vs_A',
    name: '10 contra As',
    playerHandDesc: '10 duro',
    dealerCardDesc: 'As',
    index: 4,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Doblar (Double)',
    priority: 11,
    importance: 'Media',
  },
  {
    id: '9_vs_7',
    name: '9 contra 7',
    playerHandDesc: '9 duro',
    dealerCardDesc: '7',
    index: 3,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Doblar (Double)',
    priority: 12,
    importance: 'Media',
  },
  {
    id: '16_vs_9',
    name: '16 contra 9',
    playerHandDesc: '16 duro',
    dealerCardDesc: '9',
    index: 5,
    direction: '>=',
    normalAction: 'Pedir (Hit)',
    deviationAction: 'Plantarse (Stand)',
    priority: 13,
    importance: 'Media',
  },
  {
    id: '13_vs_2',
    name: '13 contra 2',
    playerHandDesc: '13 duro',
    dealerCardDesc: '2',
    index: -1,
    direction: '<=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Pedir (Hit)',
    priority: 14,
    importance: 'Media',
  },
  {
    id: '12_vs_4',
    name: '12 contra 4',
    playerHandDesc: '12 duro',
    dealerCardDesc: '4',
    index: 0,
    direction: '<=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Pedir (Hit)',
    priority: 15,
    importance: 'Media',
  },
  {
    id: '12_vs_5',
    name: '12 contra 5',
    playerHandDesc: '12 duro',
    dealerCardDesc: '5',
    index: -2,
    direction: '<=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Pedir (Hit)',
    priority: 16,
    importance: 'Baja',
  },
  {
    id: '12_vs_6',
    name: '12 contra 6',
    playerHandDesc: '12 duro',
    dealerCardDesc: '6',
    index: -1,
    direction: '<=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Pedir (Hit)',
    priority: 17,
    importance: 'Baja',
  },
  {
    id: '13_vs_3',
    name: '13 contra 3',
    playerHandDesc: '13 duro',
    dealerCardDesc: '3',
    index: -2,
    direction: '<=',
    normalAction: 'Plantarse (Stand)',
    deviationAction: 'Pedir (Hit)',
    priority: 18,
    importance: 'Baja',
  },
];

export function getCountingDeviatedStrategy(
  playerCards: Card[],
  dealerUpcard: Card,
  trueCount: number,
  rules: TableRules,
  canDouble: boolean = true,
  canSplit: boolean = true
): StrategyAdvice {
  const base = getBasicStrategyAction(playerCards, dealerUpcard, rules, canDouble, canSplit);
  const score = calculateHandScore(playerCards);
  const upcardVal = getDealerUpcardValue(dealerUpcard);
  const isHard = !score.isSoft;

  // 16 vs 10: Stand at TC >= 0
  if (isHard && score.total === 16 && upcardVal === 10 && playerCards.length === 2) {
    if (trueCount >= 0) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 16 vs 10 en TC ≥ 0',
        explanation: `Con True Count ${trueCount >= 0 ? `+${trueCount}` : trueCount} (≥ 0), la baraja tiene suficientes cartas altas como para que pedir aumente drásticamente el riesgo de pasarte. Desvíate y plántate.`,
      };
    }
  }

  // 15 vs 10: Stand at TC >= 4
  if (isHard && score.total === 15 && upcardVal === 10) {
    if (trueCount >= 4) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 15 vs 10 en TC ≥ +4',
        explanation: `Con True Count de +${trueCount} (≥ +4), la densidad de cartas altas hace que pedir sea matemáticamente inferior a plantarse y esperar el bust del crupier.`,
      };
    }
  }

  // 10,10 vs 5: Split at TC >= 5
  if (canSplit && canSplitHand(playerCards) && playerCards[0].value === 10 && upcardVal === 5) {
    if (trueCount >= 5) {
      return {
        recommendedAction: 'split',
        actionLabel: 'Dividir Decenas (Split) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 10-10 vs 5 en TC ≥ +5',
        explanation: `Con True Count masivo de +${trueCount} (≥ +5), dividir 20 contra un 5 maximiza el valor esperado, pues obtendrás múltiples manos fuertes y el crupier bustea mucho.`,
      };
    }
  }

  // 10,10 vs 6: Split at TC >= 4
  if (canSplit && canSplitHand(playerCards) && playerCards[0].value === 10 && upcardVal === 6) {
    if (trueCount >= 4) {
      return {
        recommendedAction: 'split',
        actionLabel: 'Dividir Decenas (Split) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 10-10 vs 6 en TC ≥ +4',
        explanation: `Con True Count de +${trueCount} (≥ +4), dividir el par de 10s contra 6 ofrece enorme ventaja sobre el crupier.`,
      };
    }
  }

  // 10 vs 10: Double at TC >= 4
  if (isHard && score.total === 10 && upcardVal === 10 && canDouble) {
    if (trueCount >= 4) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 10 vs 10 en TC ≥ +4',
        explanation: `Con True Count de +${trueCount} (≥ +4), hay tanta abundancia de cartas de valor 10 que doblar tu 10 es altamente rentable.`,
      };
    }
  }

  // 12 vs 3: Stand at TC >= 2
  if (isHard && score.total === 12 && upcardVal === 3) {
    if (trueCount >= 2) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 12 vs 3 en TC ≥ +2',
        explanation: `En estrategia básica pides, pero con True Count +${trueCount} (≥ +2) el riesgo de pasarte supera la recompensa; plántate.`,
      };
    }
  }

  // 12 vs 2: Stand at TC >= 3
  if (isHard && score.total === 12 && upcardVal === 2) {
    if (trueCount >= 3) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 12 vs 2 en TC ≥ +3',
        explanation: `En TC +${trueCount} (≥ +3), el crupier busteará con más frecuencia desde su 2 inicial. Plántate.`,
      };
    }
  }

  // 11 vs A: Double at TC >= 1
  if (isHard && score.total === 11 && upcardVal === 11 && canDouble) {
    if (trueCount >= 1) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 11 vs As en TC ≥ +1',
        explanation: `Con True Count +${trueCount} (≥ +1), la ventaja se inclina hacia doblar 11 contra el As.`,
      };
    }
  }

  // 9 vs 2: Double at TC >= 1
  if (isHard && score.total === 9 && upcardVal === 2 && canDouble) {
    if (trueCount >= 1) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 9 vs 2 en TC ≥ +1',
        explanation: `Con True Count +${trueCount} (≥ +1), dobla tu 9 contra el 2 del crupier.`,
      };
    }
  }

  // 10 vs A: Double at TC >= 4
  if (isHard && score.total === 10 && upcardVal === 11 && canDouble) {
    if (trueCount >= 4) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 10 vs As en TC ≥ +4',
        explanation: `Con True Count de +${trueCount} (≥ +4), el doblaje agresivo de 10 contra As se vuelve rentable.`,
      };
    }
  }

  // 9 vs 7: Double at TC >= 3
  if (isHard && score.total === 9 && upcardVal === 7 && canDouble) {
    if (trueCount >= 3) {
      return {
        recommendedAction: 'double',
        actionLabel: 'Doblar (Double) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 9 vs 7 en TC ≥ +3',
        explanation: `Con True Count de +${trueCount} (≥ +3), doblar 9 contra 7 supera a pedir carta.`,
      };
    }
  }

  // 16 vs 9: Stand at TC >= 5
  if (isHard && score.total === 16 && upcardVal === 9) {
    if (trueCount >= 5) {
      return {
        recommendedAction: 'stand',
        actionLabel: 'Plantarse (Stand) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 16 vs 9 en TC ≥ +5',
        explanation: `Con True Count extremo de +${trueCount} (≥ +5), plántate con 16 frente al 9 del crupier.`,
      };
    }
  }

  // 13 vs 2: Hit at TC <= -1
  if (isHard && score.total === 13 && upcardVal === 2) {
    if (trueCount <= -1) {
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 13 vs 2 en TC ≤ -1',
        explanation: `Normalmente te plantas, pero con TC de ${trueCount} (≤ -1) la baraja está repleta de cartas bajas, así que pedir es seguro y ventajoso.`,
      };
    }
  }

  // 12 vs 4: Hit at TC <= 0
  if (isHard && score.total === 12 && upcardVal === 4) {
    if (trueCount < 0) {
      return {
        recommendedAction: 'hit',
        actionLabel: 'Pedir (Hit) [Desviación]',
        isDeviation: true,
        deviationDescription: 'Illustrious 18: 12 vs 4 en TC < 0',
        explanation: `En baraja negativa (TC ${trueCount} < 0), el crupier no busteará tanto y tú difícilmente te pasarás con cartas bajas. Pide carta.`,
      };
    }
  }

  return base;
}

export function shouldTakeInsurance(trueCount: number): { take: boolean; reason: string } {
  if (trueCount >= 3) {
    return {
      take: true,
      reason: `⚡ Desviación #1 de Illustrious 18: Con True Count de +${trueCount} (≥ +3), la proporción de cartas de 10 en la baraja supera 1 de cada 3 (33.3%). El seguro paga 2 a 1, por lo que tiene Valor Esperado (EV) positivo!`,
    };
  }
  return {
    take: false,
    reason: `Rechaza el seguro. Con True Count de ${trueCount < 0 ? trueCount : `+${trueCount}`} (< +3), el seguro es una apuesta con ventaja para la casa (-5.9% a -7.7% EV).`,
  };
}
