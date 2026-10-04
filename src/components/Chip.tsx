import React from 'react';
import { soundManager } from '../utils/sound';

interface ChipProps {
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

export const Chip: React.FC<ChipProps> = ({
  value,
  onClick,
  disabled = false,
  size = 'md',
  count,
}) => {
  const getColors = (val: number) => {
    switch (val) {
      case 5:
        return {
          bg: 'bg-red-600',
          border: 'border-dashed border-red-300',
          ring: 'ring-red-400',
          text: 'text-white',
        };
      case 10:
        return {
          bg: 'bg-blue-600',
          border: 'border-dashed border-blue-200',
          ring: 'ring-blue-400',
          text: 'text-white',
        };
      case 25:
        return {
          bg: 'bg-emerald-600',
          border: 'border-dashed border-emerald-200',
          ring: 'ring-emerald-400',
          text: 'text-white',
        };
      case 50:
        return {
          bg: 'bg-amber-600',
          border: 'border-dashed border-amber-200',
          ring: 'ring-amber-400',
          text: 'text-white',
        };
      case 100:
        return {
          bg: 'bg-slate-900',
          border: 'border-dashed border-amber-400',
          ring: 'ring-amber-300',
          text: 'text-amber-300',
        };
      case 500:
        return {
          bg: 'bg-purple-800',
          border: 'border-dashed border-pink-300',
          ring: 'ring-pink-400',
          text: 'text-pink-200',
        };
      default:
        return {
          bg: 'bg-teal-700',
          border: 'border-dashed border-white',
          ring: 'ring-teal-400',
          text: 'text-white',
        };
    }
  };

  const colors = getColors(value);

  const sizeStyles = {
    sm: 'w-10 h-10 text-xs shadow-sm',
    md: 'w-14 h-14 text-sm shadow-md',
    lg: 'w-16 h-16 text-base shadow-lg',
  };

  const handleClick = () => {
    if (disabled) return;
    soundManager.playChip();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative rounded-full select-none cursor-pointer font-black transition-all transform active:scale-95 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center p-1 border-2 ${colors.bg} ${colors.border} ${sizeStyles[size]}`}
      title={`Ficha de $${value}`}
    >
      {/* Inner ring */}
      <div className="w-full h-full rounded-full border border-white/40 flex items-center justify-center shadow-inner">
        <span className={`font-mono font-extrabold ${colors.text}`}>${value}</span>
      </div>

      {count !== undefined && count > 1 && (
        <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full px-1.5 py-0.2 border border-slate-900 shadow">
          x{count}
        </span>
      )}
    </button>
  );
};
