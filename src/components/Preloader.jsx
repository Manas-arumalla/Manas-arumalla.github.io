import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LINES = [
  ['MRA·OS v3.0', '— boot sequence'],
  ['calibrating actuators', 'OK'],
  ['loading kinematic chain', 'OK'],
  ['solver online', 'CCD-IK @ 60 Hz'],
  ['establishing link', 'OK'],
]

export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const t0 = performance.now()
    const DURATION = 1700
    let raf
    const tick = (t) => {
      const p = Math.min((t - t0) / DURATION, 1)
      // ease with a couple of "loading stalls" for realism
      const stall = 0.06 * Math.sin(p * 9)
      setPct(Math.round(Math.max(0, Math.min(1, p + stall * (1 - p))) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(onDone, 250)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
      style={{ clipPath: 'inset(0 0 0% 0)' }}
      aria-hidden="true"
    >
      <div className="boot">
        <div className="boot-lines">
          {LINES.map(([label, status], i) => (
            <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.22 }}>
              {'> '}{label} <span>{status}</span>
            </motion.div>
          ))}
        </div>
        <div className="boot-bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
        <div className="boot-pct">{pct}%</div>
      </div>
    </motion.div>
  )
}
