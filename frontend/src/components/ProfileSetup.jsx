import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import './ProfileSetup.css'

const phoneRe = /^[+]?[0-9]{10,15}$/

const PRICE_OPTIONS = [
  { value: 'budget', label: '💰 Budget' },
  { value: 'mid', label: '✨ Mid' },
  { value: 'premium', label: '👑 Premium' },
]

const TIMING_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Late Night', 'Any time']

const LANGUAGES = [
  { code: 'English', label: '🇺🇸 English (Default)' },
  { code: 'Urdu', label: '🇵🇰 Urdu' },
  { code: 'Arabic', label: '🇸🇦 Arabic' },
  { code: 'Spanish', label: '🇪🇸 Spanish' },
  { code: 'French', label: '🇫🇷 French' },
  { code: 'Portuguese', label: '🇧🇷 Portuguese' },
  { code: 'Bahasa', label: '🇮🇩 Bahasa' },
  { code: 'Hindi', label: '🇮🇳 Hindi' },
  { code: 'Bengali', label: '🇧🇩 Bengali' },
  { code: 'Russian', label: '🇷🇺 Russian' },
  { code: 'Japanese', label: '🇯🇵 Japanese' },
  { code: 'Korean', label: '🇰🇷 Korean' },
  { code: 'Chinese', label: '🇨🇳 Chinese' },
  { code: 'German', label: '🇩🇪 German' },
  { code: 'Italian', label: '🇮🇹 Italian' },
  { code: 'Turkish', label: '🇹🇷 Turkish' },
  { code: 'Persian', label: '🇮🇷 Persian' },
  { code: 'Swahili', label: '🇰🇪 Swahili' },
  { code: 'Dutch', label: '🇳🇱 Dutch' },
  { code: 'Polish', label: '🇵🇱 Polish' },
  { code: 'Vietnamese', label: '🇻🇳 Vietnamese' },
  { code: 'Thai', label: '🇹🇭 Thai' },
  { code: 'Greek', label: '🇬🇷 Greek' },
  { code: 'Swedish', label: '🇸🇪 Swedish' },
  { code: 'Norwegian', label: '🇳🇴 Norwegian' },
  { code: 'Danish', label: '🇩🇰 Danish' },
  { code: 'Finnish', label: '🇫🇮 Finnish' },
  { code: 'Czech', label: '🇨🇿 Czech' },
  { code: 'Hungarian', label: '🇭🇺 Hungarian' },
  { code: 'Romanian', label: '🇷🇴 Romanian' },
  { code: 'Malay', label: '🇲🇾 Malay' },
  { code: 'Filipino', label: '🇵🇭 Filipino' },
  { code: 'Tamil', label: '🇮🇳 Tamil' },
  { code: 'Telugu', label: '🇮🇳 Telugu' },
  { code: 'Marathi', label: '🇮🇳 Marathi' },
  { code: 'Gujarati', label: '🇮🇳 Gujarati' },
  { code: 'Punjabi', label: '🇮🇳 Punjabi' },
  { code: 'Hausa', label: '🇳🇬 Hausa' },
  { code: 'Yoruba', label: '🇳🇬 Yoruba' },
  { code: 'Zulu', label: '🇿🇦 Zulu' },
  { code: 'Amharic', label: '🇪🇹 Amharic' },
  { code: 'Somali', label: '🇸🇴 Somali' }
]

