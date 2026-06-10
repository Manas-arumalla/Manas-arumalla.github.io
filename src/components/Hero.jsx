import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDown } from 'lucide-react'
import { HeroArm } from '../sims/heroArm'

const fmt = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).padStart(5, '0')}°`

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero({ ready }) {
  const canvasRef = useRef(null)
  const tele = useRef({})

  useEffect(() => {
    if (!canvasRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const arm = new HeroArm(canvasRef.current, {
      onTelemetry: ({ j1, j2, j3, j4, err }) => {
        const t = tele.current
        if (t.j1) t.j1.textContent = fmt(j1)
        if (t.j2) t.j2.textContent = fmt(j2)
        if (t.j3) t.j3.textContent = fmt(j3)
        if (t.j4) t.j4.textContent = fmt(j4)
        if (t.ee) t.ee.textContent = `${err.toFixed(3)} m`
      },
    })
    if (reduced) {
      arm.start(); setTimeout(() => arm.stop(), 400) // settle one pose, then freeze
    } else {
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? arm.start() : arm.stop()), { threshold: 0.05 })
      io.observe(canvasRef.current)
      arm._io = io
    }

    // scroll past the hero → the arm powers down; back up → it wakes
    const onScroll = () => {
      const vh = window.innerHeight
      const p = 1 - Math.min(Math.max((window.scrollY - vh * 0.08) / (vh * 0.55), 0), 1)
      arm.setPower(p)
      const link = tele.current.link
      if (link) {
        const standby = p < 0.35
        if (link.dataset.standby !== String(standby)) {
          link.dataset.standby = String(standby)
          link.textContent = standby ? '● STANDBY' : '● ACTIVE'
          link.style.color = standby ? 'var(--faint)' : ''
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); arm._io?.disconnect(); arm.destroy() }
  }, [])

  const ref = (k) => (el) => { tele.current[k] = el }

  return (
    <section className="hero" id="hero" style={{ position: 'relative' }}>
      <video
        className="hero-ambient"
        src="/assets/ai/hero-loop.mp4"
        autoPlay muted loop playsInline
        aria-hidden="true"
        ref={(el) => {
          if (el && window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause()
        }}
      />
      <motion.div className="hero-copy" variants={container} initial="hidden" animate={ready ? 'show' : 'hidden'}>
        <motion.span className="kicker" variants={item}>
          <span className="idx">SYS·01</span> Robotics &amp; Control Engineer
        </motion.span>
        <motion.h1 className="h-display hero-title" variants={item}>
          Manas Reddy<br />Arumalla<span className="accent">.</span>
        </motion.h1>
        <motion.p className="lead hero-sub" variants={item}>
          I design control systems that survive contact with reality — from dynamic models and
          MuJoCo validation to ROS 2 and embedded hardware. Currently: MSc Autonomy Technologies,
          FAU Erlangen-Nürnberg.
        </motion.p>
        <motion.div className="hero-ctas" variants={item}>
          <a className="btn primary" href="#work" onClick={(e) => { e.preventDefault(); document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' }) }}>
            Flagship work <span className="arrow"><ArrowUpRight size={14} /></span>
          </a>
          <a className="btn" href="/assets/Manas_Reddy_Arumalla_Resume.pdf" target="_blank" rel="noopener noreferrer">
            Resume <span className="arrow"><ArrowDown size={14} /></span>
          </a>
        </motion.div>
      </motion.div>

      <div className="hero-stage">
        <canvas ref={canvasRef} aria-label="Interactive robotic arm solving inverse kinematics toward your cursor" role="img" />
        <span className="hint">Move — it tracks · Click — it grabs · Double-click — it waves</span>
      </div>

      <motion.div className="telemetry" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1, duration: 0.8 }}>
        <span className="group"><span className="tag">LINK</span> <span className="live" ref={ref('link')}>● ACTIVE</span></span>
        <span className="group"><span className="tag">J1</span> <span className="val" ref={ref('j1')}>+000.0°</span></span>
        <span className="group"><span className="tag">J2</span> <span className="val" ref={ref('j2')}>+000.0°</span></span>
        <span className="group"><span className="tag">J3</span> <span className="val" ref={ref('j3')}>+000.0°</span></span>
        <span className="group"><span className="tag">J4</span> <span className="val" ref={ref('j4')}>+000.0°</span></span>
        <span className="group"><span className="tag">EE ERR</span> <span className="val" ref={ref('ee')}>0.000 m</span></span>
        <span className="group"><span className="tag">SOLVER</span> <span className="val">CCD-IK @ 60 Hz</span></span>
      </motion.div>
    </section>
  )
}
