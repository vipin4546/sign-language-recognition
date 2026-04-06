import { Link } from 'react-router-dom'

const GESTURES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function Landing() {
  return (
    <main className="pt-12">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center grid-bg overflow-hidden bg-ink">

        {/* Soft ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-signal/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full px-6">
          <div className="mx-auto max-w-4xl flex flex-col items-center text-center">

            {/* Headline */}
            <h1 className="font-display font-bold text-6xl md:text-7xl leading-none tracking-tight mb-6">
              <span className="text-text">Speak with</span>
              <br />
              <span className="text-accent accent-glow-text">Your Hands</span>
            </h1>

            <p className="text-text-dim text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                SignLanguage converts hand gestures into live text using your webcam, MediaPipe hand tracking, and a TensorFlow classification model — all running in real time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/demo"
                className="group px-8 py-4 bg-accent text-white rounded-xl font-display font-bold text-lg hover:bg-accent-dim transition-all duration-200 shadow-accent hover:-translate-y-0.5"
              >
                Start Demo
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
              <Link
                to="/docs"
                className="px-8 py-4 border border-border-md bg-panel text-text rounded-xl font-display font-semibold text-lg hover:border-accent/40 hover:text-accent transition-all duration-200 shadow-card"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ── Gesture Alphabet ────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-5xl text-text mb-3">Supported Gestures</h2>
            <p className="text-text-dim">All 26 letters + 4 special gestures</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {GESTURES.map((letter) => (
              <div
                key={letter}
                className="w-12 h-12 rounded-xl border border-border bg-panel flex items-center justify-center font-display font-bold text-lg text-text-dim hover:border-accent/40 hover:text-accent hover:bg-accent-light transition-all duration-200 cursor-default shadow-card"
              >
                {letter}
              </div>
            ))}
            {['⎵', '⌫', '•', '↵'].map((sym) => (
              <div
                key={sym}
                className="w-12 h-12 rounded-xl border border-signal-border bg-signal-bg flex items-center justify-center font-display font-bold text-lg text-signal-dim hover:bg-signal/10 transition-all duration-200 cursor-default"
              >
                {sym}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl text-text mb-3">How It Works</h2>
          <p className="text-text-dim">Four steps from gesture to speech</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {[
            { step: '01', title: 'Capture',  desc: 'Webcam streams at 10fps. Frames are JPEG-encoded and sent via WebSocket.' },
            { step: '02', title: 'Detect',   desc: 'MediaPipe extracts 21 hand landmarks per frame, describing joint positions.' },
            { step: '03', title: 'Classify', desc: 'TensorFlow model maps landmarks to one of 30 gesture classes.' },
            { step: '04', title: 'Output',   desc: 'After 2s hold, the letter is confirmed and optionally spoken via TTS.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="text-5xl font-display font-bold text-border-md mb-4">{step}</div>
              <h3 className="font-display font-semibold text-text mb-2">{title}</h3>
              <p className="text-text-dim text-6sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-5xl text-text mb-4">Ready to try it?</h2>
          <p className="text-text-dim mb-8">Open the live demo and start signing. No setup required.</p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-display font-bold text-lg hover:bg-accent-dim transition-all shadow-accent"
          >
            Launch Demo →
          </Link>
        </div>
      </section>


    </main>
  )
}
