import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import './HistoryScreen.css'

const STATUS_MAP = {
  awaiting_selection: { label: 'Active', cls: 'active' },
  booking: { label: 'Active', cls: 'active' },
  pending: { label: 'Active', cls: 'active' },
  active: { label: 'Active', cls: 'active' },
  accepted: { label: 'Accepted', cls: 'active' },
  in_progress: { label: 'In Progress', cls: 'active' },
  confirmed: { label: 'Confirmed', cls: 'confirmed' },
  received: { label: 'Received', cls: 'confirmed' },
  completed: { label: 'Completed', cls: 'confirmed' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
  failed: { label: 'Failed', cls: 'cancelled' },
}

const SERVICE_EMOJIS = {
  plumber: '🔧', electrician: '⚡', cleaner: '🧹', cleaning: '🧹',
  pizza: '🍕', food: '🍽️', burger: '🍔', biryani: '🍛',
  ac: '❄️', painter: '🎨',
  doctor: '🏥', salon: '💇', barber: '💈', gym: '🏋️',
  coffee: '☕', delivery: '📦', pharmacy: '💊', grocery: '🛒',
}

function getEmoji(text = '') {
  const q = text.toLowerCase()
  for (const [key, emoji] of Object.entries(SERVICE_EMOJIS)) {
    if (q.includes(key)) return emoji
  }
  return '🔎'
}

function truncate(str = '', len) {
  return str.length > len ? str.slice(0, len) + '…' : str
}

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled']

function ShimmerCard() {
  return (
    <div className="hi-shimmer-card">
      <div className="hi-shimmer-emoji" />
      <div className="hi-shimmer-body">
        <div className="hi-shimmer-line hi-shimmer-title" />
        <div className="hi-shimmer-line hi-shimmer-sub" />
      </div>
      <div className="hi-shimmer-badge" />
    </div>
  )
}

export default function HistoryScreen({ onOpenBooking }) {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) return
        const res = await fetch(apiUrl('/api/requests/history'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setRequests(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter === 'All'
    ? requests
    : requests.filter((r) => {
        const s = (STATUS_MAP[r.status] || {}).label || ''
        if (filter === 'Active') return ['Active', 'Accepted', 'In Progress'].includes(s)
        if (filter === 'Completed') return ['Confirmed', 'Received', 'Completed'].includes(s)
        if (filter === 'Cancelled') return ['Cancelled', 'Failed'].includes(s)
        return true
      })

  function handleCardTap(request) {
    if (onOpenBooking) {
      // Open inline in HomeScreen via the activeBooking state
      onOpenBooking({
        requestId: request.requestId,
        provider: { name: request.selectedProvider?.name || 'Provider' },
        initialMessage: null, // Will load from API
      })
    }
  }

  return (
    <div className="hi-shell" id="history-screen">

      {/* ── Header ── */}
      <header className="hi-header">
        <h1 className="hi-title">Your requests</h1>
      </header>

      {/* ── Filter chips ── */}
      <div className="hi-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`hi-filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="hi-list">
        {isLoading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : filtered.length === 0 ? (
          <div className="hi-empty">
            <span className="hi-empty-emoji">🐇</span>
            <h2 className="hi-empty-title">No requests yet</h2>
            <p className="hi-empty-sub">Your booking history will appear here</p>
          </div>
        ) : (
          filtered.map((req, idx) => {
            const st = STATUS_MAP[req.status] || { label: req.status || 'Unknown', cls: 'confirmed' }
            const emoji = getEmoji(req.serviceQuery || req.originalRequest)
            const dateStr = new Date(req.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short',
            })

            return (
              <button
                key={req.requestId}
                type="button"
                className="hi-card"
                style={{ animationDelay: `${idx * 50}ms`, animation: 'stagger-in 350ms ease-out forwards', opacity: 0 }}
                onClick={() => handleCardTap(req)}
                aria-label={`View ${req.serviceQuery || 'request'}`}
              >
                <div className="hi-card-emoji">{emoji}</div>

                <div className="hi-card-info">
                  <span className="hi-card-query">
                    {truncate(req.originalRequest || req.serviceQuery || 'Request', 55)}
                  </span>
                  {req.selectedProvider?.name && (
                    <span className="hi-card-provider">{req.selectedProvider.name}</span>
                  )}
                </div>

                <div className="hi-card-right">
                  <span className={`hi-badge hi-badge-${st.cls}`}>{st.label}</span>
                  <span className="hi-card-date">{dateStr}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
