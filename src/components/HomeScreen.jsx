import { uiSfx } from '../utils/snd';

const IconEye = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" {...props}>
    <path
      d="M2.25 12s3.5-7.25 9.75-7.25S21.75 12 21.75 12s-3.5 7.25-9.75 7.25S2.25 12 2.25 12Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCursor = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4.5 3.75 19.25 12 12 13.75 10.25 21.25 4.5 3.75Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" {...props}>
    <path
      d="M13 2.75 4.75 13h6.2L10.9 21.25 19.25 11h-6.2L13 2.75Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const DistortedShape = (props) => (
  <svg viewBox="0 0 100 100" width="80" height="80" fill="none" {...props}>
    {/* Distorted square only */}
    <path
      d="M20 20 L80 20 L80 80 L20 80 Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      <animate
        attributeName="d"
        dur="4s"
        repeatCount="indefinite"
        values="
          M20 20 L80 20 L80 80 L20 80 Z;
          M15 25 L85 15 L75 85 L25 75 Z;
          M25 15 L75 25 L85 75 L15 85 Z;
          M20 20 L80 20 L80 80 L20 80 Z
        "
      />
    </path>
  </svg>
);

export default function HomeScreen({ onStart, bestLevel, bestScore, totalTimeSeconds = 40 }) {
  return (
    <div className="home-wrap fade-in" role="region" aria-label="home screen">
      {/* Decoupled animated glow layers */}
      <div className="home-mode-glow glow-1" />
      <div className="home-mode-glow glow-2" />
      <div className="home-mode-glow glow-3" />

      <div className="home-hero">
        <div className="home-shape-container" aria-hidden="true">
          <DistortedShape className="home-main-shape" />
        </div>

        <div className="home-title">WarpSpot</div>
        <div className="home-subtitle">CHALLENGE</div>

        <div className="home-features" aria-label="how it works">
          <div className="home-feature">
            <div className="home-featureIcon">
              <IconEye />
            </div>
            <div className="home-featureText">Spot the subtle distortion</div>
          </div>
          <div className="home-feature">
            <div className="home-featureIcon">
              <IconCursor />
            </div>
            <div className="home-featureText">Click the target precisely</div>
          </div>
          <div className="home-feature">
            <div className="home-featureIcon">
              <IconBolt />
            </div>
            <div className="home-featureText">Race against the {totalTimeSeconds}s timer</div>
          </div>
        </div>

        <div className="home-ctaRow">
          <button
            className="home-cta"
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') uiSfx.tap({ volume: 0.55 });
            }}
            onClick={onStart}
          >
            <span className="home-ctaLabel">Start Game</span>
            <span className="home-ctaIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M7 5.5v13l11-6.5L7 5.5z" />
              </svg>
            </span>
          </button>
        </div>

        <div className="home-meta" aria-label="best stats">
          <div className="home-metaItem">
            <span className="home-metaLabel">Best Level</span>
            <span className="home-metaValue">{bestLevel}</span>
          </div>
          <div className="home-metaDivider" aria-hidden="true" />
          <div className="home-metaItem">
            <span className="home-metaLabel">Best Score</span>
            <span className="home-metaValue">{bestScore}</span>
          </div>
        </div>

        <div className="home-footnote">FOR PROFESSIONAL EYES ONLY</div>
      </div>
    </div>
  );
}


