import { useEffect, useState } from 'react'
import { ArrowUpRight, GitBranch, Star } from 'lucide-react'
import { GH_FALLBACK } from '../data/projects'
import Reveal from './Reveal'

export default function GitHubFeed() {
  const [repos, setRepos] = useState(GH_FALLBACK)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/users/Manas-arumalla/repos?per_page=100&sort=pushed')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        // hide forks, the portfolio's own repos, and the profile readme repo
        const hidden = ['portfolio', 'manas-arumalla.github.io', 'manas-arumalla']
        const top = data.filter((r) => !r.fork && !hidden.includes(r.name.toLowerCase())).slice(0, 6)
        if (top.length) { setRepos(top); setLive(true) }
      })
      .catch(() => {}) // keep fallback
    return () => { cancelled = true }
  }, [])

  return (
    <section id="github">
      <div className="wrap">
        <div className="section-head">
          <Reveal><span className="kicker"><span className="idx">06</span> Open source</span></Reveal>
          <Reveal delay={0.08}><h2 className="h-section">The lab notebook<br />is public.</h2></Reveal>
          <Reveal delay={0.16}>
            <p className="lead">{live ? 'Live from the GitHub API — most recently active repositories.' : 'Most recently active repositories.'}</p>
          </Reveal>
        </div>
        <div className="gh-grid">
          {repos.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.06}>
              <a className="repo" href={r.html_url} target="_blank" rel="noopener noreferrer" style={{ height: '100%' }} data-hover>
                <span className="name"><GitBranch size={13} /> {r.name}</span>
                <span className="desc">{r.description || '—'}</span>
                <span className="meta">
                  {r.language && <span className="lang">{r.language}</span>}
                  {r.stargazers_count > 0 && <span><Star size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> {r.stargazers_count}</span>}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <div className="gh-foot">
          <a className="btn" href="https://github.com/Manas-arumalla" target="_blank" rel="noopener noreferrer">
            github.com/Manas-arumalla <span className="arrow"><ArrowUpRight size={14} /></span>
          </a>
        </div>
      </div>
    </section>
  )
}
