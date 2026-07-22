import { useEffect } from 'react'

const ORIGIN = 'https://manas-arumalla.github.io'

// Per-route SEO: title, meta description, canonical (and optional noindex).
export default function Seo({ title, description, path = '/', noindex = false }) {
  useEffect(() => {
    document.title = title

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    desc.setAttribute('content', description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', ORIGIN + path)

    let robots = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex')
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, path, noindex])
  return null
}
