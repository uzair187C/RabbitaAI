import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import './BookingFeed.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
const SUPPORT_EMAIL = 'rabbitaxai@gmail.com'

function formatTime(ts) {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Inline Icons ──────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconSend({ color = '#09090E' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookingFeed({ requestId: propRequestId, provider, initialMessage, onBack }) {
  const params = useParams()
  const requestId = propRequestId || params.requestId

  // ── State ──────────────────────────────────────────────────────────────────
  const [milestones, setMilestones] = useState(() => {
    const initial = []
    if (initialMessage) {
      initial.push({ icon: '📤', text: 'Initial message sent to provider', status: 'done', id: Date.now() })
    }
    return initial
  })
  const [raceMode, setRaceMode] = useState(false)
  const [raceProviders, setRaceProviders] = useState([])
  const [requiresUserInput, setRequiresUserInput] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [showTimeout, setShowTimeout] = useState(false)
  const [addonText, setAddonText] = useState('')
  const [sendingAddon, setSendingAddon] = useState(false)
  const [reqCopied, setReqCopied] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [conversationRaw, setConversationRaw] = useState([])
  const [receipt, setReceipt] = useState(null)
  const [cancelled, setCancelled] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [markingReceived, setMarkingReceived] = useState(false)
  const [isReceived, setIsReceived] = useState(false)
  const [status, setStatus] = useState('booking')
  const [providerPhone, setProviderPhone] = useState(null)

  // ── Animated receipt states ────────────────────────────────────────────────
  const [circleVisible, setCircleVisible] = useState(false)
  const [checkDrawn, setCheckDrawn] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState([])
  const [receiptTextVisible, setReceiptTextVisible] = useState(false)
  const CHECK_LEN = 42
  const CONFETTI_COLORS = ['var(--brand)', '#FFFFFF', 'var(--amber)', 'rgba(61,255,176,0.6)']
  function randomBetween(a, b) { return a + Math.random() * (b - a) }

  const providerName = provider?.name || 'Provider'
  const bottomRef = useRef(null)

  // Scroll to bottom on new milestones
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [milestones, requiresUserInput, showTimeout, receipt])

  // ── Load existing conversation on mount & Poll for updates ─────────────
  useEffect(() => {
    if (!requestId) return

    let isPolling = true;

    async function load() {
      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) return
        const res = await fetch(apiUrl(`/api/requests/${requestId}`), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setStatus(data.status || 'booking')
        setProviderPhone(data.selectedProvider?.phone || null)
        if (data.conversation?.length) {
          setConversationRaw(data.conversation)
          // Rebuild milestones from conversation
          const loadedMilestones = data.conversation.map((msg, i) => ({
            id: msg._id || new Date(msg.timestamp || 0).getTime() + i, // Stable ID so animations don't replay on poll
            icon: msg.direction === 'inbound' ? '💬' : '📤',
            text: msg.message,
            status: 'done',
          }))
          setMilestones(loadedMilestones)
        }
        
        if (data.requiresUserInput && data.userPrompt) {
          setRequiresUserInput(true)
          setUserPrompt(data.userPrompt)
        } else if (!data.requiresUserInput) {
          setRequiresUserInput(false)
        }
        
        if (data.status === 'received') {
          setIsReceived(true)
        }
        if (data.status === 'confirmed' && data.receipt) {
          setReceipt({
            requestId: data.receipt.requestId || data.requestId,
            service: data.receipt.serviceType,
            provider: data.receipt.providerName,
            providerPhone: data.receipt.providerPhone || data.selectedProvider?.phone || null,
            time: data.receipt.scheduledTime,
            location: data.receipt.userArea,
          })
          isPolling = false; // Stop polling when confirmed
        }
        if (data.status === 'cancelled' || data.status === 'failed') {
          isPolling = false; // Stop polling
        }
      } catch (e) {
        console.warn('Could not load conversation:', e.message)
      }
    }
    
    // Initial load
    load()

    // Setup polling every 4 seconds as fallback for Serverless WebSocket drops
    const interval = setInterval(() => {
      if (isPolling) load()
    }, 4000)

    return () => clearInterval(interval)
  }, [requestId])

  // ── Socket.io connection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!requestId) return

    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] })

    socket.on('connect', () => {
      socket.emit('join-request', requestId)
    })

    socket.on('booking-status', (data) => {
      if (data.raceMode) setRaceMode(true)
      if (data.message) {
        setMilestones((prev) => [...prev, {
          id: Date.now(),
          icon: '🔄',
          text: data.message,
          status: 'active',
        }])
      }
    })

    socket.on('race-update', (data) => {
      if (data.providers) setRaceProviders(data.providers)
    })

    socket.on('status-milestone', (data) => {
      setMilestones((prev) => {
        const updated = prev.map((m) => m.status === 'active' ? { ...m, status: 'done' } : m)
        return [...updated, {
          id: Date.now() + Math.random(),
          icon: data.icon || '✅',
          text: data.text || data.message || 'Update',
          status: data.status || 'active',
        }]
      })
    })

    socket.on('conversation-update', (data) => {
      setConversationRaw((prev) => [...prev, data])
      if (data.requiresUserInput) {
        setRequiresUserInput(true)
        setUserPrompt(data.userPrompt || data.message || '')
      } else if (data.direction === 'outbound') {
        setRequiresUserInput(false)
        setUserPrompt('')
      }
      if (data.message) {
        setMilestones((prev) => [...prev, {
          id: Date.now() + Math.random(),
          icon: data.direction === 'inbound' ? '💬' : '📤',
          text: data.message,
          status: 'done',
        }])
      }
    })

    socket.on('booking-timeout', (data) => {
      setShowTimeout(true)
      setMilestones((prev) => [...prev, {
        id: Date.now(),
        icon: '⏳',
        text: data?.message || 'No response yet. Waiting...',
        status: 'active',
      }])
    })

    socket.on('booking-confirmed', (data) => {
      setShowTimeout(false)
      setMilestones((prev) => [
        ...prev.map((m) => ({ ...m, status: 'done' })),
        { id: Date.now(), icon: '🎉', text: 'Booking confirmed!', status: 'done' },
      ])
      const r = data?.receipt || {}
      setReceipt({
        requestId: r.requestId || requestId,
        service: r.service || provider?.category || 'Service',
        provider: r.provider || providerName,
        providerPhone: r.providerPhone || null,
        time: r.time || 'Today',
        location: r.location || 'Your area',
      })
    })

    socket.on('booking-cancelled', () => {
      setCancelled(true)
      setTimeout(() => onBack?.(), 1200)
    })

    socket.on('booking-received', () => {
      setIsReceived(true)
    })

    return () => socket.disconnect()
  }, [requestId, onBack, provider, providerName])

  // ── Trigger receipt animation when receipt is set ──────────────────────────
  useEffect(() => {
    if (!receipt) return
    
    const playSuccessSound = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1) // A6
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        
        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      } catch(e) {
        // ignore audio errors
      }
    }

    setTimeout(() => {
      setCircleVisible(true)
      playSuccessSound()
    }, 50)
    setTimeout(() => setCheckDrawn(true), 250)
    setTimeout(() => {
      const pieces = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: randomBetween(0, 360),
        distance: randomBetween(55, 110),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: randomBetween(5, 10),
        delay: randomBetween(0, 200),
      }))
      setConfettiPieces(pieces)
      if (navigator.vibrate) navigator.vibrate(100) // extra haptic for confetti
      setTimeout(() => setConfettiPieces([]), 1100)
    }, 600)
    setTimeout(() => setReceiptTextVisible(true), 700)
  }, [receipt])

  const handleSubmitReply = useCallback(async () => {
    if (!replyText.trim() || sendingReply) return
    setSendingReply(true)
    setRequiresUserInput(false)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${requestId}/reply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userReply: replyText.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Reply failed')
      }
      // The socket will emit the composed reply as an outbound milestone — no need to add manually
      setReplyText('')
      setUserPrompt('')
    } catch (err) {
      console.error(err)
      setRequiresUserInput(true)
      setUserPrompt(userPrompt || 'Please try again')
      alert(err.message || `Something went wrong. Contact ${SUPPORT_EMAIL}`)
    } finally {
      setSendingReply(false)
    }
  }, [replyText, sendingReply, requestId, userPrompt])

  const handleCancel = useCallback(async () => {
    if (cancelling) return
    setCancelling(true)
    setShowCancelConfirm(false)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${requestId}/cancel`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Cancel failed')
      }
      setCancelled(true)
      setTimeout(() => onBack?.(), 1200)
    } catch (err) {
      console.error('Cancel failed:', err)
      alert(err.message || `Could not cancel. Contact ${SUPPORT_EMAIL}`)
    } finally {
      setCancelling(false)
    }
  }, [cancelling, requestId, onBack])

  const handleAddon = useCallback(async () => {
    if (!addonText.trim() || sendingAddon) return
    setSendingAddon(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${requestId}/addon`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addonText: addonText.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Add-on failed')
      }
      setMilestones((prev) => [...prev, {
        id: Date.now(),
        icon: '➕',
        text: `Detail sent: "${addonText.trim()}"`,
        status: 'done',
      }])
      setAddonText('')
    } catch (err) {
      console.error('Addon failed:', err)
      alert(err.message || `Could not send add-on. Contact ${SUPPORT_EMAIL}`)
    } finally {
      setSendingAddon(false)
    }
  }, [addonText, sendingAddon, requestId])

  const handleMarkReceived = useCallback(async () => {
    if (markingReceived) return
    setMarkingReceived(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${requestId}/received`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed')
      }
      setIsReceived(true)
      setMilestones((prev) => [...prev, {
        id: Date.now(),
        icon: '✅',
        text: 'You confirmed: Order/Service received!',
        status: 'done',
      }])
    } catch (err) {
      alert(err.message || `Could not mark as received. Contact ${SUPPORT_EMAIL}`)
    } finally {
      setMarkingReceived(false)
    }
  }, [markingReceived, requestId])

  function handleCallProvider() {
    const phone = receipt?.providerPhone || providerPhone
    if (phone) {
      window.open(`tel:${phone}`, '_self')
    }
  }

  function handleDownloadReceipt() {
    // Simple text download
    const r = receipt || {}
    const text = [
      `RABBITAAI BOOKING RECEIPT`,
      `========================`,
      `Request ID: ${r.requestId || requestId}`,
      `Service: ${r.service || '-'}`,
      `Provider: ${r.provider || '-'}`,
      `Provider Phone: ${r.providerPhone || '-'}`,
      `Time: ${r.time || '-'}`,
      `Location: ${r.location || '-'}`,
      `Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      ``,
      `Booked via RabbitaAI — rabbita-ai.web.app`,
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${r.requestId || requestId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Cancelled state ───────────────────────────────────────────────────────
  if (cancelled) {
    return (
      <div className="bf-shell bf-cancelled">
        <span className="bf-cancelled-icon">✅</span>
        <p className="bf-cancelled-text">Booking cancelled</p>
        <p className="bf-cancelled-sub">The business has been notified</p>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="bf-shell" id="booking-feed-screen">

      {/* ── Header ── */}
      <header className="bf-header">
        <button className="bf-back-btn" onClick={onBack} type="button" aria-label="Go back">
          <IconBack />
        </button>
        <div className="bf-header-center">
          <p className="bf-provider-name">{providerName}</p>
          <p className="bf-header-sub">via RabbitaAI</p>
        </div>
        <div className="bf-header-right">
          <span className="bf-req-id mono">{requestId}</span>
        </div>
      </header>

      {/* ── Main scrollable area ── */}
      <main className="bf-main">

        {/* ── Race Mode Banner ── */}
        {raceMode && (
          <div className="bf-race-banner">
            <p className="bf-race-title">⚡ Reaching out to multiple providers simultaneously</p>
            <div className="bf-race-list">
              {raceProviders.map((rp, i) => (
                <div key={i} className={`bf-race-row bf-race-${rp.status}`}>
                  <span className="bf-race-name">{rp.name}</span>
                  <span className="bf-race-status">
                    {rp.status === 'waiting' && (
                      <><span className="bf-race-dot" /> Awaiting reply...</>
                    )}
                    {rp.status === 'confirmed' && (
                      <><IconCheck /> <span className="bf-race-confirmed">Confirmed!</span></>
                    )}
                    {rp.status === 'filled' && 'Request filled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Status Timeline ── */}
        <div className="bf-timeline">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`bf-milestone bf-milestone-${m.status}`}
              style={{ animation: 'stagger-in 400ms ease-out forwards', animationDelay: `${idx * 60}ms`, opacity: 0 }}
            >
              <div className="bf-milestone-left">
                <div className="bf-milestone-dot" />
                {idx < milestones.length - 1 && <div className="bf-milestone-line" />}
              </div>
              <div className="bf-milestone-right">
                <div className="bf-milestone-row">
                  <span className="bf-milestone-icon">{m.icon}</span>
                  <span className="bf-milestone-text">{m.text}</span>
                  {m.status === 'done' && (
                    <span className="bf-badge bf-badge-done">Done</span>
                  )}
                  {m.status === 'active' && (
                    <span className="bf-badge bf-badge-live">Live</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Timeout Card ── */}
        {showTimeout && (
          <div className="bf-timeout-card">
            <p className="bf-timeout-title">Still waiting · 5 min</p>
            <p className="bf-timeout-sub">No response yet. Try another provider?</p>
            <div className="bf-timeout-actions">
              <button className="bf-btn-brand" type="button" onClick={onBack}>Try another</button>
              <button className="bf-btn-ghost" type="button" onClick={() => setShowTimeout(false)}>Keep waiting</button>
            </div>
          </div>
        )}

        {/* ── Question Card ── */}
        {requiresUserInput && (
          <div className="bf-question-card">
            <p className="bf-question-label">I need your input</p>
            <p className="bf-question-text">{userPrompt}</p>
            <div className="bf-question-input-row">
              <input
                type="text"
                className="bf-question-input"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                autoFocus
              />
              <button
                className="bf-reply-send-btn"
                type="button"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || sendingReply}
              >
                {sendingReply ? '...' : 'Send reply'}
              </button>
            </div>
          </div>
        )}

        {/* ── Animated Receipt ── */}
        {receipt && (
          <div className="bf-animated-receipt">

            {/* Confetti burst */}
            {confettiPieces.map((p) => (
              <div
                key={p.id}
                className="bf-confetti-piece"
                style={{
                  '--angle': `${p.angle}deg`,
                  '--dist': `${p.distance}px`,
                  '--delay': `${p.delay}ms`,
                  background: p.color,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}

            {/* Animated checkmark hero */}
            <div className={`bf-check-hero ${circleVisible ? 'visible' : ''}`}>
              <svg className="bf-check-svg" viewBox="0 0 80 80" fill="none">
                <circle
                  cx="40" cy="40" r="36"
                  stroke="var(--brand)"
                  strokeWidth="3"
                  strokeDasharray="226"
                  strokeDashoffset={circleVisible ? 0 : 226}
                  style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.34,1.56,0.64,1)' }}
                />
                <polyline
                  points="26 40 35 50 54 30"
                  stroke="var(--brand)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={CHECK_LEN}
                  strokeDashoffset={checkDrawn ? 0 : CHECK_LEN}
                  style={{ transition: 'stroke-dashoffset 400ms ease-out 200ms' }}
                />
              </svg>
            </div>

            {/* Title text */}
            <div className={`bf-receipt-hero-text ${receiptTextVisible ? 'visible' : ''}`}>
              <p className="bf-receipt-hero-title">Sorted! 🐇</p>
              <p className="bf-receipt-hero-sub">{receipt.provider || providerName}</p>
            </div>

            {/* Receipt card rows */}
            <div className={`bf-receipt-card ${receiptTextVisible ? 'visible' : ''}`}>
              <div className="bf-receipt-header">
                <span className="bf-receipt-title">🎉 Booking Confirmed!</span>
                <span className="bf-receipt-id">{receipt.requestId || requestId}</span>
              </div>
              <div className="bf-receipt-divider" />
              <div className="bf-receipt-rows">
                <div className="bf-receipt-row">
                  <span className="bf-receipt-label">Service</span>
                  <span className="bf-receipt-value">{receipt.service || '-'}</span>
                </div>
                <div className="bf-receipt-row">
                  <span className="bf-receipt-label">Provider</span>
                  <span className="bf-receipt-value bf-receipt-brand">{receipt.provider || '-'}</span>
                </div>
                <div className="bf-receipt-row">
                  <span className="bf-receipt-label">Time</span>
                  <span className="bf-receipt-value">{receipt.time || '-'}</span>
                </div>
                <div className="bf-receipt-row">
                  <span className="bf-receipt-label">Location</span>
                  <span className="bf-receipt-value">{receipt.location || '-'}</span>
                </div>
                {(receipt.providerPhone || providerPhone) && (
                  <div className="bf-receipt-row">
                    <span className="bf-receipt-label">Business Phone</span>
                    <button className="bf-receipt-phone-btn" type="button" onClick={handleCallProvider}>
                      <IconPhone /> {receipt.providerPhone || providerPhone}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bf-receipt-actions">
                <button className="bf-btn-ghost bf-receipt-action-btn" type="button" onClick={handleDownloadReceipt}>
                  <IconDownload /> Download
                </button>
                {(receipt.providerPhone || providerPhone) && (
                  <button className="bf-btn-ghost bf-receipt-action-btn" type="button" onClick={handleCallProvider}>
                    <IconPhone /> Call
                  </button>
                )}
              </div>

              {/* Mark as Received */}
              {!isReceived ? (
                <button
                  className="bf-btn-brand bf-received-btn"
                  type="button"
                  onClick={handleMarkReceived}
                  disabled={markingReceived}
                >
                  {markingReceived ? 'Confirming...' : '✅ Mark as Received'}
                </button>
              ) : (
                <div className="bf-received-done">
                  <span>✅ You confirmed this order/service was received</span>
                </div>
              )}

              {/* Data Privacy Note */}
              <div className="bf-receipt-privacy-note" style={{ marginTop: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: '6px', lineHeight: '1.4' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Your exact address and phone number have been securely shared with the provider to complete this booking.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Add-on input ── */}
        {!cancelled && (
          <>
            <div className="bf-addon-row">
              <input
                type="text"
                className="bf-addon-input"
                placeholder="Send a message (e.g. 'running late', 'extra sauce')..."
                value={addonText}
                onChange={(e) => setAddonText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddon()}
              />
              {addonText.trim() && (
                <button className="bf-addon-send" type="button" onClick={handleAddon} disabled={sendingAddon}>
                  <IconSend color="var(--brand)" />
                </button>
              )}
            </div>
            {requestId && !receipt && (
              <button
                className="bf-req-copy-chip"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(requestId).then(() => {
                    setReqCopied(true)
                    setTimeout(() => setReqCopied(false), 2000)
                  })
                }}
              >
                {reqCopied ? '✅ Copied!' : `📋 Copy tracking code: ${requestId}`}
              </button>
            )}
          </>
        )}

        {/* ── View Conversation link ── */}
        <button
          className="bf-view-convo-btn"
          type="button"
          onClick={() => setShowConversation(!showConversation)}
        >
          {showConversation ? 'Hide WhatsApp exchange ↑' : 'View WhatsApp exchange ↓'}
        </button>

        {/* ── Raw Conversation Sheet ── */}
        {showConversation && (
          <div className="bf-convo-sheet">
            {conversationRaw.length === 0 ? (
              <p className="bf-convo-empty">No messages yet</p>
            ) : (
              conversationRaw.map((msg, i) => (
                <div
                  key={i}
                  className={`bf-wa-bubble bf-wa-bubble-${msg.direction === 'outbound' ? 'out' : 'in'}`}
                >
                  <p className="bf-wa-text">{msg.message}</p>
                  <span className="bf-wa-time">{formatTime(msg.timestamp || Date.now())}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Cancel Button (always visible before receipt, below everything) ── */}
        {!receipt && !cancelled && (
          <div className="bf-cancel-section">
            {showCancelConfirm ? (
              <div className="bf-cancel-confirm-card">
                <p className="bf-cancel-confirm-title">⚠️ Cancel this booking?</p>
                <p className="bf-cancel-confirm-text">
                  The business will be notified about the cancellation. This action cannot be undone.
                </p>
                <div className="bf-cancel-confirm-actions">
                  <button className="bf-btn-danger" type="button" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                  </button>
                  <button className="bf-btn-ghost" type="button" onClick={() => setShowCancelConfirm(false)}>
                    Keep Booking
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="bf-cancel-trigger"
                type="button"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel this booking
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </main>
    </div>
  )
}
