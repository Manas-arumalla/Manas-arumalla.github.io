import { Download, Mail, Phone, Github, Linkedin, Globe, MapPin } from 'lucide-react'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'

const EXPERIENCE = [
  {
    date: 'Feb — Apr 2026',
    role: 'Robotics Engineer',
    org: 'Humanoid Robotics Startup (Stealth)',
    points: [
      'Built manipulation simulations in Gazebo with PDDL task planning, validating task sequences in sim before hardware',
      'Simulated and tested a K-Scale humanoid in ROS 2; stood up the sim-to-hardware deployment pipeline',
    ],
  },
  {
    date: 'Sep 2025 — Jan 2026',
    role: 'Research Assistant',
    org: 'Amrita Vishwa Vidyapeetham · Dr. Rammohan Sriramdas',
    points: [
      'Developed a DST-funded two-wheeled hopping robot: characterized jump dynamics and designed stabilizing control — published at IEEE ICRM 2025',
      'Enhanced control and navigation on a quadruped mobile robot; authored three research papers',
    ],
  },
  {
    date: 'Jun — Aug 2024',
    role: 'Robotics Intern',
    org: 'Anvi Robotics · Hyderabad',
    points: [
      'Designed a water-cleaning USV end-to-end: component selection, CAD, and ROS simulations integrating MAVLink with PX4',
      'Vision-based trash detection enabling autonomous routing to floating waste',
    ],
  },
  {
    date: 'Oct 2023 — Dec 2024',
    role: 'Robotics Intern',
    org: 'Sony SSUP Program',
    points: [
      'Co-developed a four-legged farm-assistance robot for cattle health monitoring',
      'Programmed sensor fusion and control; field-debugged hardware for minimal downtime',
    ],
  },
  {
    date: 'Mar — Apr 2024',
    role: 'Robotics Intern',
    org: '7s Technologies · Hyderabad',
    points: [
      'Designed an AR/VR motion-simulation chair with real-time control; load and performance calculations to hit motion-fidelity targets',
    ],
  },
]

const PROJECTS = [
  ['Vision-Based Drone Landing', '~92% vision-only landing on moving platforms & 6-DOF ship decks; SE(3) + tube-DOB MPC, HJ reachability shield, PPO'],
  ['OpenArm Bimanual Manipulation', '160/160 dynamic catches; 0.03 mm IK accuracy; admittance control, RRT-Connect, ACT vision policy'],
  ['Two-Wheeled Inverted Pendulum', '15+ controllers (LQR→H∞→SMC→MPC) benchmarked on one platform, auto-tuned, MuJoCo-validated'],
  ['swarm-autonomy', 'GPS-denied multi-drone search & pursuit: OpenVINS VIO, CBBA allocation, ESDF planning — 2.3× faster coverage'],
  ['sparsam', 'From-scratch C++20 SLAM backend: Ceres-parity bundle adjustment, 1.7–2.1× faster than GTSAM on M3500'],
  ['Autonomous Go2 Inspection', 'Quadruped facility inspection: RTAB-Map SLAM, frontier exploration, YOLOE gauge reading — F1 = 1.0'],
]

const SKILLS = [
  ['Control & Estimation', 'LQR · MPC · SMC · H∞ · adaptive · EKF/Kalman · state-space'],
  ['Planning & Navigation', 'A*/Hybrid A* · RRT* · PRM · DWA · RVO · PDDL/PlanSys2 · Nav2'],
  ['ML / RL', 'PPO · SAC · ACT imitation · OpenCV · MediaPipe'],
  ['Frameworks & Sim', 'ROS/ROS 2 · MuJoCo · Gazebo · PX4/MAVLink · CasADi · Simulink'],
  ['Programming', 'Python · C++20 · MATLAB · Embedded C · Linux'],
  ['Hardware & CAD', 'Arduino/Teensy · Raspberry Pi · sensor integration · Fusion 360'],
]

