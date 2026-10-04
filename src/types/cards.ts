export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: CardRank;
  value: number; // Blackjack base value (10 for J/Q/K, 11 for A, 2-10 for others)
  isFaceUp: boolean;
}

export type CountingSystemName = 'hilo' | 'ko' | 'omega2' | 'red7';

export interface CountingSystemInfo {
  name: CountingSystemName;
  label: string;
  isBalanced: boolean;
  description: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  values: {
    [key in CardRank]?: number | ((card: Card) => number);
  };
}
