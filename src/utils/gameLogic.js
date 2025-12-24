export const generateBaseColor = () => {
    // Generate a random nicely saturated color in HSL
    const h = Math.floor(Math.random() * 360);
    // Keep it consistent for all shapes
    const s = 80;
    const l = 60;
    return { h, s, l };
};

export const hslString = (color) => {
    return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
};

export const getGridSize = (level) => {
    if (level <= 2) return 2;
    if (level <= 5) return 3;
    if (level <= 10) return 4;
    return 5; // Cap at 5x5 for shape clarity
};

// Generates points for a regular polygon
// Returns array of [x, y] in percentage (0-100)
export const generateRegularPolygon = (sides) => {
    const points = [];
    const radius = 40; // 40% radius so it fits in 100x100 box
    const center = { x: 50, y: 50 };

    // Random rotation start
    const startAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < sides; i++) {
        const angle = startAngle + (i * 2 * Math.PI / sides);
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push({ x, y });
    }
    return points;
};

// Distorts one point of the polygon
export const distortPolygon = (points, difficulty) => {
    // Clone points
    const newPoints = points.map(p => ({ ...p }));

    // Pick a random vertex to move
    const index = Math.floor(Math.random() * points.length);

    // Difficulty logic:
    // Level 1: Large distortion (e.g. 15-20%)
    // Level 20: Tiny distortion (e.g. 2-3%)
    const maxDist = 20;
    const minDist = 2;
    // Scale down quickly
    const distortionAmount = Math.max(minDist, maxDist * Math.pow(0.85, difficulty - 1));

    // Random direction for distortion
    // We just move x or y or both
    const angle = Math.random() * Math.PI * 2;

    newPoints[index].x += distortionAmount * Math.cos(angle);
    newPoints[index].y += distortionAmount * Math.sin(angle);

    return newPoints;
};

export const pointsToClipPath = (points) => {
    const str = points.map(p => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`).join(', ');
    return `polygon(${str})`;
};
