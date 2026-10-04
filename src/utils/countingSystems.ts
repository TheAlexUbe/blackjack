import { Card, CardRank, CountingSystemName, CountingSystemInfo } from '../types/cards';

export const COUNTING_SYSTEMS: Record<CountingSystemName, CountingSystemInfo> = {
  hilo: {
    name: 'hilo',
    label: 'Hi-Lo (Estándar)',
    isBalanced: true,
    difficulty: 'Principiante',
    description: 'El sistema más popular, equilibrado y comprobado. 2 a 6 suman +1, 7 a 9 valen 0, y 10 al As restan -1.',
    values: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
  },
  ko: {
    name: 'ko',
    label: 'K-O (Knock-Out)',
    isBalanced: false,
    difficulty: 'Principiante',
    description: 'Sistema desbalanceado que no requiere calcular el Conteo Real (True Count). El 7 cuenta como +1.',
    values: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1,
      '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
  },
  omega2: {
    name: 'omega2',
    label: 'Omega II (Multinivel)',
    isBalanced: true,
    difficulty: 'Avanzado',
    description: 'Sistema multinivel de alta precisión. Las cartas 4, 5 y 6 suman +2; las figuras restan -2.',
    values: {
      '2': 1, '3': 1, '7': 1,
      '4': 2, '5': 2, '6': 2,
      '8': 0, 'A': 0,
      '9': -1,
      '10': -2, 'J': -2, 'Q': -2, 'K': -2,
    },
  },
  red7: {
    name: 'red7',
    label: 'Red 7',
    isBalanced: false,
    difficulty: 'Intermedio',
    description: 'Variante sencilla donde los 7 rojos (Corazones y Diamantes) valen +1 y los 7 negros valen 0.',
    values: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
  },
};

export function getCardCountValue(card: Card, systemName: CountingSystemName = 'hilo'): number {
  if (systemName === 'red7') {
    if (card.rank === '7') {
      return (card.suit === 'hearts' || card.suit === 'diamonds') ? 1 : 0;
    }
  }
  const system = COUNTING_SYSTEMS[systemName] || COUNTING_SYSTEMS.hilo;
  const val = system.values[card.rank as CardRank];
  if (typeof val === 'number') return val;
  return 0;
}

export function calculateRunningCount(cards: Card[], systemName: CountingSystemName = 'hilo'): number {
  return cards.reduce((sum, card) => sum + getCardCountValue(card, systemName), 0);
}

export function calculateTrueCount(
  runningCount: number,
  remainingCards: number,
  systemName: CountingSystemName = 'hilo'
): number {
  // If system is unbalanced (like KO), true count division is not used, running count is key
  if (!COUNTING_SYSTEMS[systemName].isBalanced) {
    return runningCount;
  }

  const remainingDecks = Math.max(0.25, remainingCards / 52);
  const tc = runningCount / remainingDecks;
  // Return rounded to 1 decimal place
  return Math.round(tc * 10) / 10;
}

export function getInitialRunningCount(systemName: CountingSystemName, deckCount: number): number {
  if (systemName === 'ko') {
    // KO initial running count formula: 4 - (4 * decks)
    return 4 - (4 * deckCount);
  }
  return 0;
}
