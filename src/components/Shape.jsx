import { useRef, useState } from 'react';
import { uiSfx } from '../utils/snd';

const Shape = ({ color, hoverBg, pointsStr, onClick, feedbackState = 'none', disabled = false, revealDelayMs = 0 }) => {
    const [pressed, setPressed] = useState(false);
    const activePointerIdRef = useRef(null);

    const handlePointerDown = (e) => {
        if (disabled) return;
        // Only track a single active pointer to avoid multi-touch conflicts.
        if (activePointerIdRef.current != null) return;
        activePointerIdRef.current = e.pointerId;
        setPressed(true);
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // ignore
        }
    };

    const endPress = () => {
        activePointerIdRef.current = null;
        setPressed(false);
    };

    const handlePointerUp = (e) => {
        if (disabled) return;
        if (activePointerIdRef.current !== e.pointerId) return;
        endPress();
        onClick?.();
    };

    const handlePointerCancel = (e) => {
        if (activePointerIdRef.current !== e.pointerId) return;
        endPress();
    };

    return (
        <button
            type="button"
            className={`shape-btn ${pressed ? 'shape-pressed' : ''} ${feedbackState !== 'none' ? `shape-${feedbackState}` : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerEnter={(e) => {
                if (disabled) return;
                if (e.pointerType === 'mouse') uiSfx.tap({ volume: 0.45 });
            }}
            onPointerLeave={() => {
                // If pointer capture isn't supported, ensure we don't get stuck pressed.
                if (activePointerIdRef.current == null) setPressed(false);
            }}
            onBlur={() => setPressed(false)}
            disabled={disabled}
            aria-label="shape"
            style={{
                '--hover-bg': hoverBg,
                '--reveal-delay': `${revealDelayMs}ms`,
            }}
        >
            <div
                className="shape"
                style={{
                    backgroundColor: color,
                    clipPath: pointsStr,
                }}
            />
        </button>
    );
};

export default Shape;
