import React from 'react';
import { Trophy, TrendingUp, CheckCircle, Percent } from 'lucide-react';
import { PlayerStats, DrillStats } from '../types/stats';

interface StatsBarProps {
  playerStats: PlayerStats;
  drillStats: DrillStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ playerStats, drillStats }) => {
  const winRate =
    playerStats.handsPlayed > 0
      ? Math.round((playerStats.handsWon / playerStats.handsPlayed) * 100)
      : 0;

  const countQuizAccuracy =
    playerStats.quizzesTaken > 0
      ? Math.round((playerStats.quizzesCorrect / playerStats.quizzesTaken) * 100)
      : 100;

  const speedDrillAccuracy =
    drillStats.speedDrillRounds > 0
      ? Math.round((drillStats.speedDrillCorrect / drillStats.speedDrillRounds) * 100)
      : 100;

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-around gap-4 text-xs">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400">Manos:</span>
        <span className="font-mono font-bold text-white">
          {playerStats.handsPlayed} (W: {playerStats.handsWon} / L: {playerStats.handsLost} / P: {playerStats.handsPushed})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Percent className="w-4 h-4 text-emerald-400" />
        <span className="text-slate-400">Tasa de Victoria:</span>
        <span className="font-mono font-bold text-emerald-400">{winRate}%</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold">♠</span>
        <span className="text-slate-400">Blackjacks:</span>
        <span className="font-mono font-bold text-amber-300">{playerStats.blackjacks}</span>
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-indigo-400" />
        <span className="text-slate-400">Precisión Conteo en Mesa:</span>
        <span className="font-mono font-bold text-indigo-300">
          {playerStats.quizzesTaken > 0 ? `${countQuizAccuracy}% (${playerStats.quizzesCorrect}/${playerStats.quizzesTaken})` : 'Sin pruebas'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-teal-400" />
        <span className="text-slate-400">Precisión Drills de Velocidad:</span>
        <span className="font-mono font-bold text-teal-300">
          {drillStats.speedDrillRounds > 0 ? `${speedDrillAccuracy}% (${drillStats.speedDrillCorrect}/${drillStats.speedDrillRounds})` : 'Sin pruebas'}
        </span>
      </div>
    </div>
  );
};
