// Renders a silent looping video for .mp4/.webm sources, an <img> otherwise.
// Lets converted GIF→MP4 clips (≈10× smaller) drop in anywhere an image was used.
export default function Media({ src, alt = '', ...rest }) {
  if (/\.(mp4|webm)$/i.test(src)) {
    return <video src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt} {...rest} />
  }
  return <img src={src} alt={alt} loading="lazy" {...rest} />
}
