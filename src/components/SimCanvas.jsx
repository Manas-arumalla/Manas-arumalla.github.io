import { useEffect, useRef } from 'react'
import { SIM_REGISTRY } from '../sims/sims'

// Mounts a live canvas sim; starts/stops with viewport visibility,
// renders a single static frame when prefers-reduced-motion is set.
// `actions`: [{ name, label, icon }] → buttons calling sim.action(name).
// Also listens for `mra:sim-action` events (dispatched by the terminal).
export default function SimCanvas({ sim, label, actions = [] }) {
  const canvasRef = useRef(null)
  const simRef = useRef(null)

  useEffect(() => {
    const Sim = SIM_REGISTRY[sim]
    if (!Sim || !canvasRef.current) return
    const instance = new Sim(canvasRef.current)
    simRef.current = instance

    const onRemote = (e) => {
      if (e.detail?.sim === sim) instance.action(e.detail.name)
    }
    window.addEventListener('mra:sim-action', onRemote)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      instance.renderOnce()
      return () => { window.removeEventListener('mra:sim-action', onRemote); instance.destroy() }
    }
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? instance.start() : instance.stop()),
      { threshold: 0.12 }
    )
    io.observe(canvasRef.current)
    return () => {
      window.removeEventListener('mra:sim-action', onRemote)
      io.disconnect()
      instance.destroy()
    }
  }, [sim])

  return (
    <div className="sim-frame hud-corners">
      <span className="hc" />
      <span className="sim-label">{label}</span>
      <canvas ref={canvasRef} aria-label={label} role="img" />
      {actions.length > 0 && (
        <div className="sim-actions">
          {actions.map((a) => (
            <button key={a.name} className="sim-action" onClick={() => simRef.current?.action(a.name)} data-hover>
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
