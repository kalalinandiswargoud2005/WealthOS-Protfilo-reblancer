import React from 'react';

interface GlowingSliderProps {
  drift: number; // negative = under, positive = over
  maxRange?: number;
}

const GlowingSlider: React.FC<GlowingSliderProps> = ({ drift, maxRange = 10 }) => {
  const clampedDrift = Math.max(-maxRange, Math.min(maxRange, drift));
  const pct = ((clampedDrift + maxRange) / (maxRange * 2)) * 100;
  const isAligned = Math.abs(drift) < 0.5;
  const isUnder = drift < -0.5;
  const isOver = drift > 0.5;

  const fillColor = isAligned ? '#34d399' : isUnder ? '#f59e0b' : '#ef4444';
  const glowClass = isAligned ? 'glow-green' : isUnder ? 'glow-amber' : 'glow-red';
  const label = isAligned ? '✓' : isUnder ? '▲' : '▼';
  const labelColor = isAligned ? 'text-emerald-400' : isUnder ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Under label */}
      <div className="text-[9px] text-zinc-600 w-6 text-right font-mono flex-shrink-0">
        -{maxRange}%
      </div>

      {/* Slider track */}
      <div className="relative flex-1 h-2 rounded-full" style={{ background: '#1C1C1E', border: '1px solid #27272A' }}>
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#3f3f46] -translate-x-1/2" />

        {/* Fill from center */}
        {!isAligned && (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full transition-all duration-700 ease-out"
            style={{
              left: isUnder ? `${pct}%` : '50%',
              right: isOver ? `${100 - pct}%` : '50%',
              background: fillColor,
              opacity: 0.6,
            }}
          />
        )}

        {/* Thumb dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-all duration-700 ease-out ${glowClass}`}
          style={{
            left: `${pct}%`,
            background: fillColor,
            border: `2px solid ${fillColor}`,
          }}
        />
      </div>

      {/* Over label */}
      <div className="text-[9px] text-zinc-600 w-6 font-mono flex-shrink-0">
        +{maxRange}%
      </div>

      {/* Drift value badge */}
      <div className={`flex items-center gap-0.5 text-[10px] font-bold font-mono min-w-[54px] justify-end ${labelColor}`}>
        <span>{label}</span>
        <span>{drift > 0 ? '+' : ''}{drift.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default GlowingSlider;
