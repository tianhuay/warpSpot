import React from 'react';
import Shape from './Shape';
import { hslString, pointsToClipPath } from '../utils/gameLogic';

const GameGrid = ({ shapes, gridSize, onShapeClick }) => {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gap: '16px', // Increased gap for better shape separation
        width: '100%',
        height: '100%',
        padding: '24px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
    };

    return (
        <div className="game-grid" style={gridStyle}>
            {shapes.map((item, index) => (
                <Shape
                    key={index}
                    color={hslString(item.color)}
                    pointsStr={pointsToClipPath(item.points)}
                    isTarget={item.isTarget}
                    onClick={() => onShapeClick(item.isTarget)}
                />
            ))}
        </div>
    );
};

export default GameGrid;
