import { useState, useEffect } from 'react';
import { TableRules, HandOutcome } from './types/blackjack';
import { PlayerStats, DrillStats } from './types/stats';
import { Navbar, ActiveTab } from './components/Navbar';
import { BlackjackTable } from './components/BlackjackTable';
import { SpeedCountTrainer } from './components/SpeedCountTrainer';
import { StrategyTrainer } from './components/StrategyTrainer';
import { StatsBar } from './components/StatsBar';
import { StrategyChartModal } from './components/StrategyChartModal';
import { CountSystemsGuideModal } from './components/CountSystemsGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/sound';

const DEFAULT_RULES: TableRules = {
  decksCount: 6,
  dealerHitsSoft17: false, // S17 standard
  blackjackPayoutRatio: 1.5, // 3:2
  allowSurrender: true,
  allowDoubleAfterSplit: true,
  penetration: 0.75,
  minBet: 5,
  maxBet: 1000,
  countingSystem: 'hilo',
  quizFrequency: 'every_3_rounds',
};

const DEFAULT_PLAYER_STATS: PlayerStats = {
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  handsPushed: 0,
  blackjacks: 0,
  totalWon: 0,
  totalLost: 0,
  netProfit: 0,
  maxBankroll: 1000,
  quizzesTaken: 0,
  quizzesCorrect: 0,
  strategyDecisionsTaken: 0,
  strategyCorrect: 0,
};

const DEFAULT_DRILL_STATS: DrillStats = {
  cardsCountedTotal: 0,
  speedDrillRounds: 0,
  speedDrillCorrect: 0,
  averageResponseTimeMs: 0,
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');

  // Persistence in localStorage
  const [bankroll, setBankroll] = useState<number>(() => {
    const saved = localStorage.getItem('bj_bankroll');
    return saved ? parseInt(saved, 10) : 1000;
  });

  const [rules, setRules] = useState<TableRules>(() => {
    const saved = localStorage.getItem('bj_rules');
    return saved ? { ...DEFAULT_RULES, ...JSON.parse(saved) } : DEFAULT_RULES;
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('bj_player_stats');
    return saved ? { ...DEFAULT_PLAYER_STATS, ...JSON.parse(saved) } : DEFAULT_PLAYER_STATS;
  });

  const [drillStats, setDrillStats] = useState<DrillStats>(() => {
    const saved = localStorage.getItem('bj_drill_stats');
    return saved ? { ...DEFAULT_DRILL_STATS, ...JSON.parse(saved) } : DEFAULT_DRILL_STATS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('bj_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Modal open states
  const [isChartsOpen, setIsChartsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bj_bankroll', bankroll.toString());
  }, [bankroll]);

  useEffect(() => {
    localStorage.setItem('bj_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('bj_player_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem('bj_drill_stats', JSON.stringify(drillStats));
  }, [drillStats]);

  useEffect(() => {
    localStorage.setItem('bj_sound', soundEnabled.toString());
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleUpdateBankroll = (delta: number) => {
    setBankroll((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > playerStats.maxBankroll) {
        setPlayerStats((ps) => ({ ...ps, maxBankroll: next }));
      }
      return next;
    });
  };

  const handleAddFunds = () => {
    handleUpdateBankroll(500);
    soundManager.playChip();
  };

  const handleRecordHandResult = (outcome: HandOutcome, netWin: number) => {
    setPlayerStats((prev) => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      handsWon: prev.handsWon + (outcome === 'win' || outcome === 'blackjack' ? 1 : 0),
      handsLost: prev.handsLost + (outcome === 'lose' || outcome === 'surrendered' ? 1 : 0),
      handsPushed: prev.handsPushed + (outcome === 'push' ? 1 : 0),
      blackjacks: prev.blackjacks + (outcome === 'blackjack' ? 1 : 0),
      netProfit: prev.netProfit + netWin,
      totalWon: netWin > 0 ? prev.totalWon + netWin : prev.totalWon,
      totalLost: netWin < 0 ? prev.totalLost + Math.abs(netWin) : prev.totalLost,
    }));
  };

  const handleRecordQuiz = (isCorrect: boolean) => {
    setPlayerStats((prev) => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1,
      quizzesCorrect: prev.quizzesCorrect + (isCorrect ? 1 : 0),
    }));
  };

  const handleRecordDrill = (cardsCounted: number, isCorrect: boolean) => {
    setDrillStats((prev) => ({
      ...prev,
      cardsCountedTotal: prev.cardsCountedTotal + cardsCounted,
      speedDrillRounds: prev.speedDrillRounds + 1,
      speedDrillCorrect: prev.speedDrillCorrect + (isCorrect ? 1 : 0),
    }));
  };

  const handleRecordStrategyDecision = (isCorrect: boolean) => {
    setPlayerStats((prev) => ({
      ...prev,
      strategyDecisionsTaken: prev.strategyDecisionsTaken + 1,
      strategyCorrect: prev.strategyCorrect + (isCorrect ? 1 : 0),
    }));
  };

  const handleResetBankroll = () => {
    setBankroll(1000);
  };

  const handleResetStats = () => {
    setPlayerStats(DEFAULT_PLAYER_STATS);
    setDrillStats(DEFAULT_DRILL_STATS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        bankroll={bankroll}
        onAddFunds={handleAddFunds}
        onOpenCharts={() => setIsChartsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Tab View */}
      <main className="flex-1 p-4 sm:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {activeTab === 'table' && (
          <BlackjackTable
            rules={rules}
            bankroll={bankroll}
            onUpdateBankroll={handleUpdateBankroll}
            onRecordHandResult={handleRecordHandResult}
            onRecordQuiz={handleRecordQuiz}
          />
        )}

        {activeTab === 'speed' && (
          <SpeedCountTrainer
            systemName={rules.countingSystem}
            onRecordDrill={handleRecordDrill}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyTrainer
            rules={rules}
            onRecordDecision={handleRecordStrategyDecision}
          />
        )}

        {/* Global Statistics Bar */}
        <StatsBar playerStats={playerStats} drillStats={drillStats} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Blackjack & Card Counting Master — Desarrollado para práctica y educación matemática.
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-amber-400 transition underline"
            >
              Cómo contar cartas
            </button>
            <button
              onClick={() => setIsChartsOpen(true)}
              className="hover:text-amber-400 transition underline"
            >
              Matriz de Estrategia Básica
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StrategyChartModal
        isOpen={isChartsOpen}
        onClose={() => setIsChartsOpen(false)}
      />

      <CountSystemsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rules={rules}
        onUpdateRules={(newRules) => setRules((prev) => ({ ...prev, ...newRules }))}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onResetBankroll={handleResetBankroll}
        onResetStats={handleResetStats}
      />
    </div>
  );
}

export default App;
