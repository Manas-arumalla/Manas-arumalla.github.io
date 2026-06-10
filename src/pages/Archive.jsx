import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS, CATEGORIES } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import Reveal from '../components/Reveal'

export default function Archive() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState(params.get('cat') || 'All')
  const [open, setOpen] = useState(() => PROJECTS.find((p) => p.id === params.get('p')) || null)

  const items = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)),
    [filter]
  )

  const pick = (cat) => {
    setFilter(cat)
    setParams(cat === 'All' ? {} : { cat }, { replace: true })
  }

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><span className="kicker"><span className="idx">ARCHIVE</span> All systems</span></Reveal>
          <Reveal delay={0.08}>
            <h1 className="h-section" style={{ marginTop: '1.2rem' }}>
              Every robot tells you<br />something the last one didn&apos;t.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="filters">
              {CATEGORIES.map((c) => (
                <button key={c} className={`filter-btn${filter === c ? ' active' : ''}`} onClick={() => pick(c)} data-hover>
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="archive-section">
        <div className="wrap">
          <p className="count-line">{items.length} / {PROJECTS.length} systems — {filter}</p>
          <motion.div className="grid-cards" layout>
            <AnimatePresence mode="popLayout">
              {items.map((p) => <ProjectCard key={p.id} p={p} onOpen={setOpen} layout />)}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>{open && <ProjectModal p={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  )
}
