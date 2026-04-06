import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/',      label: 'Home'      },
    { to: '/demo',  label: 'Live Demo' },
    { to: '/docs',  label: 'Docs'      },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-accent border-b border-accent-dim shadow-sm">
      <div className="max-w-8xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-display font-bold text-4xl text-white">
            Sign<span className="text-white/65">Language</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-md text-2xl font-medium transition-all duration-200 ${
                pathname === to
                  ? 'bg-white/18 text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/demo"
            className="ml-4 px-4 py-2 bg-white text-accent rounded-md text-sm font-bold font-display hover:bg-white/90 transition-colors duration-200 shadow-sm"
          >
            Try Now →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/80 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5 w-5">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/15 bg-accent-dim px-6 py-4 space-y-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === to
                  ? 'text-white bg-white/18'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
