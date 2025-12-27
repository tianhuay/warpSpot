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

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Background tint that matches the shape color, with low opacity for subtle hover/press states.
export const hoverBgString = (color, { alpha = 0.10 } = {}) => {
    const h = clamp(color.h, 0, 360);
    const s = clamp(color.s, 0, 100);
    const l = clamp(color.l, 0, 100);
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
};

export const getGridSize = (level) => {
    if (level <= 2) return 2;
    if (level <= 5) return 3;
    // Keep tiles larger through the early game so players aren't stuck around ~15.
    if (level <= 15) return 4;
    return 5; // Cap at 5x5 for shape clarity
};

// Generates points for a regular polygon
// Returns array of [x, y] in percentage (0-100)
export const generateRegularPolygon = (sides) => {
    const points = [];
    const radius = 40; // 40% radius so it fits in 100x100 box
    const center = { x: 50, y: 50 };

    // Deterministic rotation start: removes "rotation variation" as a challenge.
    // The target is still distorted; the base shape orientation stays consistent.
    const startAngle = 0;

    for (let i = 0; i < sides; i++) {
        const angle = startAngle + (i * 2 * Math.PI / sides);
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        points.push({ x, y });
    }
    return points;
};

// Distorts one point of the polygon
export const distortPolygon = (points, difficulty, distortVertices = 1) => {
    // Clone points
    const newPoints = points.map(p => ({ ...p }));

    const clampedCount = Math.max(1, Math.min(distortVertices, points.length));
    const chosen = new Set();
    while (chosen.size < clampedCount) {
        chosen.add(Math.floor(Math.random() * points.length));
    }

    // Difficulty logic:
    // Make levels 1–15 easier by decaying distortion more slowly and keeping a larger floor.
    // After 15, ramp down more aggressively.
    const maxDist = 20;
    const early = difficulty <= 15;
    const minDist = early ? 4 : 2;
    const decay = early ? 0.90 : 0.85;
    const distortionAmount = Math.max(minDist, maxDist * Math.pow(decay, difficulty - 1));

    for (const index of chosen) {
        // Random direction for distortion
        const angle = Math.random() * Math.PI * 2;
        newPoints[index].x += distortionAmount * Math.cos(angle);
        newPoints[index].y += distortionAmount * Math.sin(angle);
    }

    return newPoints;
};

export const pointsToClipPath = (points) => {
    const str = points.map(p => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`).join(', ');
    return `polygon(${str})`;
};
