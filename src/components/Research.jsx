import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'

export default function Research() {
  return (
    <section id="research">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">05</span> Research</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">Peer-reviewed,<br />not just push-to-main.</h2></Reveal>
        </div>
        <div className="papers">
          <Reveal>
            <a className="paper" href="https://ieeexplore.ieee.org/document/11349074" target="_blank" rel="noopener noreferrer" data-hover>
              <span className="badge">Published · IEEE</span>
              <span>
                <h4>Mapping the Dynamics of Robotic Jumps in Hopping Robots</h4>
                <span className="meta">
                  M. R. Arumalla, R. Sriramdas, V. R. Devarakonda, A. Vincent — Int. Conf. on Robotics and Mechatronics (ICRM 2025)<br />
                  <span className="mono">DOI 10.1109/ICRM66809.2025.11349074 · Normalized specific-height / specific-compression metrics for mass-independent comparison of hopping mechanisms</span>
                </span>
              </span>
              <span className="text-link">IEEE Xplore <ArrowUpRight size={12} /></span>
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="paper">
              <span className="badge review">Under review</span>
              <span>
                <h4>Two further manuscripts</h4>
                <span className="meta">Currently in peer review (2026) — continuing the hopping-robot and mobile-robot control lines of work from the DST-funded project.</span>
              </span>
              <span className="mono" style={{ color: 'var(--faint)', fontSize: '.7rem' }}>STATUS · IN REVIEW</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
