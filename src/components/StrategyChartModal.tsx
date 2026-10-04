import React, { useState } from 'react';
import { X, Table, ShieldAlert } from 'lucide-react';
import { ILLUSTRIOUS_18 } from '../utils/illustrious18';

interface StrategyChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyChartModal: React.FC<StrategyChartModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'illustrious18'>('matrix');

  if (!isOpen) return null;

  const dealerUpcards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

  // Hard totals table
  const hardRows = [
    { label: '17+', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { label: '16', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'Rh', 'Rh', 'Rh'] },
    { label: '15', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'Rh', 'H'] },
    { label: '14', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { label: '13', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { label: '12', actions: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
    { label: '11', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'] },
    { label: '10', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
    { label: '9', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { label: '5-8', actions: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'] },
  ];

  // Soft totals table
  const softRows = [
    { label: 'A,9 (20)', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { label: 'A,8 (19)', actions: ['S', 'S', 'S', 'S', 'D', 'S', 'S', 'S', 'S', 'S'] },
    { label: 'A,7 (18)', actions: ['D', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'] },
    { label: 'A,6 (17)', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { label: 'A,5 (16)', actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { label: 'A,4 (15)', actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { label: 'A,3 (14)', actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
    { label: 'A,2 (13)', actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
  ];

  // Pairs table
  const pairRows = [
    { label: 'A,A', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { label: '10,10', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    { label: '9,9', actions: ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'] },
    { label: '8,8', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { label: '7,7', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
    { label: '6,6', actions: ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
    { label: '5,5', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
    { label: '4,4', actions: ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
    { label: '3,3', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
    { label: '2,2', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
  ];

  const getActionClass = (act: string) => {
    switch (act) {
      case 'H':
        return 'bg-emerald-600/80 text-white font-bold';
      case 'S':
        return 'bg-rose-600/80 text-white font-bold';
      case 'D':
        return 'bg-blue-600/80 text-white font-bold';
      case 'P':
        return 'bg-amber-500/80 text-slate-950 font-black';
      case 'Rh':
        return 'bg-purple-600/80 text-white font-bold';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col relative text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Tablas de Decisión y Desviaciones</h3>
              <p className="text-xs text-slate-400">
                Guía matemática de Blackjack y las 18 Desviaciones Ilustres
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Matriz de Estrategia Básica
          </button>
          <button
            onClick={() => setActiveTab('illustrious18')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'illustrious18'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Las 18 Ilustres (Illustrious 18)</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {activeTab === 'matrix' ? (
            <div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 text-[11px] mb-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-400 mr-2 self-center">Leyenda:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-600/80 text-white font-bold">
                  H = Pedir (Hit)
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-600/80 text-white font-bold">
                  S = Plantarse (Stand)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-600/80 text-white font-bold">
                  D = Doblar (Double)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 font-black">
                  P = Dividir (Split)
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-600/80 text-white font-bold">
                  Rh = Rendirse o Pedir
                </span>
              </div>

              {/* Strategy Tables */}
              <div className="space-y-6">
                {/* Hard totals */}
                <div>
                  <h4 className="text-sm font-bold text-amber-400 mb-2">Totales Duros (Hard)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300">
                          <th className="p-1.5 text-left pl-3">Tu Mano</th>
                          {dealerUpcards.map((u) => (
                            <th key={u} className="p-1.5 font-mono">{u}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hardRows.map((r, i) => (
                          <tr key={i} className="border-t border-slate-800/80">
                            <td className="p-1.5 font-bold text-left pl-3 text-slate-300 bg-slate-950/40 font-mono">
                              {r.label}
                            </td>
                            {r.actions.map((act, j) => (
                              <td key={j} className="p-1 font-mono">
                                <span className={`inline-block w-6 py-0.5 rounded ${getActionClass(act)}`}>
                                  {act}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Soft totals */}
                <div>
                  <h4 className="text-sm font-bold text-sky-400 mb-2">Totales Suaves (Soft - con As)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300">
                          <th className="p-1.5 text-left pl-3">Tu Mano</th>
                          {dealerUpcards.map((u) => (
                            <th key={u} className="p-1.5 font-mono">{u}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {softRows.map((r, i) => (
                          <tr key={i} className="border-t border-slate-800/80">
                            <td className="p-1.5 font-bold text-left pl-3 text-slate-300 bg-slate-950/40 font-mono">
                              {r.label}
                            </td>
                            {r.actions.map((act, j) => (
                              <td key={j} className="p-1 font-mono">
                                <span className={`inline-block w-6 py-0.5 rounded ${getActionClass(act)}`}>
                                  {act}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pairs */}
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-2">Pares (Splits)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300">
                          <th className="p-1.5 text-left pl-3">Tu Par</th>
                          {dealerUpcards.map((u) => (
                            <th key={u} className="p-1.5 font-mono">{u}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pairRows.map((r, i) => (
                          <tr key={i} className="border-t border-slate-800/80">
                            <td className="p-1.5 font-bold text-left pl-3 text-slate-300 bg-slate-950/40 font-mono">
                              {r.label}
                            </td>
                            {r.actions.map((act, j) => (
                              <td key={j} className="p-1 font-mono">
                                <span className={`inline-block w-6 py-0.5 rounded ${getActionClass(act)}`}>
                                  {act}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Illustrious 18 */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 leading-relaxed">
                <strong>¿Qué son las 18 Ilustres?</strong> Fueron calculadas por Don Schlesinger.
                Aunque existen cientos de desviaciones posibles, estas 18 jugadas capturan más del <strong>80% del beneficio</strong> de desviarse de la estrategia básica según el Conteo Real (True Count).
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-300">
                      <th className="p-2.5 rounded-l-lg">#</th>
                      <th className="p-2.5">Jugada</th>
                      <th className="p-2.5">Crupier</th>
                      <th className="p-2.5">Índice True Count</th>
                      <th className="p-2.5">Acción Normal</th>
                      <th className="p-2.5">Desviación</th>
                      <th className="p-2.5 rounded-r-lg">Importancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ILLUSTRIOUS_18.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-t border-slate-800/60 hover:bg-slate-800/40 transition"
                      >
                        <td className="p-2.5 font-mono text-slate-400 font-bold">{rule.priority}</td>
                        <td className="p-2.5 font-semibold text-white">{rule.name}</td>
                        <td className="p-2.5 font-mono text-slate-300">{rule.dealerCardDesc}</td>
                        <td className="p-2.5 font-mono font-bold text-amber-400">
                          TC {rule.direction} {rule.index > 0 ? `+${rule.index}` : rule.index}
                        </td>
                        <td className="p-2.5 text-slate-400">{rule.normalAction}</td>
                        <td className="p-2.5 font-bold text-emerald-400">{rule.deviationAction}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.importance === 'Crítica'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : rule.importance === 'Alta'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {rule.importance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
