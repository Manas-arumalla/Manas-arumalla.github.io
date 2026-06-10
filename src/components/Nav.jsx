import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Lightbulb, SquareTerminal, Menu, X } from 'lucide-react'

const LINKS = [
  ['About', '#briefing'],
  ['Work', '#work'],
  ['Journey', '#journey'],
  ['Research', '#research'],
  ['GitHub', '#github'],
  ['Skills', '#skills'],
  ['Archive', '/archive'],
  ['Contact', '#contact'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // nav stays pinned while scrolling (user preference) — only the backdrop changes
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const goto = (e, href) => {
    if (!href.startsWith('#')) { setMenuOpen(false); return }
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/' + href)
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleTheme = () => {
    const el = document.documentElement
    const light = el.dataset.theme === 'light'
    if (light) delete el.dataset.theme
    else el.dataset.theme = 'light'
    try { localStorage.setItem('mra-theme', light ? 'dark' : 'light') } catch { /* private mode */ }
  }

  return (
    <>
      <motion.header className={`site-nav${scrolled ? ' scrolled' : ''}`}>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([label, href]) =>
            href.startsWith('#') ? (
              <a key={label} href={href} onClick={(e) => goto(e, href)}>{label}</a>
            ) : (
              <Link key={label} to={href}>{label}</Link>
            )
          )}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className="theme-toggle"
            aria-label="Open terminal"
            title="MRA·OS shell  ( ` )"
            data-hover
            onClick={() => window.dispatchEvent(new CustomEvent('mra:terminal-toggle'))}
          >
            <SquareTerminal size={14} />
          </button>
          <button className="theme-toggle" aria-label="Toggle lab lights" title="Lab lights" data-hover onClick={toggleTheme}>
            <Lightbulb size={14} />
          </button>
          <a className="nav-cta" href="/assets/Manas_Reddy_Arumalla_Resume.pdf" target="_blank" rel="noopener noreferrer">
            Resume <ArrowDown size={11} style={{ display: 'inline', verticalAlign: '-1px' }} />
          </a>
          <button
            className="theme-toggle nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            data-hover
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            data-lenis-prevent
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav aria-label="Mobile">
              {LINKS.map(([label, href], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {href.startsWith('#') ? (
                    <a href={href} onClick={(e) => goto(e, href)}>
                      <span className="mm-idx">{String(i + 1).padStart(2, '0')}</span>{label}
                    </a>
                  ) : (
                    <Link to={href} onClick={() => setMenuOpen(false)}>
                      <span className="mm-idx">{String(i + 1).padStart(2, '0')}</span>{label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
            <motion.div
              className="mm-foot"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              <a href="mailto:manasreddyarumalla@gmail.com">manasreddyarumalla@gmail.com</a>
              <span className="mono">NÜRNBERG · HYDERABAD</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
