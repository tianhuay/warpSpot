import { useState, useEffect, useCallback } from 'react';
import GameGrid from './components/GameGrid';
import { generateBaseColor, generateRegularPolygon, distortPolygon, getGridSize } from './utils/gameLogic';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gridData, setGridData] = useState({ shapes: [], gridSize: 2 });
  const [shake, setShake] = useState(false);

  const generateLevel = useCallback((currentLevel) => {
    const gridSize = getGridSize(currentLevel);
    const totalShapes = gridSize * gridSize;

    // 1. Base Color (Uniform)
    const baseColor = generateBaseColor();

    // 2. Shape Type (Random sides 3-8)
    const sides = Math.floor(Math.random() * 6) + 3;
    const basePoints = generateRegularPolygon(sides);

    // 3. Target Shape (Distorted)
    const targetPoints = distortPolygon(basePoints, currentLevel);

    // Pick target index
    const targetIndex = Math.floor(Math.random() * totalShapes);

    const shapes = Array.from({ length: totalShapes }, (_, i) => ({
      color: baseColor,
      points: i === targetIndex ? targetPoints : basePoints,
      isTarget: i === targetIndex
    }));

    setGridData({ shapes, gridSize });
  }, []);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(20); // More time for shape recognition?
    setIsPlaying(true);
    generateLevel(1);
  };

  const handleShapeClick = (isTarget) => {
    if (!isPlaying) return;

    if (isTarget) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setScore(s => s + 1);
      // Time bonus
      setTimeLeft(t => Math.min(t + 3, 45));
      generateLevel(nextLevel);
    } else {
      setShake(true);
      setTimeLeft(t => Math.max(t - 5, 0)); // Higher penalty
      setTimeout(() => setShake(false), 500);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  return (
    <div className={`app-container ${shake ? 'shake' : ''}`}>
      <h1>LUMINOUS</h1>

      <div className="glass-panel game-container">
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value" style={{ color: timeLeft <= 5 ? '#ef4444' : 'inherit' }}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {isPlaying ? (
          <GameGrid
            shapes={gridData.shapes}
            gridSize={gridData.gridSize}
            onShapeClick={handleShapeClick}
          />
        ) : (
          <div className="menu-overlay fade-in">
            {score > 0 && <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Results</h2>}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Final Score</div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-color)' }}>{score}</div>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Spot the shape that isn't quite right.
            </p>
            <button onClick={startGame}>
              {score > 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
