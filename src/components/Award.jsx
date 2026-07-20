import { Trophy, ArrowUpRight, Users } from 'lucide-react'
import Reveal from './Reveal'
import Media from './Media'

const BERLIN_CHIPS = ['Claude (LLM)', 'SmolVLA', 'Custom MCP Server', '8-DOF Arm', 'NormaCore API', 'Sim-to-Real']
const MUNICH_CHIPS = ['ROS 2 Jazzy', 'Unitree Go2', 'RTAB-Map', 'Nav2', 'YOLOE', 'Gazebo Harmonic']

export default function Award() {
  return (
    <section id="award">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">★</span> Hackathons</span></Reveal>
          <Reveal delay={0.08}>
            <h2 className="h-section">Robots, built<br />in a weekend.</h2>
          </Reveal>
        </div>

        {/* 01 — Berlin */}
        <div className="award-grid">
          <Reveal className="award-media" y={50}>
            <div className="award-frame hud-corners"><span className="hc" />
              <img src="/assets/hackathon-win.jpg" alt="Winning team on stage — AI-powered robotic control track" loading="lazy" />
              <span className="award-badge"><Trophy size={13} /> 1ST PLACE</span>
            </div>
            <div className="award-thumbs">
              <img src="/assets/hackathon-arm.jpg" alt="The 8-DOF robotic arms" loading="lazy" />
              <img src="/assets/hackathon-group.jpg" alt="AI × Robotics Hackathon participants" loading="lazy" />
            </div>
          </Reveal>

          <div className="award-copy">
            <Reveal><span className="case-idx">HACKLAB BERLIN · AI × ROBOTICS · NORMACORE TRACK</span></Reveal>
            <Reveal delay={0.05}>
              <h3 className="h-case">AI-Powered Robotic Control</h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="case-result">
                Won the AI-powered robotic-control track — an 8-DOF arm driven entirely by Claude,
                with no hard-coded coordinates anywhere in the loop.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="desc">
                We wired Claude and a learned policy through a custom Model Context Protocol server
                where all the safety limits live — so the model physically can&apos;t command an unsafe
                move. The system did autonomous pick-and-place (carrot sorting) from natural language,
                colour-based sorting with SmolVLA + Claude, and gesture responses to spoken questions.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="chips">{BERLIN_CHIPS.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
              <p className="award-team"><Users size={13} /> With Bhanuteja Vadlamudi · hosts Beñat Zuazubizkar Aizpurua &amp; Pedro San Miguel</p>
              <div className="case-links">
                <a className="text-link" href="https://www.linkedin.com/posts/manas-reddy_robotics-ai-llm-ugcPost-7475163765487894528-_hVb/" target="_blank" rel="noopener noreferrer">
                  Read the story ↗
                </a>
                <a className="text-link" href="https://github.com/Manas-arumalla/norma-robot" target="_blank" rel="noopener noreferrer">
                  Code ↗
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 02 — Munich */}
        <div className="award-grid">
          <Reveal className="award-media" y={50}>
            <div className="award-frame hud-corners"><span className="hc" />
              <img src="/assets/go2-hero.jpg" alt="The Unitree Go2 exploring between obstacles" loading="lazy" />
            </div>
            <div className="award-thumbs">
              <Media src="/assets/go2-exploration.mp4" alt="Frontier exploration and SLAM demo" />
              <img src="/assets/go2-highfive.jpg" alt="The Go2 high-fiving a teammate" loading="lazy" />
            </div>
          </Reveal>

          <div className="award-copy">
            <Reveal><span className="case-idx">EUROPE EMBODIED ’26 · AI × ROBOTICS · MUNICH</span></Reveal>
            <Reveal delay={0.05}>
              <h3 className="h-case">Autonomous Go2 Facility Inspection</h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="case-result">
                A Unitree Go2 that explores an unknown facility, maps it, finds and reads its gauges,
                and files the inspection report — fully autonomous, built in one weekend.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="desc">
                The full pipeline runs onboard: frontier exploration feeds RTAB-Map SLAM, rooms are
                segmented into inspection zones, Nav2 drives the dog gauge-to-gauge, and YOLOE detects
                and reads each one into an auto-generated report. Hardened after the event to 4/4 gauge
                detection at F1 = 1.0 with ~0.1 m localization error — and the identical ROS 2 node
                graph runs in Gazebo and on the real robot.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="chips">{MUNICH_CHIPS.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
              <p className="award-team"><Users size={13} /> With Adyansh Gupta &amp; Anirudh Jupudi</p>
              <div className="case-links">
                <a className="text-link" href="https://github.com/Manas-arumalla/autonomous-go2-inspection" target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
