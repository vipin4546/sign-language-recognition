/**
 * TextDisplay — renders the accumulated recognized text.
 * Supports copy-to-clipboard and clear actions.
 * @param {string} text - the current accumulated text
 * @param {function} onClear - callback to clear text
 */
import { useState } from 'react'

export default function TextDisplay({ text, onClear }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = text.split('\n')

  return (
    <div className="bg-panel rounded-2xl border border-border overflow-hidden shadow-card">

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted uppercase tracking-widest">
            Live Output
          </span>
          {text && (
            <span className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full font-mono border border-accent/20">
              {text.length} chars
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={!text}
            className={`text-xs px-3 py-1 rounded-md font-medium transition-all duration-200 ${
              text
                ? 'text-text-dim hover:text-accent hover:bg-accent-light border border-border'
                : 'text-muted opacity-40 cursor-not-allowed'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={!text}
            className={`text-xs px-3 py-1 rounded-md font-medium transition-all duration-200 ${
              text
                ? 'text-danger hover:bg-danger-bg border border-danger-border/50'
                : 'text-muted opacity-40 cursor-not-allowed'
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Text area */}
      <div className="p-5 min-h-36 max-h-64 overflow-y-auto">
        {text ? (
          <div className="font-display text-xl leading-relaxed text-text">
            {lines.map((line, i) => (
              <div key={i} className="min-h-[1.5em]">
                {line || <br />}
                {/* Blinking cursor on last line */}
                {i === lines.length - 1 && (
                  <span className="inline-block w-0.5 h-5 bg-accent ml-0.5 align-middle animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-border-md flex items-center justify-center">
              <span className="text-muted text-lg font-display">T</span>
            </div>
            <p className="text-muted text-sm italic">Recognized text will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
