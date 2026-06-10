import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS } from '../data/projects'

// MRA·OS shell — toggled with ` or ~. A toy terminal for curious engineers.
const BANNER = [
  'MRA·OS v3.0 — robotics shell',
  'type `help` for commands',
]

export default function Terminal() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState(BANNER)
  const [hist, setHist] = useState([])
  const histIdx = useRef(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === '`' || e.key === '~') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onToggle = () => setOpen((o) => !o) // nav button / footer hint
    window.addEventListener('keydown', onKey)
    window.addEventListener('mra:terminal-toggle', onToggle)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mra:terminal-toggle', onToggle)
    }
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [lines])

  const print = (...out) => setLines((l) => [...l, ...out])

  const scrollToSection = (id) => {
    setOpen(false)
    navigate('/#' + id.replace('#', ''))
  }

  const run = (raw) => {
    const cmd = raw.trim()
    if (!cmd) return
    print(`> ${cmd}`)
    setHist((h) => [...h, cmd])
    histIdx.current = -1
    const [head, ...args] = cmd.toLowerCase().split(/\s+/)

    switch (head) {
      case 'help':
        print(
          'help              this list',
          'whoami            who built this',
          'ls projects       list all systems',
          'open <name>       open a project case study',
          'cat resume        open the resume PDF',
          'run cartpole --push    disturb the live cart-pole',
          'run planner --replan   regenerate the A* map',
          'goto <section>    work · journey · research · github · skills · contact',
          'github            open the GitHub profile',
          'clear · exit'
        )
        break
      case 'whoami':
        print('Manas Reddy Arumalla — robotics & control engineer.',
          'Control systems · motion planning · sim-to-real.',
          'MSc Autonomy Technologies @ FAU Erlangen-Nürnberg.')
        break
      case 'ls':
        print(...PROJECTS.map((p) => `${p.id.padEnd(16)} ${p.cat}`))
        break
      case 'open': {
        const q = args.join(' ')
        const hit = PROJECTS.find((p) => p.id.includes(q) || p.title.toLowerCase().includes(q))
        if (hit) { setOpen(false); navigate(`/archive?p=${hit.id}`) }
        else print(`not found: ${q} — try \`ls projects\``)
        break
      }
      case 'cat':
        if (args[0] === 'resume') { print('opening resume…'); window.open('/assets/Manas_Reddy_Arumalla_Resume.pdf', '_blank') }
        else print(`cat: ${args[0]}: no such file`)
        break
      case 'run': {
        const sim = args[0]
        const name = (args[1] || '').replace('--', '')
        if (['cartpole', 'planner', 'drone', 'bimanual'].includes(sim)) {
          window.dispatchEvent(new CustomEvent('mra:sim-action', { detail: { sim, name: name || 'push' } }))
          print(`signal sent → ${sim} [${name || 'push'}]`)
          scrollToSection('work')
        } else print(`unknown sim: ${sim}`)
        break
      }
      case 'goto':
        if (args[0]) scrollToSection(args[0] === 'about' ? 'briefing' : args[0])
        break
      case 'github':
        window.open('https://github.com/Manas-arumalla', '_blank')
        break
      case 'sudo':
        print(args.join(' ') === 'hire-manas'
          ? 'ACCESS GRANTED. opening transmission channel…'
          : 'permission denied (try `sudo hire-manas`)')
        if (args.join(' ') === 'hire-manas') setTimeout(() => { window.location.href = 'mailto:manasreddyarumalla@gmail.com' }, 700)
        break
      case 'clear':
        setLines([])
        break
      case 'exit':
        setOpen(false)
        break
      default:
        print(`command not found: ${head} — try \`help\``)
    }
  }

  const onInputKey = (e) => {
    if (e.key === 'Enter') { run(e.target.value); e.target.value = '' }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = hist
      if (!h.length) return
      histIdx.current = histIdx.current === -1 ? h.length - 1 : Math.max(0, histIdx.current - 1)
      e.target.value = h[histIdx.current]
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="terminal"
          data-lenis-prevent
          initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="term-head"><span className="dot" /> MRA·OS shell — press ` or ESC to close</div>
          <div className="term-body" ref={bodyRef}>
            {lines.map((l, i) => <div key={i} className={l.startsWith('>') ? 'term-in' : ''}>{l}</div>)}
          </div>
          <div className="term-input">
            <span>&gt;</span>
            <input ref={inputRef} onKeyDown={onInputKey} spellCheck="false" autoComplete="off" aria-label="Terminal input" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
