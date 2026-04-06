/**
 * Documentation page — explains the system architecture, gestures,
 * and usage instructions in a structured, readable format.
 */

const GESTURES = [
  { key: 'A', desc: 'Closed fist with thumb to the side' },
  { key: 'B', desc: 'Fingers together, palm out, thumb folded' },
  { key: 'C', desc: 'Curved hand forming a "C" shape' },
  { key: 'D', desc: 'Index finger up, other fingers form circle with thumb' },
  { key: 'E', desc: 'Fingers bent, thumb under, claw-like shape' },
  { key: 'F', desc: 'Index + thumb pinch, others extended' },
  { key: 'G', desc: 'Index and thumb parallel, pointing sideways' },
  { key: 'H', desc: 'Index + middle fingers together, pointing sideways' },
  { key: 'I', desc: 'Pinky extended upward, fist' },
  { key: 'J', desc: 'Pinky up, trace J in the air' },
  { key: 'K', desc: 'Index + middle up, thumb between them' },
  { key: 'L', desc: 'L-shape: index up, thumb out' },
  { key: 'M', desc: 'Three fingers folded over thumb' },
  { key: 'N', desc: 'Two fingers over thumb' },
  { key: 'O', desc: 'All fingers + thumb form a circle' },
  { key: 'P', desc: 'Like K but pointing downward' },
  { key: 'Q', desc: 'Like G but pointing downward' },
  { key: 'R', desc: 'Index + middle fingers crossed' },
  { key: 'S', desc: 'Fist with thumb over fingers' },
  { key: 'T', desc: 'Thumb between index and middle finger' },
  { key: 'U', desc: 'Index + middle fingers together, pointing up' },
  { key: 'V', desc: 'Index + middle spread in V/peace sign' },
  { key: 'W', desc: 'Index + middle + ring spread wide' },
  { key: 'X', desc: 'Index finger hooked' },
  { key: 'Y', desc: 'Thumb + pinky out (shaka/hang loose)' },
  { key: 'Z', desc: 'Index finger traces Z in the air' },
  { key: 'Space',     desc: 'Open flat hand facing forward' },
  { key: 'Backspace', desc: 'Fist with thumb extended outward' },
  { key: 'Full Stop', desc: 'Index fingertip touches thumb (like OK)' },
  { key: 'New Line',  desc: 'Index pointing down, sweep motion' },
]

const SPECIAL_KEYS = ['Space', 'Backspace', 'Full Stop', 'New Line']

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-14 scroll-mt-24">
    <h2 className="font-display font-bold text-2xl text-text mb-6 pb-3 border-b border-border">
      {title}
    </h2>
    {children}
  </section>
)

const Step = ({ num, title, children }) => (
  <div className="flex gap-4 mb-6">
    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-accent/30 bg-accent-light flex items-center justify-center">
      <span className="text-accent text-xs font-mono font-bold">{num}</span>
    </div>
    <div>
      <h4 className="font-display font-semibold text-text mb-1">{title}</h4>
      <div className="text-text-dim text-sm leading-relaxed">{children}</div>
    </div>
  </div>
)

