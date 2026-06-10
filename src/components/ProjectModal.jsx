import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowUpRight } from 'lucide-react'

export default function ProjectModal({ p, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const hero = p.modalMedia || p.media

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={p.title}
    >
      {/* data-lenis-prevent: let the modal scroll natively instead of Lenis hijacking the wheel */}
      <motion.div
        className="modal"
        data-lenis-prevent
        layoutId={`card-${p.id}`}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close" data-hover><X size={16} /></button>
        <div className="modal-media">
          {hero.type === 'split' ? (
            <div className="media-split">
              {hero.srcs.map((s) => <img key={s} src={s} alt={p.title} />)}
            </div>
          ) : hero.type === 'video' ? (
            <video src={hero.src} poster={hero.poster} muted loop autoPlay playsInline />
          ) : (
            <img src={hero.src} alt={p.title} />
          )}
        </div>
        <div className="modal-body">
          <span className="card-cat">{p.cat} · {p.year}</span>
          <h3>{p.title}</h3>
          <p className="desc">{p.desc}</p>
          <h6>What it does</h6>
          <ul className="points">{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          {p.gallery?.length > 0 && (
            <>
              <h6>In action</h6>
              <div className="modal-gallery">
                {p.gallery.map((g) => (
                  <figure key={g.src}>
                    <img src={g.src} alt={g.cap} loading="lazy" />
                    <figcaption>{g.cap}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
          <h6>Stack</h6>
          <div className="chips">{p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
          {p.github && (
            <div style={{ marginTop: '1.8rem' }}>
              <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">
                {p.linkLabel || 'View on GitHub'} <span className="arrow"><ArrowUpRight size={14} /></span>
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
