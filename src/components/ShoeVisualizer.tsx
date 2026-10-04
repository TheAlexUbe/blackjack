import React from 'react';
import { Layers, RotateCcw } from 'lucide-react';

interface ShoeVisualizerProps {
  totalCards: number;
  remainingCards: number;
  decksCount: number;
  penetration: number; // e.g. 0.75
  onShuffle?: () => void;
  canShuffle?: boolean;
}

export const ShoeVisualizer: React.FC<ShoeVisualizerProps> = ({
  totalCards,
  remainingCards,
  decksCount,
  penetration,
  onShuffle,
  canShuffle = true,
}) => {
  const cardsDealt = totalCards - remainingCards;
  const dealtPercentage = Math.round((cardsDealt / totalCards) * 100);
  const remainingDecks = Math.max(0, remainingCards / 52).toFixed(1);
  const dealtDecks = (cardsDealt / 52).toFixed(1);

  const cutCardTriggerCards = Math.floor(totalCards * penetration);
  const isPastCutCard = cardsDealt >= cutCardTriggerCards;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-xs shadow-lg flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Layers className="w-4 h-4" />
          <span>Zapato ({decksCount} barajas)</span>
        </div>
        {canShuffle && onShuffle && (
          <button
            onClick={onShuffle}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
            title="Barajar el zapato"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Barajar</span>
          </button>
        )}
      </div>

      {/* Progress & Cut Card bar */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Repartidas: {cardsDealt} ({dealtDecks} barajas)</span>
          <span>Restan: {remainingCards} ({remainingDecks} barajas)</span>
        </div>
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          {/* Dealt cards progress */}
          <div
            className={`h-full transition-all duration-300 ${
              isPastCutCard ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${dealtPercentage}%` }}
          />

          {/* Red Cut Card line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-sm z-10"
            style={{ left: `${penetration * 100}%` }}
            title={`Tarjeta de corte en ${penetration * 100}%`}
          />
        </div>

        {isPastCutCard && (
          <p className="text-[11px] text-amber-400 font-medium mt-1 animate-pulse">
            ⚠️ Tarjeta de corte alcanzada. Se barajará al finalizar la ronda.
          </p>
        )}
      </div>

      {/* Visual trays preview */}
      <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="block text-slate-500">Penetración</span>
          <span className="font-mono font-bold text-slate-200">{dealtPercentage}% / {Math.round(penetration * 100)}%</span>
        </div>
        <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="block text-slate-500">Divisor Conteo Real</span>
          <span className="font-mono font-bold text-amber-400">÷ {remainingDecks}</span>
        </div>
      </div>
    </div>
  );
};
