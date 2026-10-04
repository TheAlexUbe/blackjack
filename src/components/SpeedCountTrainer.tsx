import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, CheckCircle2, XCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Card, CountingSystemName } from '../types/cards';
import { createShoe } from '../utils/cardDeck';
import { getCardCountValue, COUNTING_SYSTEMS } from '../utils/countingSystems';
import { CardView } from './CardView';
import { soundManager } from '../utils/sound';

interface SpeedCountTrainerProps {
  systemName: CountingSystemName;
  onRecordDrill: (cardsCounted: number, isCorrect: boolean) => void;
}

export const SpeedCountTrainer: React.FC<SpeedCountTrainerProps> = ({
  systemName,
  onRecordDrill,
}) => {
  const [drillCardsCount, setDrillCardsCount] = useState<number>(20);
  const [dealPairs, setDealPairs] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  // Drill active state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userFinalGuess, setUserFinalGuess] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<number | null>(null);

  const system = COUNTING_SYSTEMS[systemName];

  const startDrill = () => {
    // Generate fresh cards
    const freshDeck = createShoe(1).slice(0, drillCardsCount);
    setDeck(freshDeck);
    setCurrentIndex(0);
    setIsFinished(false);
    setIsCorrect(null);
    setUserFinalGuess(0);
    setIsPlaying(true);
    soundManager.playCardDeal();
  };

  const advanceCard = () => {
    const step = dealPairs ? 2 : 1;
    setCurrentIndex((prev) => {
      const next = prev + step;
      if (next >= deck.length) {
        setIsPlaying(false);
        setIsFinished(true);
        return deck.length;
      }
      soundManager.playCardDeal();
      return next;
    });
  };

  // Auto play effect
  useEffect(() => {
    if (isPlaying && autoPlay) {
      timerRef.current = window.setInterval(() => {
        advanceCard();
      }, speedMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoPlay, speedMs, deck.length, dealPairs]);

  // Handle keyboard shortcut (Spacebar to next card if not autoPlay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying && !autoPlay && e.code === 'Space') {
        e.preventDefault();
        advanceCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, autoPlay, deck.length]);

  // Calculate actual count for deck
  const actualCount = deck.reduce(
    (sum, card) => sum + getCardCountValue(card, systemName),
    0
  );

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = userFinalGuess === actualCount;
    setIsCorrect(correct);
    if (correct) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    onRecordDrill(deck.length, correct);
  };

  // Visible cards at current step
  const visibleCards: Card[] = [];
  if (isPlaying && deck.length > 0) {
    if (dealPairs) {
      if (currentIndex < deck.length) visibleCards.push(deck[currentIndex]);
      if (currentIndex + 1 < deck.length) visibleCards.push(deck[currentIndex + 1]);
    } else {
      if (currentIndex < deck.length) visibleCards.push(deck[currentIndex]);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
            <Zap className="w-5 h-5" />
            <h2 className="text-xl">Entrenador Rápido de Conteo (Flashcards)</h2>
          </div>
          <p className="text-sm text-slate-300">
            Aumenta tu velocidad mental reconociendo valores y practicando la{' '}
            <strong className="text-amber-300">cancelación de parejas</strong> (+1 y -1 se anulan instantáneamente).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            Sistema: {system.label}
          </span>
        </div>
      </div>

      {/* Drill Arena */}
      <div className="bg-linear-to-b from-emerald-950 via-slate-950 to-slate-950 border-2 border-emerald-900/60 rounded-3xl p-8 min-h-[420px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Decorative table felt pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {!isPlaying && !isFinished ? (
          /* Config screen before starting */
          <div className="w-full max-w-lg space-y-6 text-center z-10">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Configura tu Sesión</h3>
              <p className="text-xs text-slate-400">
                Selecciona la cantidad de cartas, modo de reparto y velocidad
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Cards count */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Total de Cartas
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[10, 20, 30, 52].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setDrillCardsCount(cnt)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition ${
                        drillCardsCount === cnt
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cnt === 52 ? '1 Baraja' : cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode: Single vs Pairs */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Modo Reparto
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDealPairs(false)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition text-center ${
                      !dealPairs
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1 Carta
                  </button>
                  <button
                    type="button"
                    onClick={() => setDealPairs(true)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition text-center ${
                      dealPairs
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Entrena la cancelación de parejas como en mesa real"
                  >
                    Parejas (2 cartas)
                  </button>
                </div>
              </div>

              {/* Speed */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Velocidad
                </label>
                <div className="flex flex-col gap-1.5">
                  <select
                    value={autoPlay ? speedMs : -1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val === -1) {
                        setAutoPlay(false);
                      } else {
                        setAutoPlay(true);
                        setSpeedMs(val);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-2 text-xs font-bold text-slate-200 focus:outline-hidden"
                  >
                    <option value={2000}>2.0s (Tranquilo)</option>
                    <option value={1200}>1.2s (Medio)</option>
                    <option value={800}>0.8s (Rápido)</option>
                    <option value={500}>0.5s (Casino Pro)</option>
                    <option value={-1}>Manual (Espacio / Clic)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 text-center">
                    {autoPlay ? `${speedMs / 1000}s por pase` : 'A tu propio ritmo'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={startDrill}
              className="w-full py-4 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/20 transform transition hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>¡Comenzar Entrenamiento!</span>
            </button>
          </div>
        ) : isPlaying ? (
          /* Active drill cards display */
          <div className="flex flex-col items-center justify-center gap-6 z-10 w-full">
            {/* Progress counter */}
            <div className="flex items-center justify-between w-full max-w-md px-2 text-xs text-slate-400">
              <span>
                Cartas: {Math.min(currentIndex + (dealPairs ? 2 : 1), deck.length)} / {deck.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Pausar"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={startDrill}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cards container */}
            <div className="flex items-center justify-center gap-6 my-4 min-h-[160px]">
              {visibleCards.map((card) => (
                <div key={card.id} className="transition-all duration-300">
                  <CardView card={card} size="lg" />
                </div>
              ))}
            </div>

            {/* Manual next button if not autoPlay */}
            {!autoPlay && (
              <button
                onClick={advanceCard}
                className="py-3 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
              >
                <span>Siguiente Carta (o Pulsa Espacio)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Drill Completed - Evaluation */
          <div className="w-full max-w-lg space-y-6 text-center z-10 animate-fadeIn">
            {isCorrect === null ? (
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">¡Fin del Reparto!</h3>
                <p className="text-sm text-slate-300">
                  Se mostraron {deck.length} cartas. ¿Cuál fue el{' '}
                  <strong className="text-amber-400">Conteo Corriente final</strong>?
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUserFinalGuess((prev) => prev - 1)}
                    className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-xl text-white border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={userFinalGuess}
                    onChange={(e) => setUserFinalGuess(parseInt(e.target.value, 10) || 0)}
                    className="w-28 text-center font-mono font-black text-2xl py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 focus:outline-hidden focus:border-amber-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setUserFinalGuess((prev) => prev + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-xl text-white border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-lg transition cursor-pointer"
                >
                  Verificar Mi Conteo
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div
                  className={`p-5 rounded-2xl border flex flex-col items-center gap-2 ${
                    isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500 text-rose-200'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  ) : (
                    <XCircle className="w-12 h-12 text-rose-400" />
                  )}
                  <h4 className="text-2xl font-black">
                    {isCorrect ? '¡Exacto! Conteo perfecto' : '¡Casi! Fallaste el conteo'}
                  </h4>
                  <div className="flex items-center gap-6 mt-2 text-sm font-mono">
                    <div>
                      Tu cálculo: <span className="font-bold">{userFinalGuess > 0 ? `+${userFinalGuess}` : userFinalGuess}</span>
                    </div>
                    <div>
                      Conteo real: <span className="font-bold text-amber-400">{actualCount > 0 ? `+${actualCount}` : actualCount}</span>
                    </div>
                  </div>
                </div>

                {/* Card breakdown list */}
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left max-h-48 overflow-y-auto">
                  <span className="text-xs font-bold text-slate-400 block mb-2">
                    Desglose de las {deck.length} cartas repartidas:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {deck.map((c, i) => {
                      const val = getCardCountValue(c, systemName);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-xs font-mono"
                        >
                          <span
                            className={
                              c.suit === 'hearts' || c.suit === 'diamonds'
                                ? 'text-rose-400'
                                : 'text-slate-200'
                            }
                          >
                            {c.rank}
                            {c.suit === 'spades' ? '♠' : c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : '♣'}
                          </span>
                          <span
                            className={`font-black text-[11px] ${
                              val > 0
                                ? 'text-emerald-400'
                                : val < 0
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            ({val > 0 ? `+${val}` : val})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={startDrill}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg transition cursor-pointer"
                >
                  Repetir otro Entrenamiento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
