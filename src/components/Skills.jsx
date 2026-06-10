import Reveal from './Reveal'

const GROUPS = [
  ['Control & Estimation', ['LQR', 'MPC', 'SMC', 'H∞', 'Backstepping', 'Adaptive control', 'State-space modelling', 'EKF / Kalman', 'Pure Pursuit · Stanley · DWA'], [0, 1, 2]],
  ['Planning & Navigation', ['A* / Hybrid A*', 'RRT / RRT*', 'PRM', 'APF · PSO', 'RVO multi-robot', 'PDDL / PlanSys2', 'ROS 2 Nav2'], [0, 1, 5]],
  ['ML / RL', ['PPO', 'LSTM policies', 'ACT imitation', 'Genetic-algorithm tuning', 'OpenCV', 'MediaPipe'], [0, 4]],
  ['Frameworks & Sim', ['ROS / ROS 2', 'MuJoCo', 'Gazebo', 'CoppeliaSim', 'PX4 / MAVLink', 'CasADi', 'Simulink · Simscape · Adams'], [0, 1, 4]],
  ['Programming', ['Python', 'C++', 'MATLAB', 'Embedded C', 'Linux'], [0, 1, 2]],
  ['Hardware & CAD', ['Arduino · Teensy', 'Raspberry Pi', 'Sensor integration', 'Fusion 360 / Inventor', '3D printing · CNC'], [3]],
]

export default function Skills() {
  return (
    <section id="skills">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">07</span> Toolchain</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">Depth where it matters.</h2></Reveal>
        </div>
        <div className="skills-grid">
          {GROUPS.map(([title, items, boldIdx], gi) => (
            <Reveal key={title} delay={gi * 0.05} className="skill-cell">
              <h5>{title}</h5>
              <ul>
                {items.map((s, i) => (
                  <li key={s}>{boldIdx.includes(i) ? <b>{s}</b> : s}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
