import React from 'react';
import { X, Settings, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { TableRules } from '../types/blackjack';
import { CountingSystemName } from '../types/cards';
import { COUNTING_SYSTEMS } from '../utils/countingSystems';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: TableRules;
  onUpdateRules: (newRules: Partial<TableRules>) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetBankroll: () => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateRules,
  soundEnabled,
  onToggleSound,
  onResetBankroll,
  onResetStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Ajustes de la Mesa y Entrenamiento</h3>
              <p className="text-xs text-slate-400">Personaliza las reglas de casino y el sistema de conteo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          {/* Counting System selection */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <label className="block font-bold text-slate-200 mb-2">Sistema de Conteo</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(COUNTING_SYSTEMS).map((sys) => (
                <button
                  key={sys.name}
                  type="button"
                  onClick={() => onUpdateRules({ countingSystem: sys.name as CountingSystemName })}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    rules.countingSystem === sys.name
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{sys.label}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">{sys.difficulty}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Decks */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-200">Barajas en el Zapato (Shoe)</label>
              <span className="text-amber-400 font-mono font-bold">{rules.decksCount} barajas</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 4, 6, 8].map((decks) => (
                <button
                  key={decks}
                  type="button"
                  onClick={() => onUpdateRules({ decksCount: decks })}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                    rules.decksCount === decks
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {decks} {decks === 1 ? 'm' : 'm'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              * El estándar en la mayoría de casinos modernos es 6 u 8 barajas.
            </p>
          </div>

          {/* Dealer Rules & Payouts */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <label className="block font-bold text-slate-200">Reglas de Casino</label>

            {/* S17 vs H17 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-semibold text-slate-300">Regla del 17 del Crupier</span>
                <span className="text-[10px] text-slate-400">
                  {rules.dealerHitsSoft17 ? 'H17 (Pide en 17 suave)' : 'S17 (Se planta en 17 suave - más favorable)'}
                </span>
              </div>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateRules({ dealerHitsSoft17: false })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !rules.dealerHitsSoft17 ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  S17
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateRules({ dealerHitsSoft17: true })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    rules.dealerHitsSoft17 ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  H17
                </button>
              </div>
            </div>

            {/* Blackjack Payout */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <div>
                <span className="block font-semibold text-slate-300">Pago por Blackjack</span>
                <span className="text-[10px] text-slate-400">
                  {rules.blackjackPayoutRatio === 1.5 ? '3 a 2 (Estándar generoso)' : '6 a 5 (Peor para el jugador)'}
                </span>
              </div>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateRules({ blackjackPayoutRatio: 1.5 })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    rules.blackjackPayoutRatio === 1.5 ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  3:2
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateRules({ blackjackPayoutRatio: 1.2 })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    rules.blackjackPayoutRatio === 1.2 ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  6:5
                </button>
              </div>
            </div>

            {/* Late Surrender */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <div>
                <span className="block font-semibold text-slate-300">Rendición Tardía (Late Surrender)</span>
                <span className="text-[10px] text-slate-400">Permite recuperar 50% de la apuesta</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateRules({ allowSurrender: !rules.allowSurrender })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  rules.allowSurrender ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {rules.allowSurrender ? 'Sí' : 'No'}
              </button>
            </div>
          </div>

          {/* Test & Quizzes Frequency */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <label className="block font-bold text-slate-200 mb-2">
              Frecuencia de Exámenes de Conteo Sorpresa
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'off', label: 'Desactivado' },
                { id: 'every_round', label: 'Cada Mano' },
                { id: 'every_3_rounds', label: 'Cada 3 Manos' },
                { id: 'random', label: 'Aleatorio' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateRules({ quizFrequency: opt.id as TableRules['quizFrequency'] })}
                  className={`p-2 rounded-xl text-xs font-semibold border transition ${
                    rules.quizFrequency === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Reset Bankroll */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => {
                onToggleSound();
                soundManager.enabled = !soundEnabled;
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-2 transition"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Sonido Activado</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span>Sonido Silenciado</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Reiniciar saldo a $1,000?')) {
                  onResetBankroll();
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-800 text-rose-300 font-bold flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Saldo</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Reiniciar todas las estadísticas y registros?')) {
                  onResetStats();
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Estadísticas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