export default function Resume() {
  return (
    <section className="page-hero resume-page">
      <Seo
        title="Resume — Manas Reddy Arumalla · Robotics & Control Engineer"
        description="Resume of Manas Reddy Arumalla: robotics & control engineer, MSc Autonomy Technologies (FAU Erlangen-Nürnberg), IEEE ICRM 2025 author, 1st place HackLab Berlin. Control systems, motion planning, sim-to-real."
        path="/resume"
      />
      <div className="wrap resume-wrap">
        <Reveal>
          <header className="res-head">
            <div>
              <span className="kicker"><span className="idx">DOSSIER</span> Resume</span>
              <h1>Manas Reddy Arumalla</h1>
              <p className="res-title">Robotics &amp; Control Engineer — MSc Autonomy Technologies, FAU Erlangen-Nürnberg</p>
              <div className="res-contacts">
                <a href="mailto:manasreddyarumalla@gmail.com"><Mail size={12} /> manasreddyarumalla@gmail.com</a>
                <a href="tel:+919700171171"><Phone size={12} /> +91 97001 71171</a>
                <a href="https://github.com/Manas-arumalla" target="_blank" rel="noopener noreferrer"><Github size={12} /> Manas-arumalla</a>
                <a href="https://www.linkedin.com/in/manas-reddy/" target="_blank" rel="noopener noreferrer"><Linkedin size={12} /> manas-reddy</a>
                <span><Globe size={12} /> manas-arumalla.github.io</span>
                <span><MapPin size={12} /> Nürnberg · Hyderabad</span>
              </div>
            </div>
            <a className="btn primary res-download" href="/assets/Manas_Reddy_Arumalla_Resume.pdf" target="_blank" rel="noopener noreferrer">
              Download PDF <span className="arrow"><Download size={14} /></span>
            </a>
          </header>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Summary</h2>
            <p className="res-summary">
              Control &amp; autonomy engineer specializing in estimation and safe control for aerial and
              mobile robots. Published author (IEEE ICRM 2025) and DST-funded researcher, with a
              research-grade portfolio spanning a vision-only drone that lands on moving ship decks, a
              bimanual manipulation platform, and 15+ benchmarked controller designs. Comfortable across
              the full stack — dynamic modelling and control design in MATLAB, validation in
              MuJoCo/Gazebo, and deployment to ROS 2 and embedded hardware.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Experience</h2>
            {EXPERIENCE.map((e) => (
              <div className="res-item" key={e.date}>
                <div className="res-item-head">
                  <b>{e.role}</b>
                  <span className="res-org">{e.org}</span>
                  <span className="res-date">{e.date}</span>
                </div>
                <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Education</h2>
            <div className="res-item">
              <div className="res-item-head">
                <b>M.Sc. Autonomy Technologies</b>
                <span className="res-org">Friedrich-Alexander-Universität Erlangen-Nürnberg</span>
                <span className="res-date">2026 — Present</span>
              </div>
            </div>
            <div className="res-item">
              <div className="res-item-head">
                <b>B.Tech, Automation &amp; Robotics</b>
                <span className="res-org">Amrita Vishwa Vidyapeetham · Coimbatore</span>
                <span className="res-date">2021 — 2025</span>
              </div>
              <ul><li>CGPA 8.84/10 — First Class with Distinction</li></ul>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Selected Projects</h2>
            <ul className="res-projects">
              {PROJECTS.map(([name, desc]) => (
                <li key={name}><b>{name}</b> — {desc}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Publications &amp; Awards</h2>
            <ul className="res-projects">
              <li><b>Mapping the Dynamics of Robotic Jumps in Hopping Robots</b> — IEEE ICRM 2025, DOI 10.1109/ICRM66809.2025.11349074 · two further manuscripts under review</li>
              <li><b>1st Place — HackLab Berlin AI × Robotics Hackathon</b> — Claude-driven 8-DOF arm via custom MCP safety server (NormaCore track)</li>
              <li><b>Europe Embodied ’26 · Munich</b> — autonomous Unitree Go2 facility-inspection system built in one weekend</li>
              <li><b>e-Yantra Robotics Competition (IIT Bombay)</b> — national Level 3 qualifier</li>
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <div className="res-section">
            <h2>Skills</h2>
            <div className="res-skills">
              {SKILLS.map(([cat, list]) => (
                <div key={cat}><b>{cat}</b><span>{list}</span></div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
