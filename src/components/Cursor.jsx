import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// Targeting-reticle cursor: center dot + rotating arc segments + four corner
// ticks that lock inward (and go signal-orange) over interactive elements.
export default function Cursor() {
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  const rx = useSpring(mx, { stiffness: 320, damping: 26, mass: 0.5 })
  const ry = useSpring(my, { stiffness: 320, damping: 26, mass: 0.5 })
  // grab offset: the hero arm can physically "drag" the reticle (mra:grab-offset)
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const gxs = useSpring(gx, { stiffness: 160, damping: 18 })
  const gys = useSpring(gy, { stiffness: 160, damping: 18 })
  const cx = useTransform([rx, gxs], ([a, b]) => a + b)
  const cy = useTransform([ry, gys], ([a, b]) => a + b)
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY) }
    const over = (e) => setHover(!!e.target.closest('a, button, [data-hover], canvas'))
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)
    const onGrab = (e) => { gx.set(e.detail.dx || 0); gy.set(e.detail.dy || 0) }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mra:grab-offset', onGrab)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mra:grab-offset', onGrab)
    }
  }, [mx, my, gx, gy])

  const cls = `cursor-reticle${hover ? ' is-hover' : ''}${down ? ' is-down' : ''}`

  return (
    <>
      <motion.div className="cursor-core" style={{ x: mx, y: my }} aria-hidden="true" />
      <motion.div className={cls} style={{ x: cx, y: cy }} aria-hidden="true">
        <svg viewBox="0 0 48 48" width="48" height="48">
          <g className="ret-spin">
            <path d="M 24 4 A 20 20 0 0 1 41.3 14" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M 24 44 A 20 20 0 0 1 6.7 34" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </g>
          <g className="ret-ticks" stroke="currentColor" strokeWidth="1.6" fill="none">
            <path className="tick tl" d="M 10 15 V 10 H 15" />
            <path className="tick tr" d="M 33 10 H 38 V 15" />
            <path className="tick br" d="M 38 33 V 38 H 33" />
            <path className="tick bl" d="M 15 38 H 10 V 33" />
          </g>
          <line className="ret-cross" x1="24" y1="19" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" />
          <line className="ret-cross" x1="24" y1="26" x2="24" y2="29" stroke="currentColor" strokeWidth="1.2" />
          <line className="ret-cross" x1="19" y1="24" x2="22" y2="24" stroke="currentColor" strokeWidth="1.2" />
          <line className="ret-cross" x1="26" y1="24" x2="29" y2="24" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </motion.div>
    </>
  )
}
