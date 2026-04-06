/**
 * ProgressBar — visualizes the 2-second gesture hold detection.
 * @param {number} progress - value from 0 to 1
 * @param {boolean} active - whether detection is happening
 */
export default function ProgressBar({ progress = 0, active = false }) {
  const pct = Math.round(progress * 100)

  // Color transitions: indigo → green as confidence grows
  const fillColor =
    progress < 0.5
      ? 'linear-gradient(90deg, #6366F1, #4F46E5)'
      : progress < 0.85
      ? 'linear-gradient(90deg, #4F46E5, #22C55E)'
      : 'linear-gradient(90deg, #22C55E, #16A34A)'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted font-mono uppercase tracking-widest">Hold Progress</span>
        <span className={`font-mono font-semibold transition-colors ${
          active ? 'text-accent' : 'text-muted'
        }`}>
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="absolute left-0 top-0 h-full rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: fillColor,
            boxShadow: active && progress > 0
              ? '0 0 8px rgba(79,70,229,0.35)'
              : 'none',
          }}
        />
        {/* Shimmer on completion */}
        {progress >= 1 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        )}
      </div>

      {/* Tick marks at 25 / 50 / 75% */}
      <div className="relative h-1 -mt-1">
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 w-px h-1 bg-border-md"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
    </div>
  )
}
