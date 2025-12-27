import { useLayoutEffect, useRef, useState } from 'react';
import Shape from './Shape';
import { hslString, hoverBgString, pointsToClipPath } from '../utils/gameLogic';

const GameGrid = ({ shapes, gridSize, onShapeClick, feedback, inputLocked, roundId }) => {
    const wrapRef = useRef(null);
    const [squareSize, setSquareSize] = useState(null);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height } = entry.contentRect;
            const next = Math.max(0, Math.floor(Math.min(width, height)));
            setSquareSize(next);
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const gapPx = squareSize
        ? Math.max(6, Math.min(16, Math.floor(squareSize / (gridSize * 9))))
        : 12;

    // Tile padding should shrink as grids get denser, but keep the "card" feel.
    const tilePadPx = gridSize >= 5 ? 6 : gridSize >= 4 ? 8 : 10;

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: `${gapPx}px`,
        width: squareSize ? `${squareSize}px` : '100%',
        height: squareSize ? `${squareSize}px` : '100%',
        padding: '0px',
        boxSizing: 'border-box',
        // No outer "container" panel; tiles float on the background.
        backgroundColor: 'transparent',
        borderRadius: '0px',
        boxShadow: 'none',
        // Provide per-tile sizing knobs via CSS variables
        '--tile-pad': `${tilePadPx}px`,
    };

    return (
        <div
            ref={wrapRef}
            style={{
                flex: '1 1 auto',
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(10px, 2vw, 24px)',
            }}
        >
            <div key={roundId} className="game-grid" style={gridStyle}>
                {shapes.map((item, index) => (
                    <Shape
                        key={index}
                        color={hslString(item.color)}
                        hoverBg={hoverBgString(item.color)}
                        revealDelayMs={index * 12}
                        pointsStr={pointsToClipPath(item.points)}
                        isTarget={item.isTarget}
                        feedbackState={
                            feedback?.correctIndex === index
                                ? 'correct'
                                : feedback?.wrongIndex === index
                                    ? 'wrong'
                                    : 'none'
                        }
                        disabled={inputLocked}
                        onClick={() => onShapeClick(index, item.isTarget)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameGrid;
