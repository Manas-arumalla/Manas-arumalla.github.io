import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Flight-recorder HUD: mission progress, current operating mode (flickers on
// change like a robot switching modes), and a short event log.
const MODES = [
  ['#hero', 'BOOT'],
  ['#briefing', 'BRIEFING'],
  ['#award', 'AWARD'],
  ['#work', 'FLAGSHIP OPS'],
  ['#archive-preview', 'ARCHIVE SCAN'],
  ['#journey', 'TIMELINE'],
  ['#research', 'RESEARCH'],
  ['#github', 'OPEN SOURCE'],
  ['#skills', 'TOOLCHAIN'],
  ['#philosophy', 'DOCTRINE'],
  ['#contact', 'TRANSMISSION'],
]

export default function StatusHud() {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState('BOOT')
  const [log, setLog] = useState([])
  const [flick, setFlick] = useState(0)
  const t0 = useRef(performance.now())
  const lastMode = useRef('BOOT')

  useEffect(() => {
    if (pathname !== '/') {
      setMode(pathname === '/archive' ? 'ARCHIVE' : 'LOST')
      return
    }
    let raf = null
    const update = () => {
      raf = null
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0)
      const probe = window.scrollY + window.innerHeight * 0.5
      let current = 'BOOT'
      MODES.forEach(([sel, name]) => {
        const el = document.querySelector(sel)
        if (el && el.offsetTop <= probe) current = name
      })
      if (current !== lastMode.current) {
        lastMode.current = current
        setMode(current)
        setFlick((f) => f + 1)
        const t = ((performance.now() - t0.current) / 1000).toFixed(1)
        setLog((l) => [...l.slice(-1), `T+${t} ▸ ${current}`])
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [pathname])

  // stay out of the hero's way — fade in once the visitor starts scrolling
  const visible = pathname !== '/' || progress > 3

  return (
    <div className="status-hud" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }} aria-hidden="true">
      <div>MISSION {String(progress).padStart(3, '0')}% <span className="hud-bar"><i style={{ width: `${progress}%` }} /></span></div>
      <div key={flick} className="hud-mode">MODE <b>{mode}</b></div>
      {log.map((line) => <div key={line} className="hud-log">{line}</div>)}
    </div>
  )
}
