import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import BookingFeed from './BookingFeed'
import HistoryScreen from './HistoryScreen'
import ProfileSetup from './ProfileSetup'
import './HomeScreen.css'

// ── Icons (inline SVG to avoid deps) ─────────────────────────────────────────
function IconHome({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IconHistory({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IconProfile({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--brand)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}
function IconSend({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#09090E' : 'var(--text-3)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--amber)" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const GREETINGS = [
  () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  },
  () => "Hey there",
  () => "What's up",
  () => "Hello",
  () => "Welcome back",
]
function getGreeting() {
  // 70% chance of time-based, 30% casual
  return Math.random() < 0.7 ? GREETINGS[0]() : GREETINGS[Math.floor(Math.random() * (GREETINGS.length - 1)) + 1]()
}

const TICKER_ITEMS = [
  '🔧 Plumber booked · Lagos · 2m ago',
  '🍕 Food delivered · Karachi · 4m',
  '⚡ Electrician · Cairo · 7m',
  '🧹 Cleaning · São Paulo · 12m',
  '💊 Pharmacy · Dhaka · 15m',
  '💇 Salon booked · Dubai · 18m',
  '🍔 Burger ordered · Lahore · 20m',
  '❄️ AC repair · Jakarta · 22m',
]

const SUGGESTION_CHIPS = [
  '🏠 Home services',
  '🍽️ Food & groceries',
  '💆 Wellness',
  '📦 Delivery',
  '⚡ Utilities',
  '💇 Salon & grooming',
]

const SUPPORT_EMAIL = 'rabbitaxai@gmail.com'

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonProviderCard({ delay }) {
  return (
    <div className="hs-provider-card" style={{ opacity: 0.7, pointerEvents: 'none', animationDelay: `${delay}ms` }}>
      <div className="hs-provider-main">
        <div className="hs-provider-emoji" style={{ background: 'var(--bg-3)', color: 'transparent', width: '42px', height: '42px' }}></div>
        <div className="hs-provider-info" style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '14px', width: '50%', background: 'var(--bg-3)', borderRadius: '4px' }} />
          <div style={{ height: '12px', width: '80%', background: 'var(--bg-3)', borderRadius: '4px' }} />
          <div className="hs-provider-meta" style={{ marginTop: '4px' }}>
            <div style={{ height: '12px', width: '40px', background: 'var(--bg-3)', borderRadius: '4px' }} />
            <div style={{ height: '12px', width: '50px', background: 'var(--bg-3)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="hs-msg hs-msg-ai">
      <span className="hs-ai-avatar">🐇</span>
      <div className="hs-msg-body" style={{ width: '100%' }}>
        <div className="hs-bubble hs-bubble-ai hs-typing-bubble" style={{ marginBottom: '16px', display: 'inline-flex' }}>
          <span className="hs-dot" style={{ animationDelay: '0ms' }} />
          <span className="hs-dot" style={{ animationDelay: '150ms' }} />
          <span className="hs-dot" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="hs-providers" style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
          <SkeletonProviderCard delay={0} />
          <SkeletonProviderCard delay={100} />
          <SkeletonProviderCard delay={200} />
        </div>
      </div>
    </div>
  )
}

function ProviderCard({ provider, delay, onBook, isLoading, onProfileNeeded }) {
  const [expanded, setExpanded] = useState(false)
  const [booking, setBooking] = useState(false)

  async function handleBook(e) {
    e.stopPropagation()
    if (booking || isLoading) return
    if (navigator.vibrate) navigator.vibrate(50)
    setBooking(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${provider.requestId}/book`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          selectedProvider: {
            placeId: provider.id || provider.placeId,
            name: provider.name,
            phone: provider.phone || provider.phoneNumber || null,
            rating: provider.rating,
            distanceKm: parseFloat(provider.distance),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')

      // Warn if WhatsApp failed but don't block the booking flow
      if (data.whatsappError) {
        console.warn('WhatsApp delivery failed:', data.whatsappError)
        if (data.warning) {
          alert(data.warning)
        }
      }

      onBook?.({
        requestId: provider.requestId,
        provider: { name: provider.name },
        initialMessage: data.message,
        type: provider.type,
      })
    } catch (err) {
      const msg = err.message || 'Could not start booking.'
      if (msg.includes('rabbitaxai@gmail.com')) {
        alert(msg)
      } else {
        alert(`${msg}\n\nIf the issue persists, contact us at ${SUPPORT_EMAIL}`)
      }
    } finally {
      setBooking(false)
    }
  }

  return (
    <div
      className={`hs-provider-card ${expanded ? 'expanded' : ''}`}
      style={{ animationDelay: `${delay}ms`, animation: 'stagger-in 400ms ease-out forwards', opacity: 0 }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <div className="hs-provider-main">
        <div className="hs-provider-emoji">{provider.category || '🔎'}</div>
        <div className="hs-provider-info">
          <span className="hs-provider-name">{provider.name}</span>
          <span className="hs-provider-desc">{provider.explanation}</span>
          <div className="hs-provider-meta">
            {provider.rating && (
              <span className="hs-provider-rating"><IconStar /> {provider.rating}</span>
            )}
            <span className="hs-provider-dist"><IconPin /> {provider.distance}</span>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={expanded ? 'var(--brand)' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {expanded && (
        <div className="hs-provider-expanded">
          {provider.address && (
            <p className="hs-provider-address"><IconPin /> {provider.address}</p>
          )}
          <button
            className="hs-book-btn"
            type="button"
            onClick={handleBook}
            disabled={booking}
          >
            {booking ? 'Starting...' : (provider.type === 'order' ? 'Place Order →' : 'Book via WhatsApp →')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeScreen({ user }) {
  const navigate = useNavigate()

  // State
  const [messages, setMessages] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [activeBooking, setActiveBooking] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [greeting] = useState(getGreeting)
  const [placeholderText, setPlaceholderText] = useState('')
  const [isListening, setIsListening] = useState(false)

  // ── Animated Placeholder ────────────────────────────────────────────────────
  useEffect(() => {
    const texts = ["Find a plumber nearby...", "Order a zinger burger...", "Get my AC fixed today...", "Need a haircut...", "Clean my house..."]
    let i = 0
    let j = 0
    let isDeleting = false
    let timeoutId

    function type() {
      const currentText = texts[i]
      if (isDeleting) {
        setPlaceholderText(currentText.substring(0, j - 1))
        j--
      } else {
        setPlaceholderText(currentText.substring(0, j + 1))
        j++
      }

      let speed = 70
      if (isDeleting) speed /= 2

      if (!isDeleting && j === currentText.length) {
        speed = 2000
        isDeleting = true
      } else if (isDeleting && j === 0) {
        isDeleting = false
        i = (i + 1) % texts.length
        speed = 500
      }
      timeoutId = setTimeout(type, speed)
    }
    timeoutId = setTimeout(type, 1000)
    return () => clearTimeout(timeoutId)
  }, [])

  // ── Voice Input ─────────────────────────────────────────────────────────────
  const handleMicClick = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      if (navigator.vibrate) navigator.vibrate([50, 50])
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript)
      if (navigator.vibrate) navigator.vibrate(50)
      setTimeout(() => inputRef.current?.focus(), 100)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [])

  // ── New Chat ────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    setMessages([])
    setConversationHistory([])
    setInputValue('')
    setIsLoading(false)
    setActiveBooking(null)
  }, [])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Grab location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    )
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const firstName = user?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there'

  // ── Send Handler ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text || isLoading) return
    if (navigator.vibrate) navigator.vibrate(50)

    const userMsg = { role: 'user', content: text, providers: null, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setInputFocused(false)
    setIsLoading(true)

    // Build history string for context
    const historyContext = conversationHistory
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'RabbitaAI'}: ${m.content}`)
      .join('\n')

    try {
      const token = await auth.currentUser.getIdToken()
      const lat = currentLocation?.lat || user?.preferences?.defaultLat || null
      const lng = currentLocation?.lng || user?.preferences?.defaultLng || null

      const res = await fetch(apiUrl('/api/requests/new'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestText: text, lat, lng, conversationHistory: historyContext }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)

      setIsLoading(false)

      // If profile is incomplete, show message and switch to profile tab
      if (data.profileIncomplete) {
        const aiMsg = {
          role: 'ai',
          content: data.message,
          providers: null,
          timestamp: Date.now(),
          profileIncomplete: true,
          missingFields: data.missingFields,
        }
        setMessages((prev) => [...prev, aiMsg])
        setConversationHistory((prev) => [...prev, userMsg, { role: 'ai', content: data.message }])
        return
      }

      // Determine reply text
      const replyText =
        data.conversationalResponse ||
        data.ackMessage ||
        data.clarificationQuestion ||
        data.message ||
        (data.providers?.length ? `Found ${data.providers.length} options near you 📍` : 'No results found.')

      const providers = data.providers?.length
        ? data.providers.map((p, i) => ({
            id: p.placeId || i,
            name: p.name,
            category: p.emoji || data.emoji || '🔎',
            explanation: p.aiExplanation,
            distance: `${p.distanceKm} km`,
            rating: p.rating,
            address: p.address,
            phone: p.phoneNumber || null,
            requestId: data.requestId,
            type: data.requestType || 'service',
          }))
        : null;

      const aiMsg = { role: 'ai', content: replyText, providers, timestamp: Date.now(), requestId: data.requestId, category: data.category }
      setMessages((prev) => [...prev, aiMsg])

      // Grow conversation history
      setConversationHistory((prev) => [...prev, userMsg, { role: 'ai', content: replyText }])
    } catch (err) {
      setIsLoading(false)
      const errorContent = err.message?.includes('rabbitaxai@gmail.com')
        ? err.message
        : `Sorry, something went wrong. Please try again or contact us at ${SUPPORT_EMAIL}`
      setMessages((prev) => [...prev, {
        role: 'ai',
        content: errorContent,
        providers: null,
        timestamp: Date.now(),
        isError: true,
      }])
    }
  }, [inputValue, isLoading, conversationHistory, currentLocation, user])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Render guards ───────────────────────────────────────────────────────────
  if (activeBooking) {
    return (
      <BookingFeed
        requestId={activeBooking.requestId}
        provider={activeBooking.provider}
        initialMessage={activeBooking.initialMessage}
        onBack={() => setActiveBooking(null)}
      />
    )
  }

  if (activeTab === 'history') {
    return (
      <div className="hs-shell">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <HistoryScreen onOpenBooking={(booking) => {
            setActiveBooking(booking)
            setActiveTab('home')
          }} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  if (activeTab === 'profile') {
    return (
      <div className="hs-shell">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ProfileSetup user={user} onComplete={() => {}} isEditing={true} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="hs-shell" id="home-screen">

      {/* ── Top Bar ── */}
      <header className="hs-topbar">
        <div className="hs-topbar-left">
          <p className="hs-greeting">{greeting}, {firstName} 👋</p>
          <p className="hs-sub">Your AI agent is ready</p>
        </div>
        <div className="hs-topbar-right">
          {messages.length > 0 && (
            <button
              className="hs-new-chat-btn"
              type="button"
              onClick={handleNewChat}
              title="Start a new conversation"
            >
              ✏️ New
            </button>
          )}
          <div className="hs-online-pill">
            <span className="hs-pulse-dot" />
            <span className="hs-online-text">Online</span>
          </div>
        </div>
      </header>

      {/* ── Live Ticker ── */}
      <div className="hs-ticker-wrap" aria-hidden="true">
        <div className="hs-ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="hs-ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <main className="hs-chat">
        {messages.length === 0 ? (
          <div className="hs-empty">
            <span className="hs-empty-emoji">🐇</span>
            <h2 className="hs-empty-title">What do you need handled?</h2>
            <p className="hs-empty-sub">From plumbers to pizza — just tell me.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.timestamp} className={`hs-msg hs-msg-${msg.role}`}>
              {msg.role === 'ai' && <span className="hs-ai-avatar">🐇</span>}
              <div className="hs-msg-body">
                {msg.content && (
                  <div className={`hs-bubble hs-bubble-${msg.role} ${msg.isError ? 'hs-bubble-error' : ''}`}>
                    <p>{msg.content}</p>
                    {/* Profile incomplete — show "Complete Profile" button */}
                    {msg.profileIncomplete && (
                      <button
                        className="hs-profile-cta"
                        type="button"
                        onClick={() => setActiveTab('profile')}
                      >
                        📋 Complete Profile
                      </button>
                    )}
                  </div>
                )}
                {msg.providers?.length > 0 && (
                  <div className="hs-providers">
                    {msg.providers.map((p, i) => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        delay={i * 80}
                        isLoading={isLoading}
                        onBook={(booking) => {
                          setActiveBooking(booking)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </main>

      {/* ── Command Bar ── */}
      <div className="hs-command-wrap">
        {/* Suggestion chips */}
        {inputFocused && (
          <div className="hs-chips-row">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="hs-chip"
                onMouseDown={(e) => { e.preventDefault(); setInputValue(chip.replace(/^\S+\s/, '')); inputRef.current?.focus() }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className={`hs-input-bar ${inputFocused ? 'focused' : ''} ${isListening ? 'listening' : ''}`}>
          <button 
            type="button" 
            className="hs-mic-btn" 
            aria-label="Voice input" 
            onClick={handleMicClick}
            style={{ color: isListening ? 'var(--brand)' : 'inherit', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
          >
            <IconMic />
          </button>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            className="hs-input"
            placeholder={placeholderText || "Type what you need..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 150)}
            disabled={isLoading}
          />
          <button
            id="send-button"
            type="button"
            className={`hs-send-btn ${inputValue.trim() && !isLoading ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <IconSend active={!!inputValue.trim() && !isLoading} />
          </button>
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

// ── Bottom Navigation ─────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const items = [
    { key: 'home', label: 'Home', Icon: IconHome },
    { key: 'history', label: 'History', Icon: IconHistory },
    { key: 'profile', label: 'Profile', Icon: IconProfile },
  ]
  return (
    <nav className="hs-bottom-nav" id="bottom-nav">
      {items.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className={`hs-nav-item ${active === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon active={active === key} />
          <span className="hs-nav-label">{label}</span>
          {active === key && <span className="hs-nav-dot" />}
        </button>
      ))}
    </nav>
  )
}
