import { useState, useEffect, useRef } from 'react'
import { CheckIcon, ShareIcon } from './icons/Icons'
import './BookingConfirmation.css'

/**
 * SCREEN 7: Booking Confirmation / Receipt
 * Choreographed entry animation sequence:
 * 1. Screen fades in → 2. Circle scales with spring → 3. Checkmark draws
 * 4. Confetti bursts → 5. Text fades up
 * Receipt card with booking details.
 */
export default function BookingConfirmation({ booking, onBackHome }) {
  const [stage, setStage] = useState(0) // 0=enter, 1=circle, 2=check, 3=confetti, 4=text
  const [confettiParts, setConfettiParts] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 100),    // circle
      setTimeout(() => setStage(2), 600),    // checkmark
      setTimeout(() => {                      // confetti
        setStage(3)
        generateConfetti()
      }, 1000),
      setTimeout(() => setStage(4), 1200),   // text
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  function generateConfetti() {
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360 + Math.random() * 30 - 15,
      distance: 60 + Math.random() * 40,
      size: 4 + Math.random() * 4,
      isSquare: i % 3 === 0,
      color: i % 2 === 0 ? 'var(--brand-primary)' : 'var(--text-100)',
      duration: 600 + Math.random() * 400,
    }))
    setConfettiParts(particles)
  }

  function handleShare() {
    const text = `✅ Booking Confirmed!\nService: ${booking?.service || 'Service'}\nProvider: ${booking?.provider || 'Provider'}\nTime: ${booking?.time || 'TBD'}\nRef: ${booking?.id || 'REQ-2026-XXX'}\n\nBooked via RabbitaAI 🐇`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Default demo booking data
  const b = booking || {
    id: 'REQ-2026-001',
    service: 'Plumber',
    provider: 'Ahmed Plumbing Services',
    time: 'Today, 4:00 PM',
    location: 'DHA Phase 5, Lahore',
    bookedVia: 'WhatsApp',
    bookedAt: new Date().toLocaleString(),
  }

  return (
    <div className="confirmation-screen" id="confirmation-screen">
      {/* Success indicator */}
      <div className="confirmation-hero">
        <div className={`confirmation-circle ${stage >= 1 ? 'visible' : ''}`}>
          <svg className={`confirmation-check ${stage >= 2 ? 'drawn' : ''}`} viewBox="0 0 52 52">
            <polyline
              points="16 27 23 34 36 19"
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset={stage >= 2 ? 0 : 40}
            />
          </svg>
          
          {/* Confetti particles */}
          {stage >= 3 && confettiParts.map((p) => (
            <div
              key={p.id}
              className="confetti-particle"
              style={{
                '--angle': `${p.angle}deg`,
                '--distance': `${p.distance}px`,
                '--size': `${p.size}px`,
                '--duration': `${p.duration}ms`,
                width: p.size,
                height: p.size,
                borderRadius: p.isSquare ? '1px' : '50%',
                background: p.color,
              }}
            />
          ))}
        </div>

        {/* Confirmation text */}
        <div className={`confirmation-text ${stage >= 4 ? 'visible' : ''}`}>
          <h1 className="confirmation-title">Booked!</h1>
          <p className="confirmation-provider">{b.provider}</p>
          <p className="confirmation-time">{b.time}</p>
        </div>
      </div>

      {/* Receipt card */}
      <div className={`confirmation-receipt ${stage >= 4 ? 'visible' : ''}`}>
        <div className="receipt-header">
          <span className="caps-label">Booking Receipt</span>
          <span className="receipt-id mono">{b.id}</span>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-rows">
          <div className="receipt-row">
            <span className="receipt-label">Service</span>
            <span className="receipt-value">{b.service}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Provider</span>
            <span className="receipt-value">{b.provider}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Time</span>
            <span className="receipt-value">{b.time}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Location</span>
            <span className="receipt-value">{b.location}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Booked via</span>
            <span className="receipt-value receipt-whatsapp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--success)">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              WhatsApp
            </span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Booked at</span>
            <span className="receipt-value">{b.bookedAt}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={`confirmation-actions ${stage >= 4 ? 'visible' : ''}`}>
        <button className="btn-primary" onClick={onBackHome} type="button" id="back-home-btn">
          Back to Home
        </button>
        <button className="btn-ghost" onClick={handleShare} type="button" id="share-receipt-btn">
          <ShareIcon size={16} color="var(--text-90)" />
          <span>{copied ? 'Copied!' : 'Share Receipt'}</span>
        </button>
      </div>
    </div>
  )
}
