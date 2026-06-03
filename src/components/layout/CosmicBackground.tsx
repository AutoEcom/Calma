/** Ambient cosmic layer — three star scales in dark mode; soft veil in light. */
export function CosmicBackground() {
  return (
    <div className="cosmic-sky" aria-hidden>
      <div className="cosmic-stars cosmic-stars-small" />
      <div className="cosmic-stars cosmic-stars-medium" />
      <div className="cosmic-stars cosmic-stars-large" />
      <div className="cosmic-nebula" />
    </div>
  )
}
