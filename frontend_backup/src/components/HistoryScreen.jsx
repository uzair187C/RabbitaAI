import { useState, useEffect } from 'react'
import RabbitaLogo from './icons/RabbitaLogo'
import { ChevronRight } from './icons/Icons'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import './HistoryScreen.css'

const STATUS_MAP = {
  awaiting_selection: { label: 'Selecting', className: 'status-active' },
  booking: { label: 'Booking', className: 'status-active' },
  active: { label: 'Active', className: 'status-active' },
  completed: { label: 'Completed', className: 'status-completed' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
}

export default function HistoryScreen() {
  const [filter, setFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const filters = ['all', 'active', 'completed', 'cancelled']

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = await auth.currentUser.getIdToken()
        const res = await fetch(apiUrl('/api/requests/history'), {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setBookings(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => {
        if (filter === 'active') return b.status === 'active' || b.status === 'awaiting_selection' || b.status === 'booking'
        return b.status === filter
      })

  return (
    <div className="history-screen" id="history-screen">
      <header className="history-header">
        <h1 className="history-title">Your Bookings</h1>
      </header>

      {/* Filter pills */}
      <div className="history-filters">
        {filters.map((f) => (
          <button
            key={f}
            className={`history-filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Booking list */}
      <div className="history-list">
        {loading ? (
          <div className="typing-dots" style={{ margin: '40px auto' }}>
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((booking, idx) => {
            const statusConf = STATUS_MAP[booking.status] || { label: booking.status, className: 'status-active' }
            const dateStr = new Date(booking.createdAt).toLocaleDateString()
            return (
              <div
                key={booking.requestId}
                className="history-card screen-enter"
                style={{ animationDelay: `${idx * 80}ms` }}
                role="button"
                tabIndex={0}
              >
                <div className="history-card-emoji" style={{ background: 'rgba(91, 141, 239, 0.1)' }}>
                  <span>{booking.serviceQuery?.match(/🍕|🍔|🍛|🍽️|🔧|⚡|🧹|❄️|🎨|🚗|🏥|💇|🏋️|☕/)?.[0] || '🔎'}</span>
                </div>
                <div className="history-card-info">
                  <span className="history-card-service">{booking.serviceQuery || 'Service'}</span>
                  <span className="history-card-request">{booking.originalRequest}</span>
                </div>
                <div className="history-card-right">
                  <span className={`history-status-badge ${statusConf.className}`}>
                    {statusConf.label}
                  </span>
                  <span className="history-card-date">{dateStr}</span>
                </div>
                <ChevronRight size={14} color="var(--text-40)" />
              </div>
            )
          })
        ) : (
          <div className="history-empty">
            <div className="history-empty-logo">
              <RabbitaLogo size={48} color="var(--text-40)" />
            </div>
            <h3 className="history-empty-title">No bookings yet</h3>
            <p className="history-empty-subtitle">Your booking history will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
