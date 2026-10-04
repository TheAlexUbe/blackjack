import { Card, CardRank, Suit } from '../types/cards';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function getRankValue(rank: CardRank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank, 10);
}

export function createShoe(deckCount: number = 6): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({
          id: `${d}-${suit}-${rank}-${Math.random().toString(36).substring(2, 7)}`,
          suit,
          rank,
          value: getRankValue(rank),
          isFaceUp: true,
        });
      }
    }
  }
  return shuffleDeck(cards);
}

export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface HandScore {
  total: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
}

export function calculateHandScore(cards: Card[]): HandScore {
  const faceUpCards = cards.filter((c) => c.isFaceUp);
  let total = 0;
  let aces = 0;

  for (const card of faceUpCards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else {
      total += card.value;
    }
  }

  let isSoft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  if (aces > 0 && total <= 21) {
    isSoft = true;
  }

  const isBust = total > 21;
  const isBlackjack = cards.length === 2 && total === 21 && faceUpCards.length === 2;

  return {
    total,
    isSoft,
    isBust,
    isBlackjack,
  };
}

export function canSplitHand(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  // Match either rank or blackjack value (e.g. 10 and J or K and K)
  return cards[0].value === cards[1].value;
}
