import React from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Table,
  BookOpen,
  Settings,
  Volume2,
  VolumeX,
  Wallet,
  PlusCircle,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

export type ActiveTab = 'table' | 'speed' | 'strategy';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  bankroll: number;
  onAddFunds: () => void;
  onOpenCharts: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  bankroll,
  onAddFunds,
  onOpenCharts,
  onOpenGuide,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <span className="font-serif font-black text-xl">♠</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
              Blackjack <span className="text-amber-400">Card Counting</span> Master
            </h1>
            <p className="text-[11px] text-slate-400">
              Simulador de Casino y Entrenador de Conteo de Cartas
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onChangeTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'table'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mesa de Blackjack</span>
          </button>

          <button
            onClick={() => onChangeTab('speed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'speed'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Velocidad de Conteo</span>
          </button>

          <button
            onClick={() => onChangeTab('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'strategy'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Estrategia y Desviaciones</span>
          </button>
        </div>

        {/* Bankroll and Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Bankroll Chip */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-black text-amber-300">
              ${bankroll.toLocaleString()}
            </span>
            {bankroll < 50 && (
              <button
                onClick={onAddFunds}
                className="text-emerald-400 hover:text-emerald-300 ml-1 transition"
                title="Recargar $500 fichas"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Charts Modal Button */}
          <button
            onClick={onOpenCharts}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Ver Tablas de Estrategia Básica y Desviaciones"
          >
            <Table className="w-4 h-4" />
          </button>

          {/* Guide Modal Button */}
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Guía de Conteo de Cartas"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.enabled = !soundEnabled;
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Ajustes de Mesa y Conteo"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
