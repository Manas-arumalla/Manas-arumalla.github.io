import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// AI-generated backdrop frames (Higgsfield, prompts in docs) crossfading per
// section as you scroll the home page. Low opacity + radial mask keeps content
// readable; on routes without these sections nothing shows.
const LAYERS = [
  { section: '#work', src: '/assets/ai/planner.jpg' }, // the hero video already owns the arm motif

  { section: '#journey', src: '/assets/ai/drone.jpg' },
  { section: '#research', src: '/assets/ai/humanoid.jpg' }, // carries through #skills
  { section: '#contact', src: '/assets/ai/swarm.jpg' },
]

export default function AiLayers() {
  const [active, setActive] = useState(-1)
  const { pathname } = useLocation()

  useEffect(() => {
    // archive page has no sections — give it the swarm frame as a static ambient
    if (pathname !== '/') { setActive(pathname === '/archive' ? 3 : -1); return }
    let raf = null
    const update = () => {
      raf = null
      const probe = window.scrollY + window.innerHeight * 0.55
      let idx = -1
      LAYERS.forEach((l, i) => {
        const el = document.querySelector(l.section)
        if (el && el.offsetTop <= probe) idx = i
      })
      // fade out again once past the contact section's end
      setActive(idx)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [pathname])

  return (
    <div aria-hidden="true">
      {LAYERS.map((l, i) => (
        <img key={l.src} src={l.src} alt="" className={`ai-layer${active === i ? ' active' : ''}`} loading="lazy" />
      ))}
    </div>
  )
}
