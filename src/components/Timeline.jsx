import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Reveal from './Reveal'

const ITEMS = [
  { date: '2026 — Present', title: 'MSc Autonomy Technologies', org: 'Friedrich-Alexander-Universität Erlangen-Nürnberg · Germany', body: 'Graduate study in autonomous systems — deepening the theory behind the practice.', edu: true },
  { date: 'Feb — Apr 2026', title: 'Robotics Engineer', org: 'Humanoid Robotics Startup (Stealth)', body: 'Built manipulation simulations in Gazebo with PDDL task planning so task sequences are validated in sim before touching hardware. Simulated and tested a K-Scale humanoid in ROS 2 and stood up the sim-to-hardware deployment pipeline.' },
  { date: 'Sep 2025 — Jan 2026', title: 'Research Assistant', org: 'Amrita Vishwa Vidyapeetham · Dr. Rammohan Sriramdas', body: 'Developed a DST-funded two-wheeled hopping robot — characterized its jump dynamics and designed the stabilizing control, published at ICRM 2025. Enhanced control and navigation on a quadruped mobile robot. Authored three research papers.' },
  { date: 'Jun — Aug 2024', title: 'Robotics Intern', org: 'Anvi Robotics · Hyderabad', body: 'Designed a water-cleaning unmanned surface vehicle end-to-end: component selection, CAD, and ROS simulations integrating MAVLink with PX4. Vision-based trash detection lets the USV locate and route to floating waste on its own.' },
  { date: 'Oct 2023 — Dec 2024', title: 'Robotics Intern', org: 'Sony SSUP Program', body: 'Co-developed a four-legged farm-assistance robot for cattle health monitoring. Programmed sensor fusion and control algorithms; troubleshot hardware to keep field experiments running with minimal downtime.' },
  { date: 'Mar — Apr 2024', title: 'Robotics Intern', org: '7s Technologies · Hyderabad', body: 'Designed an AR/VR motion-simulation chair with real-time control — component selection plus load and performance calculations to hit motion-fidelity targets.' },
  { date: '2021 — 2025', title: 'B.Tech, Automation & Robotics', org: 'Amrita Vishwa Vidyapeetham · Coimbatore', body: 'CGPA 8.84/10 — First Class with Distinction. Control systems, mobile robotics, computer vision, machine learning, embedded systems.', edu: true },
]

export default function Timeline() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.65'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26 })

  return (
    <section id="journey">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">04</span> Journey</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">Five roles. Three years.<br />One trajectory.</h2></Reveal>
        </div>
        <div className="timeline" ref={ref}>
          <motion.div className="progress" style={{ scaleY }} />
          {ITEMS.map((it, i) => (
            <div className={`t-item${it.edu ? ' edu' : ''}`} key={it.date + it.title}>
              <Reveal delay={0.04 * i} y={20}><span className="t-date">{it.date}</span></Reveal>
              <Reveal delay={0.04 * i + 0.06} y={24}>
                <div className="t-body">
                  <h4>{it.title}</h4>
                  <span className="org">{it.org}</span>
                  <p>{it.body}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
