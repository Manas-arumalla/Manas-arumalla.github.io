import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SimCanvas from '../components/SimCanvas'
import Reveal from '../components/Reveal'

export default function NotFound() {
  return (
    <section className="page-hero" style={{ minHeight: '88svh' }}>
      <div className="wrap">
        <Reveal><span className="kicker"><span className="idx">404</span> Signal lost</span></Reveal>
        <Reveal delay={0.08}>
          <h1 className="h-display" style={{ marginTop: '1.2rem' }}>
            Robot off<br />the map<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lead" style={{ marginTop: '1.4rem' }}>
            This route doesn&apos;t exist. The navigation stack is already replanning a way home —
            you can help it by drawing or erasing walls.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ maxWidth: 760, marginTop: '2.6rem' }}>
            <SimCanvas sim="planner" label="REPLANNING — ROUTE HOME" />
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div style={{ marginTop: '2.2rem' }}>
            <Link className="btn primary" to="/">Take me home <span className="arrow"><ArrowUpRight size={14} /></span></Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
