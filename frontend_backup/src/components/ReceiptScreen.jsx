import { useEffect, useState } from 'react'
import './ReceiptScreen.css'

const CHECK_PATH_LENGTH = 40

function buildShareText(receipt) {
  return [
    '✅ Booked via RabbitaAI!',
    `Service: ${receipt.service}`,
    `Provider: ${receipt.provider}`,
    `Time: ${receipt.time}`,
    `Location: ${receipt.location}`,
    `Ref: ${receipt.requestId}`,
  ].join('\n')
}

export default function ReceiptScreen({ receipt, onBackHome }) {
  const [checkOffset, setCheckOffset] = useState(CHECK_PATH_LENGTH)

  const r = receipt || {
    requestId: 'REQ-00000',
    service: 'Service',
    provider: 'Provider',
    time: 'TBD',
    location: 'Your area',
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCheckOffset(0))
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleShareWhatsApp() {
    const text = encodeURIComponent(buildShareText(r))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="receipt-screen" id="receipt-screen">
      <div className="receipt-hero">
        <div className="receipt-check-circle">
          <svg className="receipt-check-svg" viewBox="0 0 52 52" aria-hidden="true">
            <polyline
              className="receipt-check-path"
              points="16 27 23 34 36 19"
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_PATH_LENGTH}
              strokeDashoffset={checkOffset}
              style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
            />
          </svg>
        </div>
        <h1 className="receipt-title">Booked!</h1>
        <p className="receipt-provider-name">{r.provider}</p>
      </div>

      <div className="receipt-card">
        <div className="receipt-row">
          <span className="receipt-label">Service</span>
          <span className="receipt-value">{r.service}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Provider</span>
          <span className="receipt-value receipt-value-brand">{r.provider}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Time</span>
          <span className="receipt-value">{r.time}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Location</span>
          <span className="receipt-value">{r.location}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-label">Request ID</span>
          <span className="receipt-value mono">{r.requestId}</span>
        </div>
      </div>

      <div className="receipt-actions">
        <button className="btn-primary receipt-btn" type="button" onClick={onBackHome}>
          Back to Home
        </button>
        <button className="btn-ghost receipt-btn" type="button" onClick={handleShareWhatsApp}>
          Share via WhatsApp
        </button>
      </div>
    </div>
  )
}
