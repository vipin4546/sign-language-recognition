import { forwardRef } from 'react'

/**
 * CameraFeed — renders the webcam stream with overlay decorations.
 * The video ref is forwarded so the parent can access the element for frame capture.
 * @param {boolean} isConnected - WebSocket connection state
 * @param {boolean} isStreaming - whether camera is active
 */
const CameraFeed = forwardRef(function CameraFeed({ isConnected, isStreaming, onStart }, ref) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-surface aspect-video shadow-card">

      {/* Scan line (only when streaming) */}
      {isStreaming && <div className="absolute inset-0 scan-line z-10 pointer-events-none" />}

      {/* Camera video element */}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover camera-feed"
      />

      {/* Corner bracket overlays */}
      {isStreaming && (
        <>
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent/60 pointer-events-none z-20" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent/60 pointer-events-none z-20" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent/60 pointer-events-none z-20" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent/60 pointer-events-none z-20" />
        </>
      )}

      {/* Connection status badge */}
      {isStreaming && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-border shadow-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-signal animate-pulse' : 'bg-warn'}`} />
            <span className="text-xs font-mono text-text-dim">
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      )}

      {/* REC indicator */}
      {isStreaming && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-20 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <span className="text-xs font-mono text-danger bg-white/80 px-1.5 rounded">REC</span>
        </div>
      )}

      {/* Placeholder when not streaming */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-md flex items-center justify-center">
            <svg className="w-7 h-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-text-dim text-sm mb-3">Camera access required</p>
            <button
              onClick={onStart}
              className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold font-display hover:bg-accent-dim transition-colors shadow-sm"
            >
              Enable Camera
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default CameraFeed
