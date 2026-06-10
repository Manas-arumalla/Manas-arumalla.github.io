import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, FileText, ArrowUpRight, Copy, Check, MapPin } from 'lucide-react'
import Reveal from './Reveal'

const EMAIL = 'manasreddyarumalla@gmail.com'

const CHANNELS = [
  {
    icon: <Github size={20} />,
    label: 'GitHub',
    handle: '@Manas-arumalla',
    sub: '16+ open-source robotics systems',
    href: 'https://github.com/Manas-arumalla',
  },
  {
    icon: <Linkedin size={20} />,
    label: 'LinkedIn',
    handle: 'manas-reddy',
    sub: 'Experience, roles & recommendations',
    href: 'https://www.linkedin.com/in/manas-reddy/',
  },
  {
    icon: <Mail size={20} />,
    label: 'Email',
    handle: EMAIL,
    sub: 'The fastest channel — straight to me',
    href: `mailto:${EMAIL}`,
    copyable: true,
  },
  {
    icon: <FileText size={20} />,
    label: 'Resume',
    handle: 'PDF · 2 pages',
    sub: 'Everything on one sheet',
    href: '/assets/Manas_Reddy_Arumalla_Resume.pdf',
  },
]

function Channel({ c, i }) {
  const [copied, setCopied] = useState(false)
  const copy = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard?.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <Reveal delay={0.08 + i * 0.07}>
      <motion.a
        className="channel"
        href={c.href}
        target={c.href.startsWith('mailto') ? undefined : '_blank'}
        rel="noopener noreferrer"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        data-hover
      >
        <span className="ch-icon">{c.icon}</span>
        <span className="ch-body">
          <b>{c.label}</b>
          <span className="ch-handle">{c.handle}</span>
          <span className="ch-sub">{c.sub}</span>
        </span>
        <span className="ch-actions">
          {c.copyable && (
            <button className="ch-copy" onClick={copy} aria-label="Copy email address" data-hover>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <i>{copied ? 'COPIED' : 'COPY'}</i>
            </button>
          )}
          <span className="ch-arrow"><ArrowUpRight size={15} /></span>
        </span>
      </motion.a>
    </Reveal>
  )
}

export default function Contact() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(
      new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Berlin' }).format(new Date()) + ' CET'
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <Reveal><span className="kicker"><span className="idx">09</span> Transmission</span></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h-display" style={{ marginTop: '1.6rem' }}>
            <a href={`mailto:${EMAIL}`} data-hover>Let&apos;s build<br />robots<span style={{ color: 'var(--accent)' }}>.</span></a>
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lead" style={{ marginTop: '1.6rem' }}>
            Open to robotics engineering roles, research collaborations, and hard control problems.
          </p>
        </Reveal>

        <div className="contact-channels">
          {CHANNELS.map((c, i) => <Channel key={c.label} c={c} i={i} />)}
        </div>

        <Reveal delay={0.2}>
          <div className="contact-coords">
            <span className="coord"><MapPin size={12} /> Nürnberg, Germany</span>
            <span className="coord"><MapPin size={12} /> Hyderabad, India</span>
            <span className="coord mono">{time}</span>
            <span className="coord mono" style={{ color: 'var(--ok)' }}>● ACCEPTING TRANSMISSIONS</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
