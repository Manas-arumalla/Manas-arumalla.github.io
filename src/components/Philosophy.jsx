import { motion } from 'framer-motion'
import Reveal from './Reveal'

const WORDS = ['Model.', 'Simulate.', 'Deploy.']
const PRINCIPLES = [
  ['P·01 — MODEL', 'Physics first', 'Every system starts as equations of motion. If the math is wrong, no amount of tuning saves the robot. Derive, linearize, verify.'],
  ['P·02 — SIMULATE', 'Break it in sim, cheaply', 'MuJoCo and Gazebo are where controllers earn trust — disturbances, sensor noise, and edge cases injected long before hardware is at risk.'],
  ['P·03 — DEPLOY', 'Sim-to-real is the product', 'A controller that only works in simulation is a plot, not a robot. The last mile — ROS 2, embedded targets, real sensors — is where I live.'],
]

export default function Philosophy() {
  return (
    <section id="philosophy" className="philosophy">
      <div className="wrap">
        <Reveal><span className="kicker" style={{ justifyContent: 'center' }}><span className="idx">08</span> Method</span></Reveal>
        <h2 className="h-display" style={{ marginTop: '1.4rem' }}>
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              className="word"
              initial={{ opacity: 0.12, y: 24 }}
              whileInView={{ opacity: 1, y: 0, color: i === 1 ? 'var(--accent)' : 'var(--text)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: i * 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}&nbsp;
            </motion.span>
          ))}
        </h2>
        <div className="principles">
          {PRINCIPLES.map(([tag, title, body], i) => (
            <Reveal key={tag} delay={i * 0.1} className="principle">
              <span className="mono">{tag}</span>
              <h5>{title}</h5>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
