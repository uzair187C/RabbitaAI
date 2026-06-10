import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import { ArrowLeft, LocationPin, StarIcon } from './icons/Icons'
import './ProfileSetup.css'

const phoneRe = /^3[0-9]{9}$/

/**
 * SCREEN 3: Profile Setup
 * Two-step wizard with Apple-style transitions between steps.
 * Step 1: Name, Phone (+92 pill), Area (with location button)
 * Step 2: Radius slider, Price range pills, Star rating
 */
export default function ProfileSetup({ user, onComplete, isEditing = false }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [defaultArea, setDefaultArea] = useState('')
  const [radiusKm, setRadiusKm] = useState(5)
  const [priceRange, setPriceRange] = useState('mid')
  const [minRating, setMinRating] = useState(4)
  const [saving, setSaving] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [locating, setLocating] = useState(false)
  const [starAnimating, setStarAnimating] = useState(null)
  const contentRef = useRef(null)

  const step1Valid = name.trim().length >= 2 && phoneRe.test(phone)

  function goToStep2() {
    setTransitioning(true)
    setTimeout(() => {
      setStep(2)
      setTransitioning(false)
    }, 250)
  }

  function goToStep1() {
    setTransitioning(true)
    setTimeout(() => {
      setStep(1)
      setTransitioning(false)
    }, 250)
  }

  function handleLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Try to reverse-geocode with a simple fetch
          const { latitude, longitude } = pos.coords
          setDefaultArea(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } catch {
          // fallback
        }
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 5000 }
    )
  }

  function handleStarClick(rating) {
    setStarAnimating(rating)
    setMinRating(rating)
    setTimeout(() => setStarAnimating(null), 200)
  }

  async function save() {
    setSaving(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: `+92${phone}`,
          preferences: { radiusKm, priceRange, minRating, defaultArea },
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      onComplete(updated)
      if (!isEditing) {
        navigate('/home', { replace: true })
      } else {
        alert('Profile saved successfully!')
      }
    } catch {
      // Show error without alert — use a toast in production
      alert('Could not save profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const radiusPercent = ((radiusKm - 1) / 24) * 100

  return (
    <div className="setup-screen" id="profile-setup-screen">
      {/* Header */}
      <div className="setup-header">
        {step === 2 && (
          <button className="setup-back-btn" onClick={goToStep1} type="button" aria-label="Go back">
            <ArrowLeft size={20} color="var(--text-90)" />
          </button>
        )}
        <h1 className="setup-title">Set up your profile</h1>
      </div>

      {/* Progress indicator */}
      <div className="setup-progress">
        <div className={`setup-progress-dot ${step >= 1 ? 'active' : ''}`} />
        <div className="setup-progress-line">
          <div className="setup-progress-fill" style={{ width: step >= 2 ? '100%' : '0%' }} />
        </div>
        <div className={`setup-progress-dot ${step >= 2 ? 'active' : ''}`} />
      </div>

      {/* Content area */}
      <div
        className={`setup-content ${transitioning ? (step === 1 ? 'slide-out-left' : 'slide-out-right') : 'slide-in'}`}
        ref={contentRef}
      >
        {step === 1 ? (
          <div className="setup-step-content screen-enter">
            {/* Name */}
            <div className="setup-field">
              <label className="caps-label" htmlFor="setup-name">YOUR NAME</label>
              <div className="setup-input-wrapper">
                <input
                  id="setup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="setup-input"
                />
                {user?.email && (
                  <span className="setup-input-badge" title="From Google">G</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="setup-field">
              <label className="caps-label" htmlFor="setup-phone">PHONE NUMBER</label>
              <div className="setup-input-wrapper setup-phone-wrapper">
                <div className="setup-phone-prefix">
                  <span>🇵🇰</span>
                  <span>+92</span>
                </div>
                <input
                  id="setup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="3XX XXXXXXX"
                  className="setup-input setup-phone-input"
                />
              </div>
            </div>

            {/* Area */}
            <div className="setup-field">
              <label className="caps-label" htmlFor="setup-area">YOUR AREA</label>
              <div className="setup-input-wrapper">
                <input
                  id="setup-area"
                  type="text"
                  value={defaultArea}
                  onChange={(e) => setDefaultArea(e.target.value)}
                  placeholder="e.g. DHA Phase 5, Lahore"
                  className="setup-input"
                />
                <button
                  className={`setup-location-btn ${locating ? 'pulsing' : ''}`}
                  onClick={handleLocation}
                  type="button"
                  aria-label="Get my location"
                >
                  <LocationPin size={16} color={locating ? 'var(--brand-primary)' : 'var(--text-70)'} />
                </button>
              </div>
            </div>

            {/* Next button */}
            <button
              type="button"
              className="btn-primary setup-next-btn"
              disabled={!step1Valid}
              onClick={goToStep2}
            >
              Next →
            </button>
          </div>
        ) : (
          <div className="setup-step-content screen-enter">
            {/* Radius slider */}
            <div className="setup-field">
              <label className="caps-label">SEARCH RADIUS</label>
              <div className="setup-slider-container">
                <div className="setup-slider-badge" style={{ left: `calc(${radiusPercent}% + ${12 - radiusPercent * 0.24}px)` }}>
                  {radiusKm} km
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(+e.target.value)}
                  className="setup-range"
                  style={{
                    background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${radiusPercent}%, var(--layer-3) ${radiusPercent}%, var(--layer-3) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Price range pills */}
            <div className="setup-field">
              <label className="caps-label">PRICE RANGE</label>
              <div className="setup-pills">
                {['budget', 'mid', 'premium'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`setup-pill ${priceRange === p ? 'active' : ''}`}
                    onClick={() => setPriceRange(p)}
                  >
                    {p === 'budget' ? '💰 Budget' : p === 'mid' ? '⚖️ Mid-range' : '✨ Premium'}
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating */}
            <div className="setup-field">
              <label className="caps-label">MINIMUM RATING</label>
              <div className="setup-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`setup-star ${starAnimating === star ? 'pop' : ''}`}
                    onClick={() => handleStarClick(star)}
                    aria-label={`${star} stars`}
                  >
                    <StarIcon
                      size={28}
                      filled={star <= minRating}
                      color={star <= minRating ? 'var(--brand-primary)' : 'var(--layer-3)'}
                    />
                  </button>
                ))}
                <span className="setup-star-label">{minRating}+ stars</span>
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              className="btn-primary setup-save-btn"
              disabled={saving}
              onClick={save}
            >
              {saving ? 'Saving…' : "Let's go →"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