export default function Docs() {
  const toc = [
    { id: 'overview',    label: 'What is SignLanguage?' },
    { id: 'how-it-works',label: 'How It Works'       },
    { id: 'gestures',    label: 'Gesture Reference'  },
    { id: 'special',     label: 'Special Gestures'   },
    { id: 'hold-logic',  label: '2-Second Hold Logic'},
    { id: 'usage',       label: 'Usage Instructions' },
    { id: 'stack',       label: 'Tech Stack'         },
  ]

  return (
    <main className="pt-16 min-h-screen bg-ink">
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">

        {/* ── Sidebar TOC ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-5xs font-mono text-muted uppercase tracking-widest mb-4">
              Contents
            </p>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-text-dim hover:text-accent transition-colors py-1.5 border-l-2 border-transparent hover:border-accent pl-3"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 max-w-3xl">

          {/* Page header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent-light text-accent text-xs font-mono mb-4">
              📖 Documentation
            </div>
            <h1 className="font-display font-bold text-5xl text-text mb-4">
              SignLanguage
            </h1>
            <p className="text-text-dim text-lg leading-relaxed">
              Everything you need to understand and use the real-time sign language recognition system.
            </p>
          </div>

          {/* ── Overview ── */}
          <Section id="overview" title="What is SignLanguage?">
            <p className="text-text-dim leading-relaxed mb-4">
              SignLanguage is a real-time hand gesture recognition system that translates American Sign
              Language (ASL) finger-spelling into text using your webcam. It supports the full
              26-letter alphabet plus four special gestures for punctuation and editing.
            </p>
            <p className="text-text-dim leading-relaxed">
              The system is designed for accessibility and as an educational demonstration of how
              computer vision and machine learning can bridge communication gaps. No special hardware
              is required — just a standard webcam.
            </p>
          </Section>

          {/* ── How It Works ── */}
          <Section id="how-it-works" title="How It Works">
            <Step num="1" title="Frame Capture">
              Your webcam feed is captured at 10 frames per second. Each frame is JPEG-encoded
              and sent over a WebSocket connection to the local FastAPI backend.
            </Step>
            <Step num="2" title="Hand Landmark Extraction (MediaPipe)">
              Google's MediaPipe Hands model processes each frame and extracts 21 three-dimensional
              landmarks — one for each joint of the hand. These landmarks describe hand shape and
              orientation without storing raw pixel data, preserving privacy.
            </Step>
            <Step num="3" title="Model Classification (TensorFlow)">
              The 63-dimensional landmark vector (21 joints × x,y,z) is fed into a custom
              TensorFlow dense neural network trained on ASL gestures. The model outputs a
              probability distribution across 30 classes.
            </Step>
            <Step num="4" title="Backend Processing (FastAPI)">
              The FastAPI backend applies a 2-second hold filter: a gesture must be consistently
              predicted for 2 full seconds before it's confirmed. The backend then sends a JSON
              message to the frontend with the confirmed letter and updated text.
            </Step>
            <Step num="5" title="Frontend Display + TTS">
              The React frontend renders the live text, highlights the detected gesture, and
              animates the hold progress bar. When a Full Stop gesture confirms, the Web Speech
              API reads the complete sentence aloud.
            </Step>
          </Section>

          {/* ── Gesture Reference ── */}
          <Section id="gestures" title="Gesture Reference">
            <p className="text-text-dim mb-6 leading-relaxed">
              The table below describes the hand configuration for each supported gesture.
              All gestures use the dominant hand.
            </p>
            <div className="space-y-2">
              {GESTURES.filter(g => !SPECIAL_KEYS.includes(g.key)).map(({ key, desc }) => (
                <div
                  key={key}
                  className="flex items-start gap-4 px-4 py-3 rounded-lg bg-panel border border-border hover:border-accent/25 transition-colors shadow-card"
                >
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg border border-accent/25 bg-accent-light flex items-center justify-center">
                    <span className="font-display font-bold text-lg text-accent">{key}</span>
                  </div>
                  <p className="text-text-dim text-sm leading-relaxed pt-2">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Special Gestures ── */}
          <Section id="special" title="Special Gestures">
            <p className="text-text-dim mb-6 leading-relaxed">
              Four non-letter gestures handle text control and TTS trigger.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GESTURES.filter(g => SPECIAL_KEYS.includes(g.key)).map(({ key, desc }) => (
                <div key={key} className="bg-panel border border-signal-border rounded-xl p-5 shadow-card">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {key === 'Space' ? '⎵' : key === 'Backspace' ? '⌫' : key === 'Full Stop' ? '•' : '↵'}
                    </span>
                    <span className="font-display font-semibold text-signal-dim">{key}</span>
                  </div>
                  <p className="text-text-dim text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Hold Logic ── */}
          <Section id="hold-logic" title="2-Second Hold Logic">
            <div className="bg-accent-light border border-accent/20 rounded-xl p-6 mb-6 shadow-card">
              <p className="text-text-dim leading-relaxed mb-4">
                To prevent accidental input from transient hand positions, SignSense requires
                you to hold each gesture{' '}
                <strong className="text-text">consistently for 2 seconds</strong>{' '}
                before it's confirmed and added to the text.
              </p>
              <p className="text-text-dim leading-relaxed">
                The progress bar on the right side of the demo shows hold progress from 0% to 100%.
                If the detected gesture changes before 100%, the timer resets.
              </p>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: '0 – 50%',   color: 'text-accent',      desc: 'Hold detected, timer running' },
                { label: '50 – 85%',  color: 'text-warn',        desc: 'Approaching confirmation' },
                { label: '85 – 100%', color: 'text-signal-dim',  desc: 'Almost confirmed — keep holding!' },
                { label: '100%',      color: 'text-signal font-bold', desc: 'Confirmed! Letter added to text.' },
              ].map(({ label, color, desc }) => (
                <div key={label} className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-panel border border-border shadow-card">
                  <span className={`font-mono text-xs w-20 ${color}`}>{label}</span>
                  <span className="text-text-dim">{desc}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Usage ── */}
          <Section id="usage" title="Usage Instructions">
            <ol className="space-y-4 list-none">
              {[
                'Ensure the FastAPI backend is running at http://localhost:8000.',
                'Navigate to the Demo page and click "Enable Camera" or "Start Camera".',
                "Allow webcam access in your browser's permission prompt.",
                'Position your hand clearly in frame — good lighting improves accuracy.',
                'Form a gesture and hold it steady for 2 seconds until the progress bar fills.',
                'The letter will appear in the text output area.',
                'Use the Space gesture to add spaces between words.',
                'Use the Full Stop gesture to end a sentence — it will be spoken aloud via TTS.',
                'Use Backspace to delete the last character, and Clear to reset all text.',
              ].map((step, i) => (
                <li key={i} className="flex gap-4 text-text-dim text-sm leading-relaxed">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-border bg-surface flex items-center justify-center text-xs font-mono text-muted mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>

          {/* ── Tech Stack ── */}
          <Section id="stack" title="Tech Stack">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'React 18',      role: 'UI Framework',       bg: 'bg-info-bg',    txt: 'text-info'        },
                { name: 'Vite',          role: 'Build Tool',         bg: 'bg-warn-bg',    txt: 'text-warn'        },
                { name: 'Tailwind CSS',  role: 'Styling',            bg: 'bg-info-bg',    txt: 'text-info'        },
                { name: 'React Router',  role: 'Routing',            bg: 'bg-danger-bg',  txt: 'text-danger'      },
                { name: 'FastAPI',       role: 'Backend',            bg: 'bg-signal-bg',  txt: 'text-signal-dim'  },
                { name: 'WebSocket',     role: 'Real-Time Comm.',    bg: 'bg-accent-light','txt': 'text-accent'   },
                { name: 'MediaPipe',     role: 'Hand Tracking',      bg: 'bg-accent-light','txt': 'text-accent'   },
                { name: 'TensorFlow',    role: 'ML Classification',  bg: 'bg-warn-bg',    txt: 'text-warn'        },
                { name: 'Web Speech API',role: 'Text-to-Speech',     bg: 'bg-signal-bg',  txt: 'text-signal-dim'  },
              ].map(({ name, role, bg, txt }) => (
                <div key={name} className={`${bg} border border-border rounded-xl p-4 shadow-card`}>
                  <p className={`font-display font-semibold ${txt} mb-1`}>{name}</p>
                  <p className="text-muted text-xs">{role}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </main>
  )
}
