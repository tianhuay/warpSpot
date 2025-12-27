import { useEffect, useCallback, useRef, useState } from 'react';
import GameGrid from './components/GameGrid';
import { generateBaseColor, generateRegularPolygon, distortPolygon, getGridSize } from './utils/gameLogic';
import { ensureSndLoaded, uiSfx } from './utils/snd';

const STORAGE_KEYS = {
  bestLevel: 'shapeSpotting.bestLevel',
  bestScore: 'shapeSpotting.bestScore',
};

const TOTAL_TIME_SECONDS = 40;
const TOTAL_TIME_MS = TOTAL_TIME_SECONDS * 1000;

function readNumber(key, fallback = 0) {
  const raw = localStorage.getItem(key);
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [slowMo, setSlowMo] = useState(false);

  const [gridData, setGridData] = useState({ shapes: [], gridSize: 2, targetIndex: 0, roundId: 0 });
  const [shake, setShake] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  const [feedback, setFeedback] = useState(null); // { correctIndex?: number, wrongIndex?: number }
  const [pointsPop, setPointsPop] = useState(null); // { id: number, text: string }

  const [runSummary, setRunSummary] = useState(null);

  const [bestLevel, setBestLevel] = useState(() => readNumber(STORAGE_KEYS.bestLevel, 1));
  const [bestScore, setBestScore] = useState(() => readNumber(STORAGE_KEYS.bestScore, 0));

  const endSequenceActiveRef = useRef(false);
  const cautionIntervalRef = useRef(null);
  const targetIndexRef = useRef(0);
  const endTimeRef = useRef(0);
  useEffect(() => {
    targetIndexRef.current = gridData.targetIndex ?? 0;
  }, [gridData.targetIndex]);

  useEffect(() => {
    if (!pointsPop) return;
    const t = window.setTimeout(() => setPointsPop(null), 900);
    return () => window.clearTimeout(t);
  }, [pointsPop]);

  const lastSidesRef = useRef(null);

  useEffect(() => {
    ensureSndLoaded();

    // Unlock WebAudio as early as possible (snd-lib initializes AudioContext on click by default).
    // This makes hover sounds more reliable across browsers.
    const unlock = () => {
      uiSfx.tap({ volume: 0.0001 });
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const generateLevel = useCallback((currentLevel) => {
    const gridSize = getGridSize(currentLevel);
    const totalShapes = gridSize * gridSize;

    // 1. Base Color (Uniform)
    const baseColor = generateBaseColor();

    // 2. Shape Type (Random sides 3-8) — but avoid repeating the same shape consecutively.
    let sides = Math.floor(Math.random() * 6) + 3;
    let guard = 0;
    while (sides === lastSidesRef.current && guard < 10) {
      sides = Math.floor(Math.random() * 6) + 3;
      guard += 1;
    }
    lastSidesRef.current = sides;
    const basePoints = generateRegularPolygon(sides);

    // 3. Target Shape (Distorted)
    // Keep early game simpler: only start distorting multiple vertices after level 15.
    const distortVertices = currentLevel >= 16 ? 2 : 1;
    const targetPoints = distortPolygon(basePoints, currentLevel, distortVertices);

    // Pick target index
    const targetIndex = Math.floor(Math.random() * totalShapes);

    const shapes = Array.from({ length: totalShapes }, (_, i) => ({
      color: baseColor,
      points: i === targetIndex ? targetPoints : basePoints,
      isTarget: i === targetIndex,
    }));

    setGridData(prev => ({
      shapes,
      gridSize,
      targetIndex,
      roundId: (prev?.roundId ?? 0) + 1,
    }));
  }, []);

  const endGame = useCallback((reason = 'ended') => {
    setIsPlaying(false);
    setInputLocked(false);
    setFeedback(null);
    setSlowMo(false);
    endSequenceActiveRef.current = false;

    const accuracy = attempts > 0 ? hits / attempts : 0;
    const prevBestScore = readNumber(STORAGE_KEYS.bestScore, 0);
    const prevBestLevel = readNumber(STORAGE_KEYS.bestLevel, 1);

    const nextBestScore = Math.max(prevBestScore, score);
    const nextBestLevel = Math.max(prevBestLevel, level);

    localStorage.setItem(STORAGE_KEYS.bestScore, String(nextBestScore));
    localStorage.setItem(STORAGE_KEYS.bestLevel, String(nextBestLevel));
    setBestScore(nextBestScore);
    setBestLevel(nextBestLevel);

    setRunSummary({
      reason,
      score,
      level,
      attempts,
      hits,
      misses,
      accuracy,
      bestScore: nextBestScore,
      improvedBy: Math.max(0, score - prevBestScore),
      bestLevel: nextBestLevel,
      improvedLevelBy: Math.max(0, level - prevBestLevel),
    });

    // Result panel reveal
    uiSfx.caution({ volume: 0.9 });
  }, [attempts, hits, level, misses, score]);

  const beginTimeoutEnd = useCallback(() => {
    if (endSequenceActiveRef.current) return;
    endSequenceActiveRef.current = true;

    // Stop any ongoing countdown sounds immediately at 0.
    if (cautionIntervalRef.current) {
      window.clearInterval(cautionIntervalRef.current);
      cautionIntervalRef.current = null;
    }
    uiSfx.stopCountdown();

    // Briefly reveal the correct shape before showing results (same idea as wrong click).
    // Timer is already 0; we only delay the results panel.
    setTimeLeft(0);
    setInputLocked(true);
    setFeedback({ correctIndex: targetIndexRef.current });
    window.setTimeout(() => {
      // Sound when revealing the result panel after timeout.
      uiSfx.notification({ volume: 0.9 });
      endGame('timeout');
    }, 1200);
  }, [endGame]);

  const startGame = () => {
    // Celebration for Start Game / Play Again
    uiSfx.celebration({ volume: 0.95 });

    if (cautionIntervalRef.current) {
      window.clearInterval(cautionIntervalRef.current);
      cautionIntervalRef.current = null;
    }
    setScore(0);
    setLevel(1);
    setAttempts(0);
    setHits(0);
    setMisses(0);
    setPointsPop(null);
    setRunSummary(null);
    setInputLocked(false);
    setFeedback(null);
    setSlowMo(false);
    endSequenceActiveRef.current = false;

    endTimeRef.current = Date.now() + TOTAL_TIME_MS;
    setTimeLeft(TOTAL_TIME_SECONDS);
    setIsPlaying(true);
    generateLevel(1);
  };

  const handleShapeClick = (index, isTarget) => {
    if (!isPlaying || inputLocked) return;

    setAttempts(a => a + 1);

    if (isTarget) {
      uiSfx.notification({ volume: 0.95 });
      const nextLevel = level + 1;
      setHits(h => h + 1);
      setScore(s => s + 1);
      setPointsPop({ id: Date.now(), text: '+1' });

      // No time bonuses — total time is strictly capped.

      // Tiny slow-mo moment when time is low and you clutch a correct answer
      if (timeLeft <= 5) {
        setSlowMo(true);
        window.setTimeout(() => setSlowMo(false), 900);
      }

      setInputLocked(true);
      setFeedback({ correctIndex: index });
      window.setTimeout(() => {
        setLevel(nextLevel);
        generateLevel(nextLevel);
        setFeedback(null);
        setInputLocked(false);
      }, 220);
    } else {
      uiSfx.disabled({ volume: 0.95 });
      setShake(true);
      setMisses(m => m + 1);

      endSequenceActiveRef.current = true;
      setInputLocked(true);
      setFeedback({ wrongIndex: index, correctIndex: gridData.targetIndex });
      window.setTimeout(() => {
        setShake(false);
        endGame('wrong');
      }, 3000);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const remainingMs = endTimeRef.current - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeft(remainingSeconds);

      if (remainingMs <= 0 && !endSequenceActiveRef.current) {
        // Defer to avoid eslint react-hooks/set-state-in-effect
        window.setTimeout(() => beginTimeoutEnd(), 0);
      }
    };

    // Tick frequently so UI stays accurate even if the tab stutters.
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [beginTimeoutEnd, isPlaying]);

  useEffect(() => {
    // Repeat caution every second during the last 10 seconds.
    const inFinalCountdown = isPlaying && timeLeft > 0 && timeLeft <= 10;

    if (!inFinalCountdown) {
      if (cautionIntervalRef.current) {
        window.clearInterval(cautionIntervalRef.current);
        cautionIntervalRef.current = null;
      }
      return;
    }

    if (!cautionIntervalRef.current) {
      // Fire immediately on entering the last 10 seconds, then repeat.
      uiSfx.caution({ volume: 0.9 });
      cautionIntervalRef.current = window.setInterval(() => {
        uiSfx.caution({ volume: 0.9 });
      }, 1000);
    }

    return () => {
      if (cautionIntervalRef.current) {
        window.clearInterval(cautionIntervalRef.current);
        cautionIntervalRef.current = null;
      }
    };
  }, [isPlaying, timeLeft]);

  return (
    <div className={`app-shell ${shake ? 'shake' : ''} ${slowMo ? 'slowmo' : ''}`}>
      <header className="hud">
        <div className="hud-title">WarpSpot</div>

        <div className="stats-bar hud-stats" aria-label="game stats">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value" style={{ color: timeLeft <= 10 ? '#ef4444' : 'inherit' }}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </header>

      {pointsPop && (
        <div key={pointsPop.id} className="points-pop" aria-live="polite">
          {pointsPop.text}
        </div>
      )}

      <main className="stage">
        {isPlaying ? (
          <GameGrid
            shapes={gridData.shapes}
            gridSize={gridData.gridSize}
            onShapeClick={handleShapeClick}
            feedback={feedback}
            inputLocked={inputLocked}
            roundId={gridData.roundId}
          />
        ) : (
          <div className="menu-overlay fade-in">
            {(runSummary || score > 0) && <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Level Reached</h2>}

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--accent-color)' }}>{level}</div>
            </div>

            <p style={{ color: 'var(--text-muted)', marginTop: '-1.25rem', marginBottom: '2rem' }}>
              Best Level: <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{bestLevel}</span>
            </p>
            <button
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') uiSfx.tap({ volume: 0.55 });
              }}
              onClick={startGame}
            >
              {score > 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

