import { useState, useRef, useEffect, useCallback } from 'react'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import RabbitaLogo from './icons/RabbitaLogo'
import { MicIcon, ArrowUp, ChevronRight, LocationPin, StarIcon } from './icons/Icons'
import BookingFeed from './BookingFeed'
import HistoryScreen from './HistoryScreen'
import ProfileSetup from './ProfileSetup'
import './HomeScreen.css'

/**
 * SCREEN 4: Home Screen (Main Chat)
 * Calls real backend: POST /api/requests/new → Gemini + Google Maps → live providers
 */
export default function HomeScreen({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [activeBooking, setActiveBooking] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const suggestions = [
    { emoji: '🔧', label: 'I need a plumber' },
    { emoji: '🍕', label: 'Order me a pizza' },
    { emoji: '⚡', label: 'Electrician needed' },
  ]

  function handleSuggestionClick(label) {
    setInput(label)
    inputRef.current?.focus()
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isTyping) return

    setError(null)

    // Add user message immediately
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Get fresh Firebase token
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not signed in')
      const token = await currentUser.getIdToken()

      // Get user's current location (or fall back to stored defaults)
      let lat = user?.preferences?.defaultLat || null
      let lng = user?.preferences?.defaultLng || null

      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
            maximumAge: 60000,
          })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {
        // Location permission denied — use stored defaults, that's fine
      }

      // Get conversation history (last 6 messages) to maintain context
      const historyContext = messages
        .filter(m => m.type === 'user' || m.type === 'ai')
        .slice(-6)
        .map(m => `${m.type === 'user' ? 'User' : 'RabbitaAI'}: ${m.text}`)
        .join('\n')

      // Call the real backend
      const res = await fetch(apiUrl('/api/requests/new'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestText: text, lat, lng, conversationHistory: historyContext }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`)
      }

      setIsTyping(false)

      // No providers found case
      if (!data.providers || data.providers.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'ai',
            text: data.message || `No providers found for your request. Try increasing your search radius in settings.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        return
      }

      // Show the AI acknowledgement message first (Gemini-generated)
      const serviceQuery = data.serviceQuery || text
      const aiAckMsg = {
        id: Date.now(),
        type: 'ai',
        text: data.ackMessage || `Found ${data.providers.length} great options for ${serviceQuery} near you 📍`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiAckMsg])

      // Then show provider cards
      setTimeout(() => {
        const resultMsg = {
          id: Date.now() + 1,
          type: 'ai',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          providers: data.providers.map((p, i) => ({
            id: p.placeId || i,
            name: p.name,
            category: p.emoji || data.emoji || '🔎',
            explanation: p.aiExplanation,
            distance: `${p.distanceKm} km`,
            rating: p.rating,
            address: p.address,
            phone: p.phoneNumber,
            requestId: data.requestId,
          })),
        }
        setMessages((prev) => [...prev, resultMsg])
      }, 400)
    } catch (err) {
      setIsTyping(false)
      console.error('Request failed:', err)
      const errorMsg = {
        id: Date.now(),
        type: 'ai',
        text: `Sorry, something went wrong: ${err.message}. Please try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const hasMessages = messages.length > 0

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
      <div className="home-screen-wrapper" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <HistoryScreen />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  if (activeTab === 'profile') {
    return (
      <div className="home-screen-wrapper" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ProfileSetup user={user} onComplete={() => {}} isEditing={true} />
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    )
  }

  return (
    <div className="home-screen" id="home-screen" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <header className="home-header">
        <div className="home-header-left">
          <RabbitaLogo size={20} color="var(--brand-primary)" />
          <span className="home-header-brand">RabbitaAI</span>
        </div>
        <div className="home-header-right">
          <div className="home-avatar" title={user?.name}>
            {initials}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="home-content">
        {!hasMessages ? (
          /* Empty state */
          <div className="home-empty screen-enter">
            <div className="home-empty-logo">
              <RabbitaLogo size={64} color="var(--brand-primary)" />
            </div>
            <h2 className="home-empty-title">What do you need today?</h2>
            <p className="home-empty-subtitle">
              Find a plumber, order pizza, book a cleaner — just type it.<br />
              <span style={{ color: 'var(--brand-primary)', fontSize: '12px' }}>
                Powered by Gemini + Google Maps
              </span>
            </p>
            <div className="home-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  className="home-suggestion-chip"
                  onClick={() => handleSuggestionClick(s.label)}
                  type="button"
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="home-messages">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`msg msg-${msg.type}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {msg.type === 'ai' && (
                  <div className="msg-ai-logo">
                    <RabbitaLogo size={16} color="var(--brand-primary)" />
                  </div>
                )}
                {/* Only render bubble if there's text or no providers */}
                {(msg.text || !msg.providers) && (
                  <div className={`msg-bubble msg-bubble-${msg.type} ${msg.isError ? 'msg-bubble-error' : ''}`}>
                    <p className="msg-text">{msg.text}</p>
                  </div>
                )}
                {/* Provider cards inside AI message */}
                {msg.providers && (
                  <div className="msg-providers">
                    {msg.providers.map((provider, pIdx) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        delay={pIdx * 100}
                        onBook={(booking) => setActiveBooking(booking)}
                      />
                    ))}
                  </div>
                )}
                <span className="msg-time">{msg.time}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="msg msg-ai">
                <div className="msg-ai-logo">
                  <RabbitaLogo size={16} color="var(--brand-primary)" />
                </div>
                <div className="msg-bubble msg-bubble-ai">
                  <div className="typing-dots">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
                <span className="msg-time" style={{ marginLeft: 0 }}>
                  Searching Gemini + Maps...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Fixed Input Bar */}
      <div className="home-input-bar">
        <div className={`home-input-container ${input.trim() ? 'has-text' : ''}`}>
          <button
            className="home-mic-btn"
            type="button"
            aria-label="Voice input (coming soon)"
            title="Coming soon"
          >
            <MicIcon size={20} color="var(--text-40)" />
          </button>
          <input
            ref={inputRef}
            type="text"
            className="home-input"
            placeholder="Type what you need..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            id="chat-input"
            disabled={isTyping}
          />
          <button
            className={`home-send-btn ${input.trim() && !isTyping ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            type="button"
            aria-label="Send message"
            id="send-button"
          >
            <ArrowUp size={18} color={input.trim() && !isTyping ? 'var(--text-inverse)' : 'var(--text-40)'} />
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

/* ── Provider Card ─────────────────────────────────────────────────────────── */
function ProviderCard({ provider, delay, onBook }) {
  const [expanded, setExpanded] = useState(false)
  const [booking, setBooking] = useState(false)

  async function handleBook(e) {
    e.stopPropagation()
    if (booking) return

    const phone = provider.phone
    if (!phone) {
      alert('Phone number not available for this provider.')
      return
    }

    setBooking(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${provider.requestId}/book`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedProvider: {
            name: provider.name,
            phone: provider.phone,
            phoneNumber: provider.phone,
            placeId: provider.id,
            address: provider.address,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')

      onBook?.({
        requestId: provider.requestId,
        provider: { name: provider.name },
        initialMessage: data.message,
      })
    } catch (err) {
      alert(err.message || 'Could not start booking.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div
      className={`provider-card ${expanded ? 'expanded' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <div className="provider-card-main">
        <div className="provider-card-emoji">
          <span>{provider.category}</span>
        </div>
        <div className="provider-card-info">
          <span className="provider-card-name">{provider.name}</span>
          <span className="provider-card-desc">{provider.explanation}</span>
          <span className="provider-card-distance">
            <LocationPin size={12} color="var(--brand-primary)" />
            {provider.distance}
          </span>
        </div>
        <div className="provider-card-right">
          {provider.rating && (
            <span className="provider-card-rating">
              <StarIcon size={12} filled color="var(--warning)" /> {provider.rating}
            </span>
          )}
          <ChevronRight
            size={14}
            color={expanded ? 'var(--brand-primary)' : 'var(--text-40)'}
          />
        </div>
      </div>

      {expanded && (
        <div className="provider-card-expanded">
          {provider.address && (
            <p className="provider-card-address">
              <LocationPin size={11} color="var(--text-40)" /> {provider.address}
            </p>
          )}
          <button
            className="provider-book-btn"
            type="button"
            onClick={handleBook}
            disabled={booking}
          >
            {booking ? 'Starting booking...' : 'Book via WhatsApp →'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Bottom Navigation ─────────────────────────────────────────────────────── */
function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      <button 
        className={`bottom-nav-item ${active === 'home' ? 'active' : ''}`} 
        onClick={() => onChange('home')}
        type="button"
      >
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Home</span>
        <div className="bottom-nav-indicator" />
      </button>
      <button 
        className={`bottom-nav-item ${active === 'history' ? 'active' : ''}`} 
        onClick={() => onChange('history')}
        type="button"
      >
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>History</span>
        <div className="bottom-nav-indicator" />
      </button>
      <button 
        className={`bottom-nav-item ${active === 'profile' ? 'active' : ''}`} 
        onClick={() => onChange('profile')}
        type="button"
      >
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Profile</span>
        <div className="bottom-nav-indicator" />
      </button>
    </nav>
  )
}
