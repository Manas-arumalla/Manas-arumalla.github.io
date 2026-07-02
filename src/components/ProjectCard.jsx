import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Media from './Media'

const HOVERABLE = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

export default function ProjectCard({ p, onOpen, layout = false }) {
  const ref = useRef(null)
  const rX = useMotionValue(0)
  const rY = useMotionValue(0)
  const sX = useSpring(rX, { stiffness: 220, damping: 18 })
  const sY = useSpring(rY, { stiffness: 220, damping: 18 })

  const onMove = (e) => {
    if (!HOVERABLE || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    rY.set(px * 7)
    rX.set(-py * 6)
    ref.current.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
    ref.current.style.setProperty('--my', `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => { rX.set(0); rY.set(0) }

  return (
    <motion.article
      ref={ref}
      className="card"
      layout={layout}
      layoutId={layout ? `card-${p.id}` : undefined}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      style={HOVERABLE ? { rotateX: sX, rotateY: sY, transformPerspective: 900 } : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => onOpen(p)}
      data-hover
    >
      <div className="card-media">
        {p.media.type === 'split' ? (
          <div className="media-split">
            {p.media.srcs.map((s) => <Media key={s} src={s} alt={p.title} />)}
          </div>
        ) : p.media.type === 'video' ? (
          <video src={p.media.src} poster={p.media.poster} muted loop playsInline preload="none"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => e.currentTarget.pause()} />
        ) : (
          <Media src={p.media.src} alt={p.title} />
        )}
      </div>
      <div className="card-body">
        <span className="card-cat">{p.cat}</span>
        <h4 className="card-title">{p.title}</h4>
        <p className="card-desc">{p.desc}</p>
        <div className="card-foot">
          <span>{p.year}</span>
          <span className="card-arrow"><ArrowUpRight size={14} /></span>
        </div>
      </div>
      <div className="card-spec" aria-hidden="true" />
    </motion.article>
  )
}
