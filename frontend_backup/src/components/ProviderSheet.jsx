import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, StarIcon, LocationPin, WhatsAppIcon, LockIcon } from './icons/Icons'
import './ProviderSheet.css'

/**
 * SCREEN 5: Provider Selection — iOS-style bottom sheet
 * Slides up from bottom. Drag handle to dismiss.
 * Provider details, rating, privacy note, Book via WhatsApp button.
 */
export default function ProviderSheet({ provider, onBook, onClose }) {
  const [visible, setVisible] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)
  const sheetRef = useRef(null)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => onClose?.(), 350)
  }

  function handleTouchStart(e) {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }

  function handleTouchMove(e) {
    if (!dragging) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0) setDragY(diff)
  }

  function handleTouchEnd() {
    setDragging(false)
    if (dragY > 120) {
      handleDismiss()
    } else {
      setDragY(0)
    }
  }

  if (!provider) return null

  return (
    <div className={`sheet-overlay ${visible ? 'visible' : ''}`} onClick={handleDismiss}>
      <div
        className={`sheet-container ${visible ? 'visible' : ''}`}
        ref={sheetRef}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="sheet-handle-area">
          <div className="sheet-handle" />
        </div>

        {/* Provider header */}
        <div className="sheet-header">
          <h2 className="sheet-provider-name">{provider.name}</h2>
          <p className="sheet-provider-meta">
            {provider.category} · {provider.distance}
          </p>
        </div>

        {/* Rating card */}
        <div className="sheet-rating-card">
          <div className="sheet-rating-main">
            <StarIcon size={24} filled color="var(--warning)" />
            <span className="sheet-rating-number">{provider.rating}</span>
          </div>
          <span className="sheet-rating-source">Based on Google reviews</span>
        </div>

        {/* Details */}
        <div className="sheet-details">
          <div className="sheet-detail-row">
            <LocationPin size={16} color="var(--text-70)" />
            <span className="sheet-detail-text">{provider.address || 'Near your area'}</span>
          </div>
          {provider.phone && (
            <div className="sheet-detail-row">
              <span className="sheet-detail-icon">📞</span>
              <div className="sheet-detail-col">
                <span className="sheet-detail-text">{provider.phone}</span>
                <span className="sheet-detail-note">We'll contact them on your behalf</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="sheet-actions">
          <button className="btn-primary sheet-book-btn" onClick={() => onBook?.(provider)} type="button" id="book-whatsapp-btn">
            <WhatsAppIcon size={20} color="var(--text-inverse)" />
            <span>Book via WhatsApp →</span>
          </button>
          <button className="btn-ghost" onClick={handleDismiss} type="button">
            ← See other options
          </button>
        </div>

        {/* Privacy note */}
        <div className="sheet-privacy">
          <LockIcon size={12} color="var(--text-70)" />
          <span>Your address and phone are only shared with your explicit permission.</span>
        </div>
      </div>
    </div>
  )
}
