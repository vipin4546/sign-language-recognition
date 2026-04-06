/**
 * GestureDisplay — shows the currently detected gesture letter and hold progress.
 * @param {string|null} current - detected gesture (e.g. "A", "Space", null)
 * @param {number} progress - hold confidence 0–1
 */
export default function GestureDisplay({ current, progress }) {
  const isSpecial = current && ['Space', 'Backspace', 'NewLine', 'FullStop'].includes(current)

  const specialLabel = {
    Space:     '⎵ Space',
    Backspace: '⌫ Back',
    NewLine:   '↵ Line',
    FullStop:  '• Stop',
  }

  return (
    <div className="relative bg-panel rounded-2xl border border-border overflow-hidden p-6 shadow-card corner-tl corner-br">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
          current ? 'bg-signal animate-pulse' : 'bg-muted'
        }`} />
        <span className="text-xs font-mono text-muted uppercase tracking-widest">
          Detected Gesture
        </span>
      </div>

      {/* Big letter box */}
      <div className="flex items-center justify-center mb-6">
        <div className={`relative w-32 h-32 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
          current
            ? 'border-accent/40 bg-accent-light shadow-accent'
            : 'border-border bg-surface'
        } ${progress > 0.5 ? 'active-detect' : ''}`}>

          {current ? (
            <span
              key={current}
              className={`font-display font-bold transition-all duration-150 gesture-char ${
                isSpecial
                  ? 'text-xl text-signal-dim'
                  : 'text-6xl text-accent accent-glow-text'
              }`}
            >
              {isSpecial ? specialLabel[current] : current}
            </span>
          ) : (
            <span className="text-4xl text-muted select-none">—</span>
          )}

          {/* Corner accents when active */}
          {current && (
            <>
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-accent/50 rounded-tl-sm" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-accent/50 rounded-br-sm" />
            </>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {current ? (
          <p className="text-text-dim text-sm">
            Holding gesture —{' '}
            <span className="text-accent font-medium font-mono">
              {Math.round(progress * 100)}%
            </span>{' '}
            complete
          </p>
        ) : (
          <p className="text-muted text-sm italic">Show a gesture to the camera...</p>
        )}
      </div>
    </div>
  )
}
