import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Card, Suit, CardRank } from '../types/cards';
import { TableRules, StrategyAction } from '../types/blackjack';
import { getRankValue, calculateHandScore } from '../utils/cardDeck';
import { getCountingDeviatedStrategy } from '../utils/illustrious18';
import { CardView } from './CardView';
import { soundManager } from '../utils/sound';

interface StrategyTrainerProps {
  rules: TableRules;
  onRecordDecision: (isCorrect: boolean) => void;
}

interface Scenario {
  playerCards: Card[];
  dealerUpcard: Card;
  trueCount: number;
}

export const StrategyTrainer: React.FC<StrategyTrainerProps> = ({
  rules,
  onRecordDecision,
}) => {
  const [includeDeviations, setIncludeDeviations] = useState<boolean>(true);
  const [scoreStreak, setScoreStreak] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);

  // Current scenario generator
  const generateRandomScenario = (): Scenario => {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const randomCard = (rank?: CardRank): Card => {
      const r = rank || ranks[Math.floor(Math.random() * ranks.length)];
      const s = suits[Math.floor(Math.random() * suits.length)];
      return {
        id: Math.random().toString(),
        suit: s,
        rank: r,
        value: getRankValue(r),
        isFaceUp: true,
      };
    };

    // If including deviations, 50% chance of generating a famous Illustrious 18 scenario
    if (includeDeviations && Math.random() < 0.5) {
      const devPresets = [
        // 16 vs 10 (TC >= 0 -> Stand, else Hit)
        { player: ['10', '6'] as [CardRank, CardRank], dealer: '10' as CardRank, tcOptions: [-1, 0, 1, 2] },
        // 15 vs 10 (TC >= 4 -> Stand, else Hit/Surrender)
        { player: ['10', '5'] as [CardRank, CardRank], dealer: '10' as CardRank, tcOptions: [2, 4, 5] },
        // 12 vs 3 (TC >= 2 -> Stand, else Hit)
        { player: ['10', '2'] as [CardRank, CardRank], dealer: '3' as CardRank, tcOptions: [0, 1, 2, 3] },
        // 12 vs 2 (TC >= 3 -> Stand, else Hit)
        { player: ['10', '2'] as [CardRank, CardRank], dealer: '2' as CardRank, tcOptions: [1, 2, 3, 4] },
        // 10-10 vs 5 (TC >= 5 -> Split, else Stand)
        { player: ['10', '10'] as [CardRank, CardRank], dealer: '5' as CardRank, tcOptions: [3, 5, 6] },
        // 10-10 vs 6 (TC >= 4 -> Split, else Stand)
        { player: ['10', '10'] as [CardRank, CardRank], dealer: '6' as CardRank, tcOptions: [2, 4, 5] },
        // 10 vs 10 (TC >= 4 -> Double, else Hit)
        { player: ['6', '4'] as [CardRank, CardRank], dealer: '10' as CardRank, tcOptions: [1, 4, 5] },
        // 11 vs A (TC >= 1 -> Double, else Hit)
        { player: ['6', '5'] as [CardRank, CardRank], dealer: 'A' as CardRank, tcOptions: [0, 1, 2] },
        // 9 vs 2 (TC >= 1 -> Double, else Hit)
        { player: ['7', '2'] as [CardRank, CardRank], dealer: '2' as CardRank, tcOptions: [0, 1, 2] },
      ];
      const preset = devPresets[Math.floor(Math.random() * devPresets.length)];
      const tc = preset.tcOptions[Math.floor(Math.random() * preset.tcOptions.length)];
      return {
        playerCards: [randomCard(preset.player[0]), randomCard(preset.player[1])],
        dealerUpcard: randomCard(preset.dealer),
        trueCount: tc,
      };
    }

    // Standard scenario
    const c1 = randomCard();
    const c2 = randomCard();
    const dealer = randomCard();
    const tc = Math.floor(Math.random() * 9) - 4; // -4 to +4
    return {
      playerCards: [c1, c2],
      dealerUpcard: dealer,
      trueCount: tc,
    };
  };

  const [scenario, setScenario] = useState<Scenario>(generateRandomScenario);
  const [selectedAction, setSelectedAction] = useState<StrategyAction | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const advice = getCountingDeviatedStrategy(
    scenario.playerCards,
    scenario.dealerUpcard,
    scenario.trueCount,
    rules,
    true,
    true
  );

  const handleAction = (action: StrategyAction) => {
    if (selectedAction !== null) return; // already answered
    setSelectedAction(action);
    const correct = action === advice.recommendedAction;
    setIsCorrect(correct);

    setTotalAnswered((prev) => prev + 1);
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
      setScoreStreak((prev) => prev + 1);
      soundManager.playCorrect();
    } else {
      setScoreStreak(0);
      soundManager.playWrong();
    }
    onRecordDecision(correct);
  };

  const handleNext = () => {
    setSelectedAction(null);
    setIsCorrect(null);
    setScenario(generateRandomScenario());
  };

  const playerScore = calculateHandScore(scenario.playerCards);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
            <Target className="w-5 h-5" />
            <h2 className="text-xl">Entrenador de Estrategia Básica y Desviaciones</h2>
          </div>
          <p className="text-sm text-slate-300">
            Aprende a tomar la decisión óptima matemáticamente frente a cualquier mano y Conteo Real.
          </p>
        </div>

        {/* Stats & Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Racha actual / Aciertos</div>
            <div className="font-mono font-bold text-amber-400">
              🔥 {scoreStreak} | {correctAnswers}/{totalAnswered} (
              {totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%)
            </div>
          </div>

          <label className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={includeDeviations}
              onChange={(e) => setIncludeDeviations(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Incluir Illustrious 18</span>
          </label>
        </div>
      </div>

      {/* Main Arena */}
      <div className="bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center gap-8">
          {/* True Count Indicator Banner */}
          <div className="bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-mono flex items-center gap-2">
            <span className="text-slate-400">Situación de la mesa:</span>
            <span className="text-amber-400 font-bold">
              True Count = {scenario.trueCount > 0 ? `+${scenario.trueCount}` : scenario.trueCount}
            </span>
          </div>

          {/* Table Cards Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-lg">
            {/* Dealer Upcard */}
            <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Carta del Crupier
              </span>
              <CardView card={scenario.dealerUpcard} size="lg" />
              <span className="text-xs text-slate-400 mt-2 font-mono">
                Muestra: {scenario.dealerUpcard.rank === 'A' ? 'As (11)' : scenario.dealerUpcard.value}
              </span>
            </div>

            {/* Player Hand */}
            <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tu Mano ({playerScore.isSoft ? `Suave ${playerScore.total}` : playerScore.total})
              </span>
              <div className="flex gap-2">
                {scenario.playerCards.map((card) => (
                  <CardView key={card.id} card={card} size="lg" />
                ))}
              </div>
              <span className="text-xs text-slate-400 mt-2 font-mono">
                Total: {playerScore.total}
              </span>
            </div>
          </div>

          {/* Action Choice Buttons */}
          {selectedAction === null ? (
            <div className="w-full max-w-xl">
              <div className="text-center text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                ¿Qué decisión tomas?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <button
                  onClick={() => handleAction('hit')}
                  className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Pedir (Hit)
                </button>
                <button
                  onClick={() => handleAction('stand')}
                  className="py-3 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Plantarse (Stand)
                </button>
                <button
                  onClick={() => handleAction('double')}
                  className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Doblar (Double)
                </button>
                <button
                  onClick={() => handleAction('split')}
                  className="py-3 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Dividir (Split)
                </button>
                <button
                  onClick={() => handleAction('surrender')}
                  className="col-span-2 sm:col-span-1 py-3 px-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                >
                  Rendirse
                </button>
              </div>
            </div>
          ) : (
            /* Result and Explanation */
            <div className="w-full max-w-xl space-y-4 animate-fadeIn">
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-500 text-rose-200'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-base">
                    {isCorrect ? '¡Correcto!' : 'Decisión Incorrecta'}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Jugada correcta:{' '}
                    <strong className="text-amber-300">{advice.actionLabel}</strong>
                    {advice.isDeviation && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                        ⚡ {advice.deviationDescription}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {advice.explanation}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Siguiente Mano</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
