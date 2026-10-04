import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Shield } from 'lucide-react';
import { Card } from '../types/cards';
import { Hand, HandOutcome, TableRules, GamePhase } from '../types/blackjack';
import { createShoe, calculateHandScore, canSplitHand } from '../utils/cardDeck';
import {
  calculateTrueCount,
  getCardCountValue,
  getInitialRunningCount,
} from '../utils/countingSystems';
import { getCountingDeviatedStrategy, shouldTakeInsurance } from '../utils/illustrious18';
import { getRecommendedBet } from '../utils/bettingAdvisor';
import { soundManager } from '../utils/sound';
import { CardView } from './CardView';
import { Chip } from './Chip';
import { ShoeVisualizer } from './ShoeVisualizer';
import { CountingHUD } from './CountingHUD';
import { CountingQuizModal } from './CountingQuizModal';

interface BlackjackTableProps {
  rules: TableRules;
  bankroll: number;
  onUpdateBankroll: (delta: number) => void;
  onRecordHandResult: (outcome: HandOutcome, netWin: number) => void;
  onRecordQuiz: (isCorrect: boolean) => void;
}

export const BlackjackTable: React.FC<BlackjackTableProps> = ({
  rules,
  bankroll,
  onUpdateBankroll,
  onRecordHandResult,
  onRecordQuiz,
}) => {
  // Shoe & Cards
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(rules.decksCount));
  const [runningCount, setRunningCount] = useState<number>(() =>
    getInitialRunningCount(rules.countingSystem, rules.decksCount)
  );

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting');
  const [currentBet, setCurrentBet] = useState<number>(25);
  const [lastBet, setLastBet] = useState<number>(25);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Hand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);

  // Insurance
  const [showInsuranceModal, setShowInsuranceModal] = useState<boolean>(false);
  const [insuranceBet, setInsuranceBet] = useState<number>(0);

  // Card Badges toggle
  const [showCardCountBadges, setShowCardCountBadges] = useState<boolean>(false);

  // Quiz Modal
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const roundsCountRef = useRef<number>(0);

  const dealerTurnTimeoutRef = useRef<number | null>(null);

  // Calculate True Count
  const totalCardsInShoe = rules.decksCount * 52;
  const trueCount = calculateTrueCount(runningCount, shoe.length, rules.countingSystem);

  // Recommended bet
  const bettingAdvice = getRecommendedBet(trueCount, rules, 25);

  // Shuffle shoe
  const handleShuffle = () => {
    const newShoe = createShoe(rules.decksCount);
    setShoe(newShoe);
    setRunningCount(getInitialRunningCount(rules.countingSystem, rules.decksCount));
    soundManager.playCardDeal();
  };

  // Check if shoe needs reshuffle after round
  const checkShoePenetration = (shoeCards: Card[]) => {
    const dealt = totalCardsInShoe - shoeCards.length;
    if (dealt >= totalCardsInShoe * rules.penetration) {
      handleShuffle();
    }
  };

  // Helper to deal a single card from shoe
  const drawCard = (deck: Card[], faceUp: boolean = true): { card: Card; newDeck: Card[] } => {
    let availableDeck = deck;
    if (availableDeck.length === 0) {
      availableDeck = createShoe(rules.decksCount);
    }
    const card = { ...availableDeck[0], isFaceUp: faceUp };
    const newDeck = availableDeck.slice(1);
    return { card, newDeck };
  };

  // Update count when a card is revealed
  const registerRevealedCard = (card: Card) => {
    const val = getCardCountValue(card, rules.countingSystem);
    setRunningCount((prev) => prev + val);
  };

  // Add chip to current bet
  const handleAddChip = (amount: number) => {
    if (gamePhase !== 'betting') return;
    if (currentBet + amount <= bankroll && currentBet + amount <= rules.maxBet) {
      setCurrentBet((prev) => prev + amount);
    }
  };

  const handleClearBet = () => {
    if (gamePhase !== 'betting') return;
    setCurrentBet(rules.minBet);
  };

  const handleRebet = () => {
    if (gamePhase !== 'betting') return;
    if (lastBet <= bankroll) {
      setCurrentBet(lastBet);
    }
  };

  // START ROUND
  const handleDeal = () => {
    if (currentBet > bankroll || currentBet < rules.minBet) return;

    // Deduct bet from bankroll
    onUpdateBankroll(-currentBet);
    setLastBet(currentBet);
    setGamePhase('dealing');
    setShowInsuranceModal(false);
    setInsuranceBet(0);

    let deck = [...shoe];

    // Deal 4 cards: Player, Dealer, Player, Dealer(faceDown)
    const p1 = drawCard(deck, true);
    deck = p1.newDeck;
    const d1 = drawCard(deck, true);
    deck = d1.newDeck;
    const p2 = drawCard(deck, true);
    deck = p2.newDeck;
    const d2 = drawCard(deck, false); // Dealer hole card
    deck = d2.newDeck;

    setShoe(deck);

    // Register initial face-up cards to counting
    registerRevealedCard(p1.card);
    registerRevealedCard(d1.card);
    registerRevealedCard(p2.card);

    const initialPlayerCards = [p1.card, p2.card];
    const initialDealerCards = [d1.card, d2.card];

    const initialHand: Hand = {
      id: 'hand-0',
      cards: initialPlayerCards,
      bet: currentBet,
      isCompleted: false,
      isDoubled: false,
      isSplit: false,
      outcome: null,
      payout: 0,
    };

    setPlayerHands([initialHand]);
    setDealerHand(initialDealerCards);
    setActiveHandIndex(0);

    soundManager.playCardDeal();

    // Check if dealer upcard is Ace (Offer Insurance)
    if (d1.card.rank === 'A') {
      setTimeout(() => {
        setGamePhase('insurance');
        setShowInsuranceModal(true);
      }, 500);
      return;
    }

    // Check player natural Blackjack
    const playerScore = calculateHandScore(initialPlayerCards);
    if (playerScore.isBlackjack) {
      setTimeout(() => {
        resolveDealerTurn(initialDealerCards, [initialHand], deck);
      }, 600);
      return;
    }

    setGamePhase('player_turn');
  };

  // HANDLE INSURANCE
  const handleInsuranceDecision = (take: boolean) => {
    setShowInsuranceModal(false);
    let insBet = 0;
    if (take) {
      insBet = Math.floor(currentBet / 2);
      onUpdateBankroll(-insBet);
      setInsuranceBet(insBet);
      soundManager.playChip();
    }

    // Check if dealer has Blackjack
    const dealerHoleCard = dealerHand[1];
    const dealerHasBlackjack = dealerHoleCard.value === 10;

    if (dealerHasBlackjack) {
      // Dealer has Blackjack!
      setTimeout(() => {
        revealDealerHoleCard();
      }, 400);
    } else {
      // No blackjack for dealer
      const pScore = calculateHandScore(playerHands[0].cards);
      if (pScore.isBlackjack) {
        setTimeout(() => {
          revealDealerHoleCard();
        }, 400);
      } else {
        setGamePhase('player_turn');
      }
    }
  };

  // PLAYER ACTION: HIT
  const handleHit = () => {
    if (gamePhase !== 'player_turn') return;
    const hand = playerHands[activeHandIndex];
    if (hand.isCompleted) return;

    let deck = [...shoe];
    const { card, newDeck } = drawCard(deck, true);
    setShoe(newDeck);
    registerRevealedCard(card);
    soundManager.playCardDeal();

    const updatedCards = [...hand.cards, card];
    const score = calculateHandScore(updatedCards);

    const updatedHand: Hand = {
      ...hand,
      cards: updatedCards,
      isCompleted: score.isBust || score.total === 21,
    };

    const newHands = [...playerHands];
    newHands[activeHandIndex] = updatedHand;
    setPlayerHands(newHands);

    if (score.isBust) {
      soundManager.playBust();
    }

    if (updatedHand.isCompleted) {
      advanceOrFinishPlayer(newHands, newDeck);
    }
  };

  // PLAYER ACTION: STAND
  const handleStand = () => {
    if (gamePhase !== 'player_turn') return;
    const hand = playerHands[activeHandIndex];
    const updatedHand: Hand = { ...hand, isCompleted: true };
    const newHands = [...playerHands];
    newHands[activeHandIndex] = updatedHand;
    setPlayerHands(newHands);

    advanceOrFinishPlayer(newHands, shoe);
  };

  // PLAYER ACTION: DOUBLE DOWN
  const handleDouble = () => {
    if (gamePhase !== 'player_turn') return;
    const hand = playerHands[activeHandIndex];
    if (hand.cards.length !== 2 || hand.bet > bankroll) return;

    // Deduct additional bet
    onUpdateBankroll(-hand.bet);
    soundManager.playChip();

    let deck = [...shoe];
    const { card, newDeck } = drawCard(deck, true);
    setShoe(newDeck);
    registerRevealedCard(card);
    soundManager.playCardDeal();

    const updatedCards = [...hand.cards, card];
    const score = calculateHandScore(updatedCards);

    const updatedHand: Hand = {
      ...hand,
      cards: updatedCards,
      bet: hand.bet * 2,
      isDoubled: true,
      isCompleted: true,
    };

    const newHands = [...playerHands];
    newHands[activeHandIndex] = updatedHand;
    setPlayerHands(newHands);

    if (score.isBust) {
      soundManager.playBust();
    }

    advanceOrFinishPlayer(newHands, newDeck);
  };

  // PLAYER ACTION: SPLIT
  const handleSplit = () => {
    if (gamePhase !== 'player_turn') return;
    const hand = playerHands[activeHandIndex];
    if (!canSplitHand(hand.cards) || hand.cards.length !== 2 || hand.bet > bankroll) return;

    // Deduct bet for the split hand
    onUpdateBankroll(-hand.bet);
    soundManager.playChip();

    let deck = [...shoe];
    // Deal 1 card to first split hand
    const d1 = drawCard(deck, true);
    deck = d1.newDeck;
    registerRevealedCard(d1.card);

    // Deal 1 card to second split hand
    const d2 = drawCard(deck, true);
    deck = d2.newDeck;
    registerRevealedCard(d2.card);

    setShoe(deck);

    const hand1: Hand = {
      id: `${hand.id}-1`,
      cards: [hand.cards[0], d1.card],
      bet: hand.bet,
      isCompleted: false,
      isDoubled: false,
      isSplit: true,
      outcome: null,
      payout: 0,
    };

    const hand2: Hand = {
      id: `${hand.id}-2`,
      cards: [hand.cards[1], d2.card],
      bet: hand.bet,
      isCompleted: false,
      isDoubled: false,
      isSplit: true,
      outcome: null,
      payout: 0,
    };

    const newHands = [...playerHands];
    newHands.splice(activeHandIndex, 1, hand1, hand2);
    setPlayerHands(newHands);
    soundManager.playCardDeal();
  };

  // PLAYER ACTION: SURRENDER
  const handleSurrender = () => {
    if (gamePhase !== 'player_turn') return;
    const hand = playerHands[activeHandIndex];
    if (hand.cards.length !== 2 || !rules.allowSurrender) return;

    // Return half the bet
    const refund = Math.floor(hand.bet / 2);
    onUpdateBankroll(refund);

    const updatedHand: Hand = {
      ...hand,
      isCompleted: true,
      outcome: 'surrendered',
      payout: refund,
    };

    const newHands = [...playerHands];
    newHands[activeHandIndex] = updatedHand;
    setPlayerHands(newHands);

    advanceOrFinishPlayer(newHands, shoe);
  };

  // Advance to next active split hand or finish player turn
  const advanceOrFinishPlayer = (hands: Hand[], currentShoe: Card[]) => {
    const nextIncompleteIndex = hands.findIndex((h) => !h.isCompleted);
    if (nextIncompleteIndex !== -1) {
      setActiveHandIndex(nextIncompleteIndex);
    } else {
      // All player hands done!
      // If all hands are busted or surrendered, dealer doesn't need to draw
      const allBustedOrSurrendered = hands.every((h) => {
        const score = calculateHandScore(h.cards);
        return score.isBust || h.outcome === 'surrendered';
      });

      if (allBustedOrSurrendered) {
        revealDealerHoleCard();
      } else {
        setGamePhase('dealer_turn');
        resolveDealerTurn(dealerHand, hands, currentShoe);
      }
    }
  };

  // Reveal dealer's face down card
  const revealDealerHoleCard = () => {
    const holeCard = dealerHand[1];
    if (!holeCard.isFaceUp) {
      registerRevealedCard(holeCard);
      const updatedDealerCards = dealerHand.map((c, i) => (i === 1 ? { ...c, isFaceUp: true } : c));
      setDealerHand(updatedDealerCards);
    }
    finishRound(dealerHand, playerHands);
  };

  // RESOLVE DEALER TURN (Dealer hits until >= 17 according to S17/H17)
  const resolveDealerTurn = (
    currentDealerCards: Card[],
    allPlayerHands: Hand[],
    currentShoe: Card[]
  ) => {
    // 1. Reveal hole card
    let dCards = currentDealerCards.map((c, i) => (i === 1 ? { ...c, isFaceUp: true } : c));
    registerRevealedCard(currentDealerCards[1]);
    setDealerHand(dCards);
    soundManager.playCardDeal();

    let deck = [...currentShoe];

    const runDealerStep = () => {
      const dScore = calculateHandScore(dCards);

      // Check if dealer must hit:
      // Dealer hits if total < 17
      // If H17 is true and total === 17 and isSoft -> Dealer must hit!
      const mustHit =
        dScore.total < 17 || (rules.dealerHitsSoft17 && dScore.total === 17 && dScore.isSoft);

      if (mustHit) {
        const { card, newDeck } = drawCard(deck, true);
        deck = newDeck;
        registerRevealedCard(card);
        dCards = [...dCards, card];
        setDealerHand(dCards);
        setShoe(deck);
        soundManager.playCardDeal();

        dealerTurnTimeoutRef.current = window.setTimeout(runDealerStep, 650);
      } else {
        // Dealer is done!
        finishRound(dCards, allPlayerHands);
      }
    };

    dealerTurnTimeoutRef.current = window.setTimeout(runDealerStep, 650);
  };

  // FINISH ROUND AND EVALUATE PAYOUTS
  const finishRound = (finalDealerCards: Card[], finalPlayerHands: Hand[]) => {
    const dScore = calculateHandScore(finalDealerCards);
    let totalNetReturn = 0;
    let hadBlackjack = false;
    let hadWin = false;

    // Check insurance payout if taken
    if (insuranceBet > 0) {
      if (dScore.isBlackjack) {
        // Insurance pays 2:1 (win 2x insurance bet + return insurance bet)
        const insPayout = insuranceBet * 3;
        totalNetReturn += insPayout;
        onUpdateBankroll(insPayout);
      }
    }

    const updatedHands = finalPlayerHands.map((hand) => {
      if (hand.outcome === 'surrendered') {
        onRecordHandResult('surrendered', -Math.floor(hand.bet / 2));
        return hand;
      }

      const pScore = calculateHandScore(hand.cards);
      let outcome: HandOutcome = 'lose';
      let payout = 0;

      if (pScore.isBust) {
        outcome = 'lose';
        payout = 0;
      } else if (pScore.isBlackjack && !hand.isSplit) {
        if (dScore.isBlackjack) {
          outcome = 'push';
          payout = hand.bet; // Push returns original bet
        } else {
          outcome = 'blackjack';
          hadBlackjack = true;
          hadWin = true;
          // Payout 3:2 (bet * 2.5) or 6:5 (bet * 2.2)
          payout = Math.round(hand.bet * (1 + rules.blackjackPayoutRatio));
        }
      } else if (dScore.isBlackjack) {
        outcome = 'lose';
        payout = 0;
      } else if (dScore.isBust) {
        outcome = 'win';
        hadWin = true;
        payout = hand.bet * 2;
      } else if (pScore.total > dScore.total) {
        outcome = 'win';
        hadWin = true;
        payout = hand.bet * 2;
      } else if (pScore.total < dScore.total) {
        outcome = 'lose';
        payout = 0;
      } else {
        outcome = 'push';
        payout = hand.bet;
      }

      totalNetReturn += payout;
      const netWin = payout - hand.bet;
      onRecordHandResult(outcome, netWin);

      return {
        ...hand,
        outcome,
        payout,
      };
    });

    if (totalNetReturn > 0) {
      onUpdateBankroll(totalNetReturn);
    }

    setPlayerHands(updatedHands);
    setGamePhase('round_over');

    // Sounds & celebrations
    if (hadBlackjack) {
      soundManager.playBlackjack();
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } else if (hadWin) {
      soundManager.playWin();
    } else {
      soundManager.playBust();
    }

    // Check shoe penetration
    checkShoePenetration(shoe);

    // Quiz prompt check
    roundsCountRef.current += 1;
    const count = roundsCountRef.current;
    let shouldTriggerQuiz = false;
    if (rules.quizFrequency === 'every_round') shouldTriggerQuiz = true;
    if (rules.quizFrequency === 'every_3_rounds' && count % 3 === 0) shouldTriggerQuiz = true;
    if (rules.quizFrequency === 'random' && Math.random() < 0.35) shouldTriggerQuiz = true;

    if (shouldTriggerQuiz) {
      setTimeout(() => setIsQuizOpen(true), 1200);
    }
  };

  useEffect(() => {
    return () => {
      if (dealerTurnTimeoutRef.current) clearTimeout(dealerTurnTimeoutRef.current);
    };
  }, []);

  // Compute active hand strategy advice
  const activeHand = playerHands[activeHandIndex] || playerHands[0];
  const dealerUpcard = dealerHand[0];

  const strategyAdvice =
    gamePhase === 'player_turn' && activeHand && dealerUpcard && !activeHand.isCompleted
      ? getCountingDeviatedStrategy(
          activeHand.cards,
          dealerUpcard,
          trueCount,
          rules,
          activeHand.cards.length === 2 && bankroll >= activeHand.bet,
          canSplitHand(activeHand.cards) && activeHand.cards.length === 2 && bankroll >= activeHand.bet
        )
      : null;

  const dealerScore = calculateHandScore(dealerHand);
  const insuranceAdvice = shouldTakeInsurance(trueCount);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* LEFT: CASINO BLACKJACK FELT TABLE */}
      <div className="flex-1 flex flex-col justify-between bg-linear-to-b from-emerald-900 via-emerald-950 to-slate-950 rounded-3xl p-6 border-4 border-amber-600/30 shadow-2xl relative min-h-[580px] overflow-hidden select-none">
        {/* Table Felt Radial Glow & Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] rounded-[100%] border border-amber-400/15 pointer-events-none" />

        {/* Center Felt Inscription */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
          <span className="font-serif text-amber-300 font-extrabold text-sm tracking-[0.25em] uppercase block">
            Blackjack paga {rules.blackjackPayoutRatio === 1.5 ? '3 a 2' : '6 a 5'}
          </span>
          <span className="text-[11px] font-sans font-semibold text-slate-300 tracking-wider uppercase block mt-1">
            Crupier se planta en 17 {rules.dealerHitsSoft17 ? '(Pide en 17 suave)' : '(Plantado en 17 suave)'}
          </span>
          <span className="text-[10px] text-amber-200/80 tracking-widest uppercase block mt-1">
            Seguro paga 2 a 1
          </span>
        </div>

        {/* TOP: DEALER AREA */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300/80">
              Crupier
            </span>
            {dealerHand.length > 0 && dealerHand[0].isFaceUp && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 font-mono text-xs font-bold border border-amber-400/30">
                {gamePhase === 'player_turn' || gamePhase === 'insurance'
                  ? `Muestra ${dealerHand[0].rank === 'A' ? '11 / As' : dealerHand[0].value}`
                  : dealerScore.isBust
                  ? '¡PASADO!'
                  : dealerScore.isBlackjack
                  ? '¡BLACKJACK!'
                  : dealerScore.isSoft
                  ? `Suave ${dealerScore.total}`
                  : `${dealerScore.total}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 min-h-[110px] py-1">
            {dealerHand.length === 0 ? (
              <div className="w-20 h-28 border-2 border-dashed border-emerald-700/40 rounded-lg flex items-center justify-center text-emerald-600/60 text-xs font-bold">
                Crupier
              </div>
            ) : (
              dealerHand.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  showCountBadge={showCardCountBadges && card.isFaceUp}
                  systemName={rules.countingSystem}
                />
              ))
            )}
          </div>
        </div>

        {/* MIDDLE: INSURANCE PROMPT MODAL OVER FELT */}
        {showInsuranceModal && (
          <div className="relative z-30 my-4 mx-auto max-w-md w-full bg-slate-900/95 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <Shield className="w-5 h-5" />
              <h4>¿Apostar Seguro?</h4>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              El crupier muestra un As. El seguro cuesta{' '}
              <strong className="text-white">${Math.floor(currentBet / 2)}</strong> y paga 2:1 si el crupier tiene Blackjack.
            </p>
            {/* Live Card Counting Advice */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] mb-4">
              <span className="font-bold text-amber-300 block mb-1">
                Consejo del Contador (TC = {trueCount > 0 ? `+${trueCount}` : trueCount}):
              </span>
              <p className="text-slate-300">{insuranceAdvice.reason}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleInsuranceDecision(true)}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Aceptar Seguro (${Math.floor(currentBet / 2)})
              </button>
              <button
                onClick={() => handleInsuranceDecision(false)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl shadow transition"
              >
                Rechazar Seguro
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM: PLAYER HANDS AREA */}
        <div className="relative z-10 flex flex-col items-center gap-4 mt-6">
          <div className="flex items-center justify-center flex-wrap gap-6 w-full">
            {playerHands.length === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-28 border-2 border-dashed border-emerald-700/40 rounded-lg flex items-center justify-center text-emerald-600/60 text-xs font-bold">
                  Jugador
                </div>
                <span className="text-xs text-emerald-400/80 font-medium">
                  Coloca tu apuesta y pulsa Repartir
                </span>
              </div>
            ) : (
              playerHands.map((hand, idx) => {
                const pScore = calculateHandScore(hand.cards);
                const isActive = activeHandIndex === idx && gamePhase === 'player_turn';

                return (
                  <div
                    key={hand.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-emerald-950/60 ring-2 ring-amber-400 shadow-xl scale-105'
                        : 'bg-slate-950/40'
                    }`}
                  >
                    {/* Hand Score Badge & Outcome */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                        {pScore.isBust
                          ? '¡PASADO!'
                          : pScore.isBlackjack
                          ? '¡BLACKJACK!'
                          : pScore.isSoft
                          ? `Suave ${pScore.total}`
                          : `${pScore.total}`}
                      </span>

                      {hand.outcome && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase ${
                            hand.outcome === 'win' || hand.outcome === 'blackjack'
                              ? 'bg-emerald-500 text-slate-950'
                              : hand.outcome === 'push'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {hand.outcome === 'win'
                            ? `+ $${hand.bet}`
                            : hand.outcome === 'blackjack'
                            ? `+ $${Math.round(hand.bet * rules.blackjackPayoutRatio)}`
                            : hand.outcome === 'push'
                            ? 'Empate'
                            : hand.outcome === 'surrendered'
                            ? 'Rendido'
                            : 'Perdida'}
                        </span>
                      )}
                    </div>

                    {/* Cards */}
                    <div className="flex items-center gap-2 min-h-[110px]">
                      {hand.cards.map((card) => (
                        <CardView
                          key={card.id}
                          card={card}
                          showCountBadge={showCardCountBadges}
                          systemName={rules.countingSystem}
                        />
                      ))}
                    </div>

                    {/* Bet on Hand */}
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                      <span>Apuesta:</span>
                      <span className="text-amber-400">${hand.bet}</span>
                      {hand.isDoubled && (
                        <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded text-[10px]">
                          2X
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TABLE CONTROLS / ACTION BUTTONS */}
          <div className="w-full max-w-xl bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-slate-800 shadow-xl">
            {gamePhase === 'betting' || gamePhase === 'round_over' ? (
              <div className="flex flex-col gap-3">
                {/* Chip Betting Selector */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
                  <div className="flex items-center gap-2">
                    {[5, 10, 25, 50, 100, 500].map((val) => (
                      <Chip
                        key={val}
                        value={val}
                        onClick={() => handleAddChip(val)}
                        disabled={currentBet + val > bankroll}
                        size="md"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleClearBet}
                      className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Limpiar apuesta al mínimo"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={handleRebet}
                      disabled={lastBet > bankroll}
                      className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:opacity-40 transition"
                      title="Repetir apuesta anterior"
                    >
                      Repetir (${lastBet})
                    </button>
                  </div>
                </div>

                {/* Deal Action Button */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Apuesta actual:</span>
                    <span className="font-mono text-xl font-black text-amber-400">
                      ${currentBet}
                    </span>
                  </div>

                  <button
                    onClick={handleDeal}
                    disabled={currentBet > bankroll || currentBet < rules.minBet}
                    className="py-3 px-8 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/20 transform transition hover:scale-102 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Repartir Cartas</span>
                  </button>
                </div>
              </div>
            ) : gamePhase === 'player_turn' ? (
              /* In-Play Decision Buttons */
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  onClick={handleHit}
                  className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow transition transform active:scale-95 cursor-pointer"
                >
                  Pedir (Hit)
                </button>
                <button
                  onClick={handleStand}
                  className="py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow transition transform active:scale-95 cursor-pointer"
                >
                  Plantarse (Stand)
                </button>
                <button
                  onClick={handleDouble}
                  disabled={
                    activeHand?.cards.length !== 2 || bankroll < (activeHand?.bet || 0)
                  }
                  className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow transition transform active:scale-95 cursor-pointer"
                >
                  Doblar (2x)
                </button>
                <button
                  onClick={handleSplit}
                  disabled={
                    !activeHand ||
                    !canSplitHand(activeHand.cards) ||
                    activeHand.cards.length !== 2 ||
                    bankroll < activeHand.bet
                  }
                  className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow transition transform active:scale-95 cursor-pointer"
                >
                  Dividir (Split)
                </button>
                <button
                  onClick={handleSurrender}
                  disabled={
                    !rules.allowSurrender || activeHand?.cards.length !== 2
                  }
                  className="col-span-2 sm:col-span-1 py-3 px-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow transition transform active:scale-95 cursor-pointer"
                >
                  Rendirse
                </button>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-slate-400 font-mono animate-pulse">
                {gamePhase === 'dealer_turn' ? 'Turno del crupier...' : 'Repartiendo...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: COUNTING HUD & SHOE VISUALIZER */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Counting HUD */}
        <CountingHUD
          runningCount={runningCount}
          trueCount={trueCount}
          remainingCards={shoe.length}
          totalCards={totalCardsInShoe}
          systemName={rules.countingSystem}
          strategyAdvice={strategyAdvice}
          bettingAdvice={bettingAdvice}
          onOpenQuiz={() => setIsQuizOpen(true)}
          showCardCountBadges={showCardCountBadges}
          onToggleCardCountBadges={() => setShowCardCountBadges((prev) => !prev)}
        />

        {/* Shoe Status & Discard Tray */}
        <ShoeVisualizer
          totalCards={totalCardsInShoe}
          remainingCards={shoe.length}
          decksCount={rules.decksCount}
          penetration={rules.penetration}
          onShuffle={handleShuffle}
          canShuffle={gamePhase === 'betting' || gamePhase === 'round_over'}
        />
      </div>

      {/* Checkpoint / Quiz Modal */}
      <CountingQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        actualRunningCount={runningCount}
        actualTrueCount={trueCount}
        remainingCards={shoe.length}
        systemName={rules.countingSystem}
        onRecordResult={(correct) => onRecordQuiz(correct)}
      />
    </div>
  );
};
