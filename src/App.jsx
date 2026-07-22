import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Backdrop from './components/Backdrop'
import AiLayers from './components/AiLayers'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Footer from './components/Footer'
import StatusHud from './components/StatusHud'
import Terminal from './components/Terminal'
import Home from './pages/Home'
import Archive from './pages/Archive'
import Resume from './pages/Resume'
import NotFound from './pages/NotFound'

export default function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('mra-booted') === '1')
  const reduced = useReducedMotion()
  const location = useLocation()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  // Smooth scroll
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.0 })
    let raf
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [reduced])

  // Scroll restoration between routes
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('is-loading', !booted)
  }, [booted])

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <AiLayers />
      <Backdrop />
      <div className="vignette" aria-hidden="true" />
      <Cursor />
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <AnimatePresence>
        {!booted && (
          <Preloader onDone={() => { sessionStorage.setItem('mra-booted', '1'); setBooted(true) }} />
        )}
      </AnimatePresence>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home ready={booted} />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <StatusHud />
      <Terminal />
    </>
  )
}
