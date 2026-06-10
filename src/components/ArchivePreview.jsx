import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { PROJECTS, PREVIEW_IDS } from '../data/projects'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import Reveal from './Reveal'

export default function ArchivePreview() {
  const [open, setOpen] = useState(null)
  const items = PREVIEW_IDS.map((id) => PROJECTS.find((p) => p.id === id)).filter(Boolean)

  return (
    <section id="archive-preview">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">03</span> More systems</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">From competition floors<br />to research labs.</h2></Reveal>
        </div>
        <div className="grid-cards">
          {items.map((p) => <ProjectCard key={p.id} p={p} onOpen={setOpen} layout />)}
        </div>
        <div className="archive-cta">
          <Link className="btn" to="/archive">Full archive — {PROJECTS.length} projects <span className="arrow"><ArrowUpRight size={14} /></span></Link>
        </div>
      </div>
      <AnimatePresence>{open && <ProjectModal p={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}
