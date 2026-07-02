import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion'
import Reveal from './Reveal'

const TEXT = [
  { t: 'I build robots across the ', cls: '' },
  { t: 'full stack', cls: 'em' },
  { t: ' — dynamic modelling and controller design in MATLAB, validation in MuJoCo and Gazebo, deployment to ROS 2 and embedded hardware. ', cls: '' },
  { t: 'Published at ICRM 2025 on hopping-robot dynamics. Contributor to a DST-funded research project. Simulating humanoids at a stealth robotics startup.', cls: 'dim' },
]

function Word({ word, cls, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={{ opacity }} className={`w ${cls}`}>
      {cls === 'em' ? <em>{word}&nbsp;</em> : <>{word}&nbsp;</>}
    </motion.span>
  )
}

function Statement() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.3'] })
  const words = []
  TEXT.forEach((seg) => seg.t.split(' ').filter(Boolean).forEach((w) => words.push({ w, cls: seg.cls })))
  return (
    <p className="statement" ref={ref}>
      {words.map(({ w, cls }, i) => (
        <Word key={i} word={w} cls={cls} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 6) / words.length)]} />
      ))}
    </p>
  )
}

function CountUp({ to }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) },
    })
    return () => controls.stop()
  }, [inView, to])
  return <span ref={ref}>0</span>
}

const STATS = [
  { n: 15, suffix: '+', label: 'Controllers benchmarked' },
  { n: 3, suffix: '', label: 'Papers · 1 published, 2 in review' },
  { n: 18, suffix: '', label: 'Open-source repositories' },
  { n: 5, suffix: '', label: 'Industry & research roles' },
]

export default function Briefing() {
  return (
    <section id="briefing">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">01</span> Briefing</span></Reveal>
        </div>
        <div className="briefing-grid">
          <div>
            <Statement />
            <div className="stats-row">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.08} className="stat">
                  <span className="num"><CountUp to={s.n} />{s.suffix && <sup>{s.suffix}</sup>}</span>
                  <span className="lbl">{s.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal y={50}>
            <div className="portrait-frame hud-corners"><span className="hc" />
              <img src="/assets/Profile.jpg" alt="Manas Reddy Arumalla" loading="lazy" />
              <span className="hud-tag">UNIT·MRA — Nürnberg / Hyderabad</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