const COUNTRY_CODES = [
  { code: '+1', label: '🇺🇸/🇨🇦 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+92', label: '🇵🇰 +92' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+880', label: '🇧🇩 +880' },
  { code: '+62', label: '🇮🇩 +62' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+34', label: '🇪🇸 +34' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+82', label: '🇰🇷 +82' },
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+7', label: '🇷🇺 +7' },
  { code: '+55', label: '🇧🇷 +55' },
  { code: '+52', label: '🇲🇽 +52' },
  { code: '+27', label: '🇿🇦 +27' },
  { code: '+234', label: '🇳🇬 +234' },
  { code: '+20', label: '🇪🇬 +20' },
  { code: '+90', label: '🇹🇷 +90' },
  { code: '+65', label: '🇸🇬 +65' },
  { code: '+60', label: '🇲🇾 +60' },
  { code: '+63', label: '🇵🇭 +63' },
  { code: '+66', label: '🇹🇭 +66' },
  { code: '+84', label: '🇻🇳 +84' },
  { code: '+41', label: '🇨🇭 +41' },
  { code: '+46', label: '🇸🇪 +46' },
  { code: '+31', label: '🇳🇱 +31' },
  { code: '+32', label: '🇧🇪 +32' },
  { code: '+45', label: '🇩🇰 +45' },
  { code: '+47', label: '🇳🇴 +47' },
  { code: '+358', label: '🇫🇮 +358' },
  { code: '+48', label: '🇵🇱 +48' },
  { code: '+43', label: '🇦🇹 +43' },
  { code: '+30', label: '🇬🇷 +30' },
  { code: '+351', label: '🇵🇹 +351' },
  { code: '+353', label: '🇮🇪 +353' },
  { code: '+64', label: '🇳🇿 +64' },
  { code: '+54', label: '🇦🇷 +54' },
  { code: '+56', label: '🇨🇱 +56' },
  { code: '+57', label: '🇨🇴 +57' },
  { code: '+51', label: '🇵🇪 +51' },
  { code: '+58', label: '🇻🇪 +58' },
  { code: '+98', label: '🇮🇷 +98' },
  { code: '+964', label: '🇮🇶 +964' },
  { code: '+961', label: '🇱🇧 +961' },
  { code: '+962', label: '🇯🇴 +962' },
  { code: '+965', label: '🇰🇼 +965' },
  { code: '+974', label: '🇶🇦 +974' },
  { code: '+973', label: '🇧🇭 +973' },
  { code: '+968', label: '🇴🇲 +968' },
  { code: '+977', label: '🇳🇵 +977' },
  { code: '+94', label: '🇱🇰 +94' },
  { code: '+95', label: '🇲🇲 +95' },
  { code: '+852', label: '🇭🇰 +852' },
  { code: '+886', label: '🇹🇼 +886' },
  { code: '+212', label: '🇲🇦 +212' },
  { code: '+213', label: '🇩🇿 +213' },
  { code: '+254', label: '🇰🇪 +254' },
  { code: '+255', label: '🇹🇿 +255' },
  { code: '+256', label: '🇺🇬 +256' },
  { code: '+233', label: '🇬🇭 +233' },
  { code: '+221', label: '🇸🇳 +221' },
  { code: '+225', label: '🇨🇮 +225' },
  { code: '+237', label: '🇨🇲 +237' },
  { code: '+244', label: '🇦🇴 +244' },
  { code: '+260', label: '🇿🇲 +260' },
  { code: '+263', label: '🇿🇼 +263' },
  { code: '+258', label: '🇲🇿 +258' },
  { code: '+261', label: '🇲🇬 +261' },
  { code: '+355', label: '🇦🇱 +355' },
  { code: '+374', label: '🇦🇲 +374' },
  { code: '+994', label: '🇦🇿 +994' },
  { code: '+375', label: '🇧🇾 +375' },
  { code: '+387', label: '🇧🇦 +387' },
  { code: '+359', label: '🇧🇬 +359' },
  { code: '+385', label: '🇭🇷 +385' },
  { code: '+420', label: '🇨🇿 +420' },
  { code: '+372', label: '🇪🇪 +372' },
  { code: '+995', label: '🇬🇪 +995' },
  { code: '+36', label: '🇭🇺 +36' },
  { code: '+354', label: '🇮🇸 +354' },
  { code: '+371', label: '🇱🇻 +371' },
  { code: '+370', label: '🇱🇹 +370' },
  { code: '+389', label: '🇲🇰 +389' },
  { code: '+356', label: '🇲🇹 +356' },
  { code: '+373', label: '🇲🇩 +373' },
  { code: '+382', label: '🇲🇪 +382' },
  { code: '+40', label: '🇷🇴 +40' },
  { code: '+381', label: '🇷🇸 +381' },
  { code: '+421', label: '🇸🇰 +421' },
  { code: '+386', label: '🇸🇮 +386' },
  { code: '+380', label: '🇺🇦 +380' }
]

function parsePhone(fullPhone = '') {
  for (const c of COUNTRY_CODES) {
    if (fullPhone.startsWith(c.code)) {
      return { code: c.code, number: fullPhone.slice(c.code.length) }
    }
  }
  return { code: '+92', number: fullPhone.replace(/\D/g, '') }
}

export default function ProfileSetup({ user, onComplete, isEditing = false }) {
  const navigate = useNavigate()
  const initialPhone = parsePhone(user?.phone || '')
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.name || auth.currentUser?.displayName || '')
  const [dialCode, setDialCode] = useState(initialPhone.code)
  const [phone, setPhone] = useState(initialPhone.number)
  const [area, setArea] = useState(user?.preferences?.defaultArea || '')
  const [lat, setLat] = useState(user?.preferences?.defaultLat || null)
  const [lng, setLng] = useState(user?.preferences?.defaultLng || null)
  const [exactAddress, setExactAddress] = useState(user?.preferences?.exactAddress || '')
  const [radiusKm, setRadiusKm] = useState(user?.preferences?.radiusKm || 5)
  const [priceRange, setPriceRange] = useState(user?.preferences?.priceRange || 'mid')
  const [minRating, setMinRating] = useState(user?.preferences?.minRating || 4)
  const [timing, setTiming] = useState(user?.preferences?.timing || [])
  const [languages, setLanguages] = useState(
    Array.isArray(user?.preferences?.languages) ? user.preferences.languages :
    (user?.preferences?.language ? [user.preferences.language] : ['English'])
  )
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [locating, setLocating] = useState(false)
  const [starAnimating, setStarAnimating] = useState(null)
  const [error, setError] = useState('')

  const step1Valid = name.trim().length >= 2 && phoneRe.test(`${dialCode}${phone}`)
  const sliderRef = useRef(null)

  // ── Location ──────────────────────────────────────────────────────────────
  const handleLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setLat(latitude)
        setLng(longitude)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          const addr = data.address
          setArea(addr.suburb || addr.neighbourhood || addr.city_district || addr.city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } catch {
          setArea(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }, [])

  // ── Star rating ───────────────────────────────────────────────────────────
  function handleStar(val) {
    setMinRating(val)
    setStarAnimating(val)
    setTimeout(() => setStarAnimating(null), 250)
  }

  // ── Timing & Language toggles ─────────────────────────────────────────────
  function toggleTiming(t) {
    setTiming((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function toggleLanguage(code) {
    setLanguages((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev // keep at least 1 language
        return prev.filter((c) => c !== code)
      }
      return [...prev, code]
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          phone: `${dialCode}${phone}`,
          bio,
          preferences: { radiusKm, priceRange, minRating, defaultArea: area, defaultLat: lat, defaultLng: lng, exactAddress, timing, language: languages[0], languages },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Could not save profile')
      const updated = await res.json()
      onComplete?.(updated)
      
      setSaved(true)
      setTimeout(() => {
        navigate('/home', { replace: true })
      }, 1500)
    } catch (e) {
      setError(e.message || 'Something went wrong')
      setSaving(false)
    }
  }

  // ── Slider fill style ──────────────────────────────────────────────────────
  const sliderPct = ((radiusKm - 1) / 49) * 100
  const sliderStyle = {
    background: `linear-gradient(to right, var(--brand) ${sliderPct}%, var(--bg-3) ${sliderPct}%)`,
  }

  return (
    <div className="ps-shell" id="profile-setup-screen">

      {/* ── Header ── */}
      <div className="ps-header">
        <h1 className="ps-title">
          {step === 1 ? "Let's get to know you" : 'Your preferences'}
        </h1>
        <p className="ps-subtitle">
          {step === 1 ? "So I can find the best options for you" : "I'll use these for every request"}
        </p>
      </div>

      {/* ── Progress ── */}
      <div className="ps-progress-wrap">
        <div className="ps-progress">
          {[1, 2].map((s, i) => (
            <>
              <div key={s} className={`ps-dot ${step >= s ? 'done' : ''} ${step === s ? 'active' : ''}`} />
              {i < 1 && (
                <div key={`line-${s}`} className="ps-progress-line">
                  <div className="ps-progress-fill" style={{ width: step > s ? '100%' : '0%' }} />
                </div>
              )}
            </>
          ))}
        </div>
        <p className="ps-step-label">
          Step {step} of 2 · {step === 1 ? 'Basic info' : 'Preferences'}
        </p>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="ps-content">
          {/* Name */}
          <div className="ps-field">
            <span className="ps-label">YOUR NAME</span>
            <div className="ps-input-wrap">
              <input
                id="setup-name"
                type="text"
                className="ps-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
              <span className="ps-input-tag">from Google</span>
            </div>
          </div>

          {/* Phone */}
          <div className="ps-field">
            <span className="ps-label">PHONE NUMBER <button type="button" className="ps-info-btn" title="We need your phone number so service providers can contact you directly via WhatsApp for scheduling and confirmations." onClick={() => alert("We need your phone number so service providers can contact you directly via WhatsApp for scheduling and confirmations.")}>ℹ️</button></span>
            <div className="ps-phone-wrap">
              <select 
                className="ps-phone-prefix"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                style={{ border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '12px' }}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                id="setup-phone"
                type="tel"
                className="ps-input ps-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="3001234567"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Location */}
          <div className="ps-field">
            <span className="ps-label">YOUR AREA <button type="button" className="ps-info-btn" title="Your area helps us find the closest and most relevant service providers and businesses near you." onClick={() => alert("Your area helps us find the closest and most relevant service providers and businesses near you.")}>ℹ️</button></span>
            {/* Mini map visual */}
            <div className="ps-map-visual" aria-label="Map pin visual">
              <div className="ps-map-grid" />
              <div className="ps-map-pin">🐇</div>
            </div>
            <div className="ps-location-row">
              <input
                id="setup-area"
                type="text"
                className="ps-input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. DHA Phase 5, Lahore"
              />
              <button
                type="button"
                className={`ps-locate-btn ${locating ? 'locating' : ''}`}
                onClick={handleLocation}
                disabled={locating}
              >
                {locating ? '...' : '📍 Use my location'}
              </button>
            </div>
            {/* Exact address for delivery */}
            <div style={{ marginTop: '8px' }}>
              <span className="ps-label ps-label-sm">EXACT ADDRESS <span className="ps-required">*required</span> <button type="button" className="ps-info-btn" title="Your exact address is shared with providers for deliveries and home services. Without this, we cannot process bookings." onClick={() => alert("Your exact address is shared with providers for deliveries and home services. Without this, we cannot process bookings.")}>ℹ️</button></span>
              <input
                id="setup-exact-address"
                type="text"
                className="ps-input"
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                placeholder="Exact details (e.g. House 42, Street 5)"
              />
            </div>
          </div>

          <button
            id="setup-next-btn"
            type="button"
            className="ps-btn-primary"
            onClick={() => setStep(2)}
            disabled={!step1Valid}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="ps-content">
          {/* Radius slider */}
          <div className="ps-field">
            <span className="ps-label">PREFERRED RADIUS</span>
            <div className="ps-slider-wrap" ref={sliderRef}>
              <div
                className="ps-slider-badge"
                style={{ left: `calc(${sliderPct}% + ${8 - sliderPct * 0.16}px)` }}
              >
                {radiusKm} km
              </div>
              <input
                type="range"
                min="1" max="50" step="1"
                value={radiusKm}
                className="ps-slider"
                style={sliderStyle}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Budget pills */}
          <div className="ps-field">
            <span className="ps-label">BUDGET</span>
            <div className="ps-pills">
              {PRICE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`ps-pill ${priceRange === o.value ? 'active' : ''}`}
                  onClick={() => setPriceRange(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="ps-field">
            <span className="ps-label">MIN RATING</span>
            <div className="ps-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ps-star ${starAnimating === s ? 'pop' : ''}`}
                  onClick={() => handleStar(s)}
                  aria-label={`${s} star`}
                >
                  <span style={{ fontSize: 24, color: s <= minRating ? 'var(--amber)' : 'var(--bg-3)', filter: s <= minRating ? 'none' : 'brightness(0.4)' }}>★</span>
                </button>
              ))}
              <span className="ps-star-label">{minRating}+</span>
            </div>
          </div>

          {/* Timing chips */}
          <div className="ps-field">
            <span className="ps-label">AVAILABILITY</span>
            <div className="ps-chips-scroll">
              {TIMING_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ps-chip ${timing.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleTiming(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Language grid */}
          <div className="ps-field">
            <span className="ps-label">
              LANGUAGE
              <button className="ps-info-btn" type="button" title="RabbitaAI natively understands over 40 languages. You can chat in your preferred language, and the AI will seamlessly translate everything to the local businesses for you!" onClick={() => alert('RabbitaAI natively understands over 40 languages. You can chat in your preferred language, and the AI will seamlessly translate everything to the local businesses for you!')}>ℹ️</button>
            </span>
            <div className="ps-lang-grid">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`ps-lang-btn ${languages.includes(l.code) ? 'active' : ''}`}
                  onClick={() => toggleLanguage(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bio / Personalization */}
          <div className="ps-field">
            <span className="ps-label">
              PERSONAL NOTES
              <button className="ps-info-btn" type="button" title="Tell RabbitaAI about your preferences" onClick={() => alert('Tell RabbitaAI anything useful about you — e.g. "I prefer morning appointments", "I have a dog", "Entrance is from the back gate". The AI will use this to answer questions from businesses on your behalf.')}>ℹ️</button>
            </span>
            <textarea
              className="ps-textarea"
              placeholder="e.g. Entrance from back gate, prefer morning visits, have a dog at home..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={300}
            />
            <span className="ps-hint">{bio.length}/300 — The AI uses this to answer business questions without bothering you.</span>
          </div>

          {error && <p className="ps-error">{error}</p>}

          <div className="ps-step2-actions">
            <button type="button" className="ps-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button
              id="setup-save-btn"
              type="button"
              className={`ps-btn-primary ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={saving || saved}
            >
              {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Ready to go →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
