import { motion, useReducedMotion } from 'framer-motion'

const ITEMS = [
  'ROS 2', 'MuJoCo', 'MPC', 'SE(3) Control', 'CasADi', 'PPO', 'Nav2', 'PX4 / MAVLink',
  'Gazebo', 'PDDL / PlanSys2', 'Kalman Filtering', 'Control Barrier Functions', 'Embedded C++', 'Sim-to-Real',
]

export default function Marquee() {
  const reduced = useReducedMotion()
  const half = ITEMS.map((t, i) => <span key={i}>{t}<i> · </i></span>)
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div
        className="marquee-track"
        animate={reduced ? {} : { x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 38 }}
      >
        <div style={{ display: 'inline-flex' }}>{half}</div>
        <div style={{ display: 'inline-flex' }}>{half}</div>
      </motion.div>
    </div>
  )
}
