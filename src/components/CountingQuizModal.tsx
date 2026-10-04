import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, X } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { CountingSystemName } from '../types/cards';
import { COUNTING_SYSTEMS } from '../utils/countingSystems';

interface CountingQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  actualRunningCount: number;
  actualTrueCount: number;
  remainingCards: number;
  systemName: CountingSystemName;
  onRecordResult: (isCorrect: boolean) => void;
}

export const CountingQuizModal: React.FC<CountingQuizModalProps> = ({
  isOpen,
  onClose,
  actualRunningCount,
  actualTrueCount,
  remainingCards,
  systemName,
  onRecordResult,
}) => {
  const [userRC, setUserRC] = useState<number>(0);
  const [userTC, setUserTC] = useState<number>(0);
  const [evaluated, setEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen) return null;

  const system = COUNTING_SYSTEMS[systemName];
  const remainingDecks = Math.max(0.25, remainingCards / 52);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rcDiff = Math.abs(userRC - actualRunningCount);
    // Allow slight tolerance of ±0.5 for True Count mental division
    const tcDiff = Math.abs(userTC - actualTrueCount);

    const passed = system.isBalanced ? rcDiff === 0 && tcDiff <= 0.5 : rcDiff === 0;

    setIsCorrect(passed);
    setEvaluated(true);
    if (passed) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
    onRecordResult(passed);
  };

  const handleNext = () => {
    setEvaluated(false);
    setUserRC(0);
    setUserTC(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={handleNext}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Comprobación de Conteo</h3>
            <p className="text-xs text-slate-400">
              Pon a prueba tu memoria de conteo en la mesa ({system.label})
            </p>
          </div>
        </div>

        {!evaluated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿Cuál es el Conteo Corriente (Running Count)?
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserRC((prev) => prev - 1)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={userRC}
                  onChange={(e) => setUserRC(parseInt(e.target.value, 10) || 0)}
                  className="flex-1 text-center font-mono font-bold text-xl py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setUserRC((prev) => prev + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {system.isBalanced && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    ¿Cuál es el Conteo Real (True Count)?
                  </label>
                  <span className="text-[11px] text-slate-500">
                    (~{remainingDecks.toFixed(1)} barajas en zapato)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserTC((prev) => prev - 1)}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    value={userTC}
                    onChange={(e) => setUserTC(parseFloat(e.target.value) || 0)}
                    className="flex-1 text-center font-mono font-bold text-xl py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setUserTC((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer mt-4"
            >
              Comprobar Respuesta
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {isCorrect ? '¡Excelente! Conteo correcto' : 'Conteo incorrecto'}
                </h4>
                <p className="text-xs mt-1 text-slate-300">
                  {isCorrect
                    ? 'Estás manteniendo un registro mental impecable del zapato.'
                    : 'No te preocupes, el conteo requiere práctica continua de concentración.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Tu respuesta:</span>
                <span className="font-mono font-bold">
                  RC: {userRC > 0 ? `+${userRC}` : userRC}
                  {system.isBalanced && ` | TC: ${userTC > 0 ? `+${userTC}` : userTC}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Valor real de la mesa:</span>
                <span className="font-mono font-bold text-amber-400">
                  RC: {actualRunningCount > 0 ? `+${actualRunningCount}` : actualRunningCount}
                  {system.isBalanced && ` | TC: ${actualTrueCount > 0 ? `+${actualTrueCount}` : actualTrueCount}`}
                </span>
              </div>
              {system.isBalanced && (
                <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  Cálculo del True Count: <br />
                  <span className="font-mono text-slate-300">
                    {actualRunningCount} (RC) ÷ {remainingDecks.toFixed(1)} (barajas restantes) = {actualTrueCount}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
            >
              Continuar la Partida
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
