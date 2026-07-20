import { Link } from 'react-router-dom'
import { Trophy, ArrowUpRight, Users, Dog } from 'lucide-react'
import Reveal from './Reveal'

const CHIPS = ['Claude (LLM)', 'SmolVLA', 'Custom MCP Server', '8-DOF Arm', 'NormaCore API', 'Sim-to-Real']

export default function Award() {
  return (
    <section id="award">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">★</span> Award</span></Reveal>
          <Reveal delay={0.08}>
            <h2 className="h-section">First place,<br />Berlin.</h2>
          </Reveal>
        </div>

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
              <div className="chips">{CHIPS.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
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

        {/* second hackathon — compact strip */}
        <Reveal delay={0.1}>
          <div className="award-strip">
            <span className="ch-icon"><Dog size={20} /></span>
            <div className="award-strip-body">
              <span className="case-idx">EUROPE EMBODIED ’26 · MUNICH</span>
              <h4>Autonomous Go2 Facility Inspection</h4>
              <p>
                Built a Unitree Go2 that explores an unknown facility, maps it with RTAB-Map SLAM,
                finds and reads gauges with YOLOE, and writes the inspection report — fully autonomous,
                in one hackathon weekend. Hardened afterwards to 4/4 detection at F1 = 1.0.
              </p>
            </div>
            <div className="award-strip-links">
              <Link className="text-link" to="/archive?p=go2-inspection">Project ↗</Link>
              <a className="text-link" href="https://github.com/Manas-arumalla/autonomous-go2-inspection" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
