import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// AI-generated backdrops crossfading per section. Layers with an .mp4 src are
// "living" backdrops: the video mounts only once its section first activates
// (poster still shows meanwhile), so idle sections never download video.
// Reduced-motion users always get the stills.
const LAYERS = [
  // story arc: briefing (mission map) → hackathons → flagship (drone descent) →
  // journey…skills (humanoid) → contact (swarm). Each layer holds until the next begins.
  { section: '#briefing', src: '/assets/ai/planner-loop.mp4', still: '/assets/ai/planner.jpg' },
  { section: '#award', src: '/assets/ai/dog-loop.mp4', still: '/assets/ai/dog.jpg' },
  { section: '#work', src: '/assets/ai/drone-loop.mp4', still: '/assets/ai/drone.jpg' },
  { section: '#journey', src: '/assets/ai/humanoid-loop.mp4', still: '/assets/ai/humanoid.jpg' }, // carries through research/skills
  { section: '#skills', src: '/assets/ai/swarm-loop.mp4', still: '/assets/ai/swarm.jpg' }, // carries through philosophy + contact
]

const CONTACT_IDX = LAYERS.findIndex((l) => l.section === '#skills') // swarm layer — archive ambient

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function AiLayers() {
  const [active, setActive] = useState(-1)
  const [woken, setWoken] = useState(() => new Set()) // layers whose video has been mounted
  const { pathname } = useLocation()
  const rafRef = useRef(null)

  useEffect(() => {
    // archive page has no sections — give it the swarm layer as ambient
    if (pathname !== '/') {
      if (pathname === '/archive') {
        setActive(CONTACT_IDX)
        if (LAYERS[CONTACT_IDX].src.endsWith('.mp4')) setWoken((w) => (w.has(CONTACT_IDX) ? w : new Set(w).add(CONTACT_IDX)))
      } else {
        setActive(-1)
      }
      return
    }
    const update = () => {
      rafRef.current = null
      const probe = window.scrollY + window.innerHeight * 0.55
      let idx = -1
      LAYERS.forEach((l, i) => {
        const el = document.querySelector(l.section)
        if (el && el.offsetTop <= probe) idx = i
      })
      setActive(idx)
      if (idx >= 0 && LAYERS[idx].src.endsWith('.mp4')) {
        setWoken((w) => (w.has(idx) ? w : new Set(w).add(idx)))
      }
    }
    const onScroll = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [pathname])

  return (
    <div aria-hidden="true">
      {LAYERS.map((l, i) => {
        const cls = `ai-layer${active === i ? ' active' : ''}`
        const isLiveVideo = l.src.endsWith('.mp4') && !REDUCED && woken.has(i)
        if (isLiveVideo) {
          return <video key={l.src} className={cls} src={l.src} poster={l.still} autoPlay muted loop playsInline preload="none" />
        }
        return <img key={l.src} className={cls} src={l.still || l.src} alt="" loading="lazy" />
      })}
    </div>
  )
}
