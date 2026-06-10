import { useState, useEffect } from 'react'
import RabbitaLogo from './icons/RabbitaLogo'

/**
 * SCREEN 1: Splash Screen
 * Displays for 1.2s while Firebase initializes, then crossfades out.
 * Background: layer-0 (deepest). Rabbit logo with radial glow. 
 * Three dots pulse calmly in sequence.
 */
export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1200)
    const cleanup = setTimeout(() => onFinish?.(), 1600)
    return () => {
      clearTimeout(timer)
      clearTimeout(cleanup)
    }
  }, [onFinish])

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`} id="splash-screen">
      <div className="splash-logo-container">
        <div className="splash-glow" />
        <RabbitaLogo size={56} color="var(--brand-primary)" className="splash-logo" />
      </div>
      <span className="splash-name">RabbitaAI</span>
      <div className="splash-dots">
        <div className="splash-dot" />
        <div className="splash-dot" />
        <div className="splash-dot" />
      </div>
    </div>
  )
}
