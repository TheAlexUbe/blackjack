import React from 'react';
import { Card, CountingSystemName } from '../types/cards';
import { getCardCountValue } from '../utils/countingSystems';

interface CardViewProps {
  card: Card;
  showCountBadge?: boolean;
  systemName?: CountingSystemName;
  isDealerHidden?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  showCountBadge = false,
  systemName = 'hilo',
  isDealerHidden = false,
  className = '',
  size = 'md',
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const suitSymbols: Record<string, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  const countValue = getCardCountValue(card, systemName);

  const sizeClasses = {
    sm: 'w-14 h-20 text-xs rounded-md shadow-md',
    md: 'w-20 h-28 text-sm rounded-lg shadow-lg',
    lg: 'w-24 h-36 text-base rounded-xl shadow-xl',
  };

  if (!card.isFaceUp || isDealerHidden) {
    // Card back
    return (
      <div
        className={`relative ${sizeClasses[size]} bg-linear-to-br from-blue-900 via-indigo-950 to-blue-950 border-2 border-amber-300/40 select-none flex items-center justify-center p-1.5 transition-transform duration-300 hover:-translate-y-1 ${className}`}
      >
        <div className="w-full h-full rounded border border-amber-300/30 flex items-center justify-center bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]">
          <div className="w-8 h-8 rounded-full border border-amber-400/50 flex items-center justify-center bg-blue-950/80 shadow-inner">
            <span className="text-amber-400 font-serif font-black text-xs">♠</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-white border border-slate-300 select-none flex flex-col justify-between p-1.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl animate-deal ${className}`}
    >
      {/* Top Left Corner */}
      <div className="flex flex-col items-center leading-none w-4">
        <span className={`font-bold font-mono ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.rank}
        </span>
        <span className={`text-xs ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Center artwork */}
      <div className="self-center flex flex-col items-center justify-center my-auto">
        <span
          className={`font-serif leading-none select-none ${
            size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl'
          } ${isRed ? 'text-rose-600' : 'text-slate-900'}`}
        >
          {suitSymbols[card.suit]}
        </span>
        {['J', 'Q', 'K'].includes(card.rank) && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            {card.rank === 'J' ? 'Jack' : card.rank === 'Q' ? 'Queen' : 'King'}
          </span>
        )}
      </div>

      {/* Bottom Right Corner (inverted) */}
      <div className="flex flex-col items-center leading-none w-4 self-end rotate-180">
        <span className={`font-bold font-mono ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.rank}
        </span>
        <span className={`text-xs ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Optional Card Count Value Badge */}
      {showCountBadge && (
        <div
          className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-sm ${
            countValue > 0
              ? 'bg-emerald-500 text-white border-emerald-300'
              : countValue < 0
              ? 'bg-rose-500 text-white border-rose-300'
              : 'bg-slate-500 text-white border-slate-300'
          }`}
          title={`Valor de conteo: ${countValue > 0 ? `+${countValue}` : countValue}`}
        >
          {countValue > 0 ? `+${countValue}` : countValue}
        </div>
      )}
    </div>
  );
};
