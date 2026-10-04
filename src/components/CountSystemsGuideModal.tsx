import React from 'react';
import { X, BookOpen, Check, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { COUNTING_SYSTEMS } from '../utils/countingSystems';

interface CountSystemsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CountSystemsGuideModal: React.FC<CountSystemsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl flex flex-col relative text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Guía Maestra: Cómo Contar Cartas en Blackjack</h3>
              <p className="text-xs text-slate-400">
                Fundamentos matemáticos, sistemas de conteo y técnicas de casino
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Core Principle */}
          <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>1. El Principio Matemático: ¿Por qué funciona el conteo?</span>
            </h4>
            <p>
              A diferencia de la ruleta donde cada giro es independiente, en el Blackjack{' '}
              <strong>las cartas repartidas no regresan a la baraja hasta el barajado</strong>.
              Esto significa que el mazo tiene memoria.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <span className="font-bold text-emerald-300 block mb-1">
                  Cuando la baraja es RICA en cartas altas (10, J, Q, K, A):
                </span>
                <ul className="text-xs space-y-1 list-disc list-inside text-slate-300">
                  <li>Más Blackjacks (que te pagan 3 a 2, mientras al crupier solo 1 a 1).</li>
                  <li>El crupier se pasa mucho más seguido (obligado a pedir en 12-16).</li>
                  <li>Tus jugadas de Doblar (Double) rinden significativamente mejor.</li>
                  <li><strong>El jugador tiene la ventaja matemática (hasta +2% o más).</strong></li>
                </ul>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                <span className="font-bold text-rose-300 block mb-1">
                  Cuando la baraja es RICA en cartas bajas (2, 3, 4, 5, 6):
                </span>
                <ul className="text-xs space-y-1 list-disc list-inside text-slate-300">
                  <li>El crupier rara vez se pasa (sus manos duras se salvan con cartas bajas).</li>
                  <li>Menor probabilidad de recibir Blackjacks.</li>
                  <li><strong>La casa incrementa su ventaja sobre el jugador.</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Running Count vs True Count */}
          <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-base font-black text-sky-400 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span>2. Conteo Corriente (Running Count) vs Conteo Real (True Count)</span>
            </h4>
            <p>
              No necesitas ser un genio matemático que recuerde 312 cartas. Simplemente asignas una etiqueta
              numérica (+1, 0, -1) a cada carta según sale a la mesa:
            </p>
            <div className="grid grid-cols-3 gap-3 text-center py-1">
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
                <span className="text-2xl font-black text-emerald-400 block font-mono">+1</span>
                <span className="text-xs text-slate-300 font-semibold">Cartas 2, 3, 4, 5, 6</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Al salir, benefician al jugador</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <span className="text-2xl font-black text-slate-300 block font-mono">0</span>
                <span className="text-xs text-slate-300 font-semibold">Cartas 7, 8, 9</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Cartas neutrales</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40">
                <span className="text-2xl font-black text-rose-400 block font-mono">-1</span>
                <span className="text-xs text-slate-300 font-semibold">10, J, Q, K y Ases</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Al salir, restan ventaja</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
              <span className="font-bold text-amber-300 block text-xs uppercase mb-1">
                La Fórmula del Conteo Real (True Count):
              </span>
              <div className="font-mono text-center py-2 text-base text-white bg-slate-950 rounded-lg border border-slate-800 font-bold">
                Conteo Real (TC) = Conteo Corriente (RC) ÷ Barajas Restantes en el Zapato
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ejemplo: Si tu Conteo Corriente es <strong>+6</strong> y quedan aproximadamente{' '}
                <strong>2 barajas</strong> en el zapato, el Conteo Real es <strong>+6 ÷ 2 = +3</strong>.
              </p>
            </div>
          </div>

          {/* Section 3: The Secret Pro Technique: Pair Cancellation */}
          <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-base font-black text-emerald-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>3. El Truco de los Profesionales: Cancelación de Parejas</span>
            </h4>
            <p>
              En una mesa de casino, el crupier reparte dos cartas a cada jugador. Los contadores expertos
              no suman carta por carta individualmente. En su lugar,{' '}
              <strong>buscan parejas que se cancelan entre sí</strong>:
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 font-mono">
                [ Rey (-1) ] + [ 4 (+1) ] = <strong className="text-amber-400">0 (Se cancelan)</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 font-mono">
                [ 10 (-1) ] + [ 5 (+1) ] = <strong className="text-amber-400">0 (Se cancelan)</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 font-mono">
                [ 5 (+1) ] + [ 6 (+1) ] = <strong className="text-emerald-400">+2</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 font-mono">
                [ As (-1) ] + [ J (-1) ] = <strong className="text-rose-400">-2</strong>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              ¡Practica esta técnica en nuestro <strong>Entrenador Rápido (Modo Parejas)</strong>!
            </p>
          </div>

          {/* Section 4: Counting Systems Overview */}
          <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-base font-black text-purple-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>4. Sistemas de Conteo Soportados</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(COUNTING_SYSTEMS).map((sys) => (
                <div key={sys.name} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{sys.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {sys.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{sys.description}</p>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{sys.isBalanced ? 'Sistema Balanceado (Requiere TC)' : 'Sistema Desbalanceado (Solo RC)'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
