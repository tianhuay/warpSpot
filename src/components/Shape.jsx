import React from 'react';

const Shape = ({ color, pointsStr, onClick, isTarget }) => {
    const style = {
        backgroundColor: color,
        clipPath: pointsStr,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
        // Removed box-shadow as it doesn't work well with clip-path on the element itself usually, 
        // but filter: drop-shadow works better for clipped shapes.
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
    };

    return (
        <div
            className="shape-wrapper"
            onClick={onClick}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={style}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
        </div>
    );
};

export default Shape;
