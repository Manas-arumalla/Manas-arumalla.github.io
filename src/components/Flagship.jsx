import { Zap, RefreshCw, ArrowUpRight, Gamepad2 } from 'lucide-react'
import Reveal from './Reveal'
import SimCanvas from './SimCanvas'

const CASES = [
  {
    idx: 'FLAGSHIP · 01',
    title: 'Vision-Based Drone Landing on Moving Platforms',
    result: '~92% vision-only landing success on moving rovers and 6-DOF seakeeping ship decks — no ground-truth state anywhere in the loop.',
    desc: 'ArUco fiducials fused in a relative-state EKF with a stabilized gimbal feed geometric SE(3) and tube-DOB MPC controllers (CasADi) — ~80× tighter tracking than standard MPC under ship air-wake. A Hamilton–Jacobi reachability shield and higher-order control barrier functions guarantee sense-and-avoid. PPO / LSTM-PPO policies lift hard scenarios to 94–96%, and a decentralized 3–8 drone swarm lands with zero separation violations.',
    chips: ['Python', 'MuJoCo', 'CasADi', 'SE(3)', 'Tube-DOB MPC', 'HJ Reachability', 'CBF-QP', 'PPO', 'EKF'],
    links: [['GitHub', 'https://github.com/Manas-arumalla/drone-landing-moving-platform']],
    sim: 'drone',
    simLabel: 'Live sim — quadrotor + heaving deck',
    tip: 'TRY — drag the drone to fling it · hover + press F to fly it yourself · A returns the autopilot',
    metrics: [['~92%', 'vision-only success'], ['80×', 'tighter tracking (tube-DOB)'], ['100%', 'swarm success, 0 violations']],
  },
  {
    idx: 'FLAGSHIP · 02',
    title: 'OpenArm — Bimanual Manipulation Platform',
    result: '160/160 clean ball catches, 0.03 mm IK accuracy — a full control, planning, and learning stack for the bimanual Enactic OpenArm.',
    desc: 'Forward/inverse kinematics, Cartesian and admittance control, and RRT-Connect obstacle avoidance in MuJoCo. Skills include pick-and-place, articulated-object handling (drawers, valves), cloth folding, collision-aware bimanual hand-over, and dynamic ball-catching via Kalman + MPC interception — plus a learned ACT vision policy and an RL insertion suite. 150 headless tests across ~10.6k lines of code.',
    chips: ['Python', 'MuJoCo', 'Admittance Control', 'RRT-Connect', 'Kalman + MPC', 'ACT', 'RL'],
    links: [['GitHub', 'https://github.com/Manas-arumalla/openarm-control']],
    sim: 'bimanual',
    simLabel: 'Live sim — incoming ball, nearest arm catches',
    metrics: [['160/160', 'ball catches'], ['0.03 mm', 'IK position error'], ['150', 'headless tests']],
    flip: true,
  },
  {
    idx: 'FLAGSHIP · 03',
    title: 'Two-Wheeled Inverted Pendulum — 15+ Controllers, One Benchmark',
    result: 'Derived the dynamics once, then benchmarked 15+ controllers against it — every one auto-tuned by optimization.',
    desc: 'LQR, MPC, H∞, sliding-mode, backstepping, NDI, LPV, adaptive and predictive designs for a Segway-type self-balancing robot, with energy-based swing-up and realistic state estimation. Each controller validated in MuJoCo against the MATLAB state-space model. The panel here runs genuine state feedback on nonlinear cart-pole dynamics (RK4, gains optimized against a quadratic cost) — try to knock it over.',
    chips: ['MATLAB', 'MuJoCo', 'python-control', 'LQR · MPC · H∞ · SMC', 'Swing-up', 'Auto-tuning'],
    links: [
      ['GitHub', 'https://github.com/Manas-arumalla/Control-strategies-for-two-wheeled-inverted-pendulum'],
      ['Segway suite', 'https://github.com/Manas-arumalla/segway-control-suite'],
    ],
    sim: 'cartpole',
    simLabel: 'Live sim — cart-pole under LQR-style feedback',
    actions: [
      { name: 'push', label: 'Disturb it', icon: <Zap size={11} /> },
      { name: 'game', label: 'Beat the LQR', icon: <Gamepad2 size={11} /> },
    ],
    tip: 'TRY — grab the pole tip and let go · or press Beat the LQR and balance it with ← →',
    metrics: [['15+', 'controllers'], ['RK4', 'physics in-browser'], ['LQR', 'running right here']],
  },
  {
    idx: 'FLAGSHIP · 04',
    title: 'navstack — Mobile-Robot Navigation & Control Platform',
    result: 'A modular navigation stack: 9 planners, 6 drive types, 4 trajectory controllers, and RVO swarm avoidance — 48-test suite.',
    desc: 'Planners from A* and Dijkstra to RRT/RRT*, PRM, PSO, APF, and semantic & kinodynamic Hybrid A*; a MuJoCo simulator spanning differential, mecanum, omni, Ackermann, and bicycle drives; Pure Pursuit, Stanley, DWA, and MPC tracking; RVO velocity-obstacle swarm avoidance; and a PPO-trained balancing controller. The panel here is a live A* solver expanding nodes on randomized maps.',
    chips: ['Python', 'MuJoCo', 'Hybrid A*', 'RRT*', 'DWA · MPC', 'RVO Swarm', 'PPO'],
    links: [
      ['GitHub', 'https://github.com/Manas-arumalla/Differential-Drive-Path-planners'],
      ['flowswarm', 'https://github.com/Manas-arumalla/flowswarm'],
    ],
    sim: 'planner',
    simLabel: 'Live sim — A* on randomized maps',
    actions: [{ name: 'replan', label: 'New map', icon: <RefreshCw size={11} /> }],
    tip: 'TRY — draw walls with your mouse and watch it replan · click a wall to erase it',
    metrics: [['9', 'planners'], ['6', 'drive types'], ['10/10', 'A* benchmark success']],
    flip: true,
  },
]

export default function Flagship() {
  return (
    <section id="work">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">02</span> Flagship work</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">Systems, not screenshots.<br />Everything below runs live.</h2></Reveal>
          <Reveal delay={0.16}>
            <p className="lead">
              These panels are not videos — they are controllers and planners executing in your
              browser, written from scratch for this site. Interact with them.
            </p>
          </Reveal>
        </div>

        {CASES.map((c) => (
          <article className={`case${c.flip ? ' flip' : ''}`} key={c.idx}>
            <div className="case-copy">
              <Reveal><span className="case-idx">{c.idx}</span></Reveal>
              <Reveal delay={0.05}><h3 className="h-case">{c.title}</h3></Reveal>
              <Reveal delay={0.1}><p className="case-result">{c.result}</p></Reveal>
              <Reveal delay={0.15}><p className="desc">{c.desc}</p></Reveal>
              <Reveal delay={0.2}>
                <div className="chips">{c.chips.map((ch) => <span className="chip" key={ch}>{ch}</span>)}</div>
                <div className="case-links">
                  {c.links.map(([label, href]) => (
                    <a className="text-link" key={href} href={href} target="_blank" rel="noopener noreferrer">
                      {label} <ArrowUpRight size={12} />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal className="case-media" y={56}>
              <SimCanvas sim={c.sim} label={c.simLabel} actions={c.actions} />
              {c.tip && <p className="sim-tip">{c.tip}</p>}
              <div className="case-metrics">
                {c.metrics.map(([b, l]) => <span className="m" key={l}><b>{b}</b> {l}</span>)}
              </div>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  )
}
