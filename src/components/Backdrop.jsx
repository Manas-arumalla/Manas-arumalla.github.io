import { useEffect, useRef } from 'react'

// Generative, scroll-reactive backdrop: a drifting flow-field of particle
// streams plus parallax blueprint rings. Pure code — no AI media, no network.
// Scroll velocity injects energy into the field; everything is low-alpha so
// content stays readable. Skipped entirely under prefers-reduced-motion.
export default function Backdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    let raf, w, h
    let scrollY = window.scrollY
    let scrollVel = 0
    let energy = 0

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5)
    const fit = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * DPR)
      canvas.height = Math.round(h * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)

    const onScroll = () => {
      const y = window.scrollY
      scrollVel = y - scrollY
      scrollY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // particles flowing along a pseudo-noise field
    const N = Math.min(130, Math.round((w * h) / 14000))
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      life: Math.random() * 240,
      accent: Math.random() < 0.06,
    }))
    const field = (x, y, t) => {
      // cheap layered trig "noise" — stable, no allocations
      const s = 0.0016
      return (
        Math.sin(x * s * 1.3 + t * 0.12 + Math.sin(y * s * 2.1)) +
        Math.cos(y * s * 1.7 - t * 0.09) * 0.8 +
        Math.sin((x + y) * s * 0.6 + t * 0.05) * 0.5
      )
    }

    // blueprint rings (parallax with scroll)
    const rings = Array.from({ length: 5 }, (_, i) => ({
      x: (0.15 + 0.2 * i) * w + (Math.random() - 0.5) * 80,
      depth: 0.12 + i * 0.05,
      r: 90 + Math.random() * 180,
      seg: 1 + (Math.random() * 3 | 0),
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.06,
    }))

    let t = 0
    let visible = true
    document.addEventListener('visibilitychange', () => { visible = !document.hidden })

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      t += 0.016
      energy += (Math.min(Math.abs(scrollVel), 60) / 60 - energy) * 0.06
      scrollVel *= 0.8

      ctx.clearRect(0, 0, w, h)

      // rings
      ctx.lineWidth = 1
      rings.forEach((g) => {
        const y = ((g.depth * -scrollY) % (h + 2 * g.r)) + h * 0.75
        const yy = y < -g.r ? y + h + 2 * g.r : y
        g.rot += g.spin * 0.016 * (1 + energy * 3)
        ctx.strokeStyle = `rgba(154,163,171,${0.05 + energy * 0.05})`
        ctx.beginPath(); ctx.arc(g.x, yy, g.r, g.rot, g.rot + Math.PI / g.seg); ctx.stroke()
        ctx.strokeStyle = `rgba(255,77,0,${0.04 + energy * 0.08})`
        ctx.beginPath(); ctx.arc(g.x, yy, g.r * 0.82, -g.rot * 1.4, -g.rot * 1.4 + 0.7); ctx.stroke()
      })

      // flow particles
      const speed = 14 + energy * 90
      parts.forEach((p) => {
        const a = field(p.x, p.y + scrollY * 0.25, t) * Math.PI
        const nx = p.x + Math.cos(a) * speed * 0.016
        const ny = p.y + Math.sin(a) * speed * 0.016 + energy * 1.6
        ctx.strokeStyle = p.accent
          ? `rgba(255,77,0,${0.16 + energy * 0.25})`
          : `rgba(235,240,245,${0.05 + energy * 0.07})`
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        p.x = nx; p.y = ny
        p.life -= 1 + energy * 2
        if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          p.x = Math.random() * w
          p.y = Math.random() * h
          p.life = 140 + Math.random() * 160
        }
      })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return <canvas className="backdrop" ref={ref} aria-hidden="true" />
}
