import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
