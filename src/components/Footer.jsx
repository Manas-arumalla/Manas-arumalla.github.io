export default function Footer() {
  return (
    <footer className="site-foot" style={{ justifyContent: 'center' }}>
      <button
        className="foot-term"
        onClick={() => window.dispatchEvent(new CustomEvent('mra:terminal-toggle'))}
        data-hover
      >
        press <b>`</b> for the MRA·OS shell
      </button>
    </footer>
  )
}
