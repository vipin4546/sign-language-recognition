import { useGesture } from '../hooks/useGesture'
import CameraFeed from '../components/CameraFeed'
import GestureDisplay from '../components/GestureDisplay'
import TextDisplay from '../components/TextDisplay'
import ProgressBar from '../components/ProgressBar'

/**
 * Demo page — the core real-time gesture recognition interface.
 * Composes all components and connects them to the useGesture hook.
 */
export default function Demo() {
  const {
    videoRef,
    text,
    currentGesture,
    progress,
    isConnected,
    isStreaming,
    startCamera,
    stopCamera,
    clearText,
  } = useGesture()

  return (
    <main className="pt-16 min-h-screen bg-ink grid-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-text">
              Live <span className="text-accent">Demo</span>
            </h1>
            <p className="text-text-dim text-sm mt-1">
              Point your camera at your hand and hold a gesture for 2 seconds
            </p>
          </div>

          {/* Connection status pill */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all duration-300 ${
            isConnected
              ? 'border-signal-border bg-signal-bg text-signal-dim'
              : 'border-border bg-surface text-muted'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-signal animate-pulse' : 'bg-muted'
            }`} />
            {isConnected ? 'BACKEND CONNECTED' : 'NOT CONNECTED'}
          </div>
        </div>

        {/* Main grid: 2/3 left + 1/3 right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Camera + Controls ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Camera feed */}
            <CameraFeed
              ref={videoRef}
              isConnected={isConnected}
              isStreaming={isStreaming}
              onStart={startCamera}
            />

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isStreaming ? (
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 bg-accent text-white rounded-xl font-display font-bold hover:bg-accent-dim transition-colors shadow-sm"
                >
                  ▶ Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 bg-panel border border-danger/40 text-danger rounded-xl font-display font-semibold hover:bg-danger-bg transition-colors"
                >
                  ■ Stop Camera
                </button>
              )}

              <button
                onClick={clearText}
                disabled={!text}
                className={`px-5 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 ${
                  text
                    ? 'border-border text-text-dim hover:border-accent/30 hover:text-accent bg-panel'
                    : 'border-border text-muted opacity-40 cursor-not-allowed bg-panel'
                }`}
              >
                Clear Text
              </button>
            </div>

            {/* Text output */}
            <TextDisplay text={text} onClear={clearText} />
          </div>

          {/* ── RIGHT: Gesture + Progress + Stats ── */}
          <div className="space-y-4">

            {/* Gesture display */}
            <GestureDisplay current={currentGesture} progress={progress} />

            {/* Progress bar card */}
            <div className="bg-panel border border-border rounded-2xl p-5 shadow-card">
              <ProgressBar progress={progress} active={!!currentGesture} />
              <p className="text-muted text-xs mt-3 text-center font-mono">
                {progress >= 1
                  ? '✓ Gesture confirmed!'
                  : progress > 0
                  ? 'Keep holding...'
                  : 'No gesture detected'}
              </p>
            </div>

            {/* Session stats */}
            <div className="bg-panel border border-border rounded-2xl p-5 shadow-card space-y-3">
              <h3 className="text-xs font-mono text-muted uppercase tracking-widest">
                Session Stats
              </h3>
              <div className="space-y-3">
                <StatRow label="Characters typed" value={text.replace(/\s/g, '').length} />
                <StatRow
                  label="Words typed"
                  value={text.trim() ? text.trim().split(/\s+/).length : 0}
                />
                <StatRow
                  label="Camera status"
                  value={isStreaming ? 'Active' : 'Inactive'}
                  accent={isStreaming}
                />
                <StatRow
                  label="Backend"
                  value={isConnected ? 'ws://localhost:8000' : 'Offline'}
                  accent={isConnected}
                />
              </div>
            </div>

            {/* Quick reference */}
            <div className="bg-panel border border-border rounded-2xl p-5 shadow-card">
              <h3 className="text-xs font-mono text-muted uppercase tracking-widest mb-3">
                Quick Reference
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
                  <div key={l} className="h-9 rounded-lg border border-border bg-surface flex items-center justify-center font-display font-bold text-sm text-text-dim">
                    {l}
                  </div>
                ))}
                {['⎵', '⌫', '•', '↵'].map((s) => (
                  <div key={s} className="h-9 rounded-lg border border-signal-border bg-signal-bg flex items-center justify-center font-display font-bold text-xs text-signal-dim">
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl overflow-hidden border border-border bg-surface">
                <img
                  src="/quick-reference.jpeg"
                  alt="Sign language alphabet quick reference"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-dim text-xs">{label}</span>
      <span className={`font-mono text-sm font-medium ${accent ? 'text-signal-dim' : 'text-text'}`}>
        {value}
      </span>
    </div>
  )
}
