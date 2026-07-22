import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Briefing from '../components/Briefing'
import Award from '../components/Award'
import Flagship from '../components/Flagship'
import ArchivePreview from '../components/ArchivePreview'
import Timeline from '../components/Timeline'
import Research from '../components/Research'
import GitHubFeed from '../components/GitHubFeed'
import Skills from '../components/Skills'
import Philosophy from '../components/Philosophy'
import Contact from '../components/Contact'

export default function Home({ ready }) {
  const { hash } = useLocation()

  // support /#section deep links (e.g. from the Archive page nav)
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <Seo
        title="Manas Reddy Arumalla — Robotics & Control Engineer"
        description="Robotics & control engineer — MSc Autonomy Technologies, FAU Erlangen-Nürnberg. Portfolio with live control simulations: vision-based drone landing, bimanual manipulation, 15+ benchmarked controllers. IEEE ICRM 2025 author."
        path="/"
      />
      <Hero ready={ready} />
      <Marquee />
      <Briefing />
      <Award />
      <Flagship />
      <ArchivePreview />
      <Timeline />
      <Research />
      <GitHubFeed />
      <Skills />
      <Philosophy />
      <Contact />
    </>
  )
}
