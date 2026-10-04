import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { CountingSystemName } from '../types/cards';
import { COUNTING_SYSTEMS } from '../utils/countingSystems';
import { StrategyAdvice, BettingAdvice } from '../types/blackjack';

interface CountingHUDProps {
  runningCount: number;
  trueCount: number;
  remainingCards: number;
  totalCards: number;
  systemName: CountingSystemName;
  strategyAdvice: StrategyAdvice | null;
  bettingAdvice: BettingAdvice | null;
  onOpenQuiz: () => void;
  showCardCountBadges: boolean;
  onToggleCardCountBadges: () => void;
}

export const CountingHUD: React.FC<CountingHUDProps> = ({
  runningCount,
  trueCount,
  remainingCards,
  systemName,
  strategyAdvice,
  bettingAdvice,
  onOpenQuiz,
  showCardCountBadges,
  onToggleCardCountBadges,
}) => {
  const [hudVisibility, setHudVisibility] = useState<'visible' | 'hidden' | 'peek'>('visible');
  const [isPeeking, setIsPeeking] = useState(false);

  const system = COUNTING_SYSTEMS[systemName];
  const isHidden = hudVisibility === 'hidden' || (hudVisibility === 'peek' && !isPeeking);

  const formatCount = (count: number) => {
    if (count > 0) return `+${count}`;
    return `${count}`;
  };

  const getAdvantageBadge = () => {
    if (trueCount >= 3) {
      return {
        text: '¡Ventaja muy alta para el jugador! (Zapato caliente)',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      };
    }
    if (trueCount >= 1.5) {
      return {
        text: 'Ventaja para el jugador (~0.5% a 1%)',
        color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      };
    }
    if (trueCount <= -1.5) {
      return {
        text: 'Ventaja para la casa (Zapato frío)',
        color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      };
    }
    return {
      text: 'Mesa neutra',
      color: 'bg-slate-700/50 text-slate-300 border-slate-600',
    };
  };

  const advantage = getAdvantageBadge();

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-3.5 shadow-2xl flex flex-col gap-3">
      {/* Top HUD bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200 text-sm tracking-wide">
            HUD de Conteo ({system.label})
          </span>
        </div>

        {/* Visibility control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (hudVisibility === 'visible') setHudVisibility('hidden');
              else if (hudVisibility === 'hidden') setHudVisibility('peek');
              else setHudVisibility('visible');
            }}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Alternar visibilidad del HUD"
          >
            {hudVisibility === 'visible' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Visible</span>
              </>
            ) : hudVisibility === 'peek' ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Al pasar cursor</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px]">Oculto</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow transition"
            title="Probar si recuerdas el conteo"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">Autoevaluación</span>
          </button>
        </div>
      </div>

      {/* Main Counting Metrics Box */}
      <div
        className="relative bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 cursor-default"
        onMouseEnter={() => {
          if (hudVisibility === 'peek') setIsPeeking(true);
        }}
        onMouseLeave={() => {
          if (hudVisibility === 'peek') setIsPeeking(false);
        }}
      >
        {isHidden ? (
          <div className="py-4 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-2xl font-mono text-slate-600 font-bold">??</span>
            <p className="text-xs text-slate-400">
              {hudVisibility === 'peek'
                ? 'Pasa el cursor por aquí para revelar el conteo'
                : 'Conteo oculto para entrenamiento mental.'}
            </p>
            {hudVisibility === 'hidden' && (
              <button
                onClick={() => setHudVisibility('visible')}
                className="text-xs text-amber-400 underline hover:text-amber-300"
              >
                Revelar conteo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Running Count */}
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Conteo Corriente (RC)</span>
              <span
                className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${
                  runningCount > 0
                    ? 'text-emerald-400'
                    : runningCount < 0
                    ? 'text-rose-400'
                    : 'text-slate-200'
                }`}
              >
                {formatCount(runningCount)}
              </span>
              <span className="text-[10px] text-slate-500">Suma total de cartas</span>
            </div>

            {/* True Count */}
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">
                {system.isBalanced ? 'Conteo Real (TC)' : 'Índice KO'}
              </span>
              <span
                className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${
                  trueCount > 0
                    ? 'text-emerald-400'
                    : trueCount < 0
                    ? 'text-rose-400'
                    : 'text-slate-200'
                }`}
              >
                {formatCount(trueCount)}
              </span>
              <span className="text-[10px] text-slate-500">
                {system.isBalanced ? `RC ÷ ${(remainingCards / 52).toFixed(1)} barajas` : 'Sin división'}
              </span>
            </div>
          </div>
        )}

        {/* Advantage Banner */}
        {!isHidden && (
          <div className={`mt-2 py-1 px-2.5 rounded-lg border text-center text-xs font-semibold ${advantage.color}`}>
            {advantage.text}
          </div>
        )}
      </div>

      {/* Recommended Bet Section */}
      {bettingAdvice && !isHidden && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 text-xs">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span>Apuesta recomendada:</span>
              <span className="font-mono text-sm text-white bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/40">
                ${bettingAdvice.recommendedAmount} ({bettingAdvice.recommendedUnits} u)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {bettingAdvice.reason}
            </p>
          </div>
        </div>
      )}

      {/* Live Strategy & Deviations Banner */}
      {strategyAdvice && (
        <div
          className={`rounded-xl p-2.5 text-xs border transition-all ${
            strategyAdvice.isDeviation
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-slate-950/70 border-indigo-500/40 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {strategyAdvice.isDeviation ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-amber-400 uppercase tracking-wider text-[11px]">
                  Desviación Illustrious 18
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-300 text-[11px]">Estrategia Básica</span>
              </>
            )}
          </div>
          <div className="font-extrabold text-sm text-white mb-0.5">
            {strategyAdvice.actionLabel}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {strategyAdvice.explanation}
          </p>
        </div>
      )}

      {/* Toggle card badges */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800 text-slate-400">
        <span>Insignias de valor (+1 / -1) en cartas:</span>
        <button
          onClick={onToggleCardCountBadges}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
            showCardCountBadges
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {showCardCountBadges ? 'Activadas' : 'Desactivadas'}
        </button>
      </div>
    </div>
  );
};
