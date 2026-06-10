import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { auth } from '../firebase'
import { apiUrl } from '../lib/api'
import { ArrowLeft } from './icons/Icons'
import ReceiptScreen from './ReceiptScreen'
import './BookingFeed.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

function formatTime(ts) {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function mapConversationEntry(entry, index) {
  return {
    id: `${entry.timestamp}-${index}`,
    type: entry.direction === 'outbound' ? 'outbound' : 'inbound',
    text: entry.message,
    time: formatTime(entry.timestamp),
    sentBy: entry.sentBy,
  }
}

export default function BookingFeed({
  requestId,
  provider,
  initialMessage,
  onBack,
}) {
  const [messages, setMessages] = useState(() => {
    if (initialMessage) {
      return [{
        id: 'initial-outbound',
        type: 'outbound',
        text: initialMessage,
        time: formatTime(new Date()),
        sentBy: 'ai',
      }]
    }
    return []
  })
  const [status, setStatus] = useState('booking')
  const [waitingForReply, setWaitingForReply] = useState(true)
  const [requiresUserInput, setRequiresUserInput] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const messagesEndRef = useRef(null)

  const providerName = provider?.name || 'Provider'

  const appendMessage = useCallback((data) => {
    setMessages((prev) => {
      if (prev.some((m) => m.text === data.message && m.type === (data.direction === 'outbound' ? 'outbound' : 'inbound'))) {
        return prev
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          type: data.direction === 'outbound' ? 'outbound' : 'inbound',
          text: data.message,
          time: formatTime(data.timestamp || new Date()),
          sentBy: data.sentBy || (data.direction === 'outbound' ? 'ai' : undefined),
        },
      ]
    })

    if (data.direction === 'inbound') {
      setWaitingForReply(false)
    } else if (data.direction === 'outbound') {
      setWaitingForReply(true)
    }

    if (data.requiresUserInput) {
      setRequiresUserInput(true)
      setUserPrompt(data.userPrompt || data.message || '')
    } else if (data.direction === 'outbound' && data.sentBy === 'user') {
      setRequiresUserInput(false)
      setUserPrompt('')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, requiresUserInput, waitingForReply])

  useEffect(() => {
    if (!requestId) return undefined

    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] })

    socket.on('connect', () => {
      socket.emit('join-request', requestId)
    })

    socket.on('conversation-update', (data) => {
      appendMessage(data)
    })

    socket.on('booking-confirmed', (receiptData) => {
      setReceipt(receiptData)
      setStatus('confirmed')
      setWaitingForReply(false)
      setRequiresUserInput(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [requestId, appendMessage])

  useEffect(() => {
    if (!requestId) return

    async function loadExisting() {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) return
        const token = await currentUser.getIdToken()
        const res = await fetch(apiUrl(`/api/requests/${requestId}`), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setStatus(data.status || 'booking')

        if (data.conversation?.length) {
          setMessages(data.conversation.map(mapConversationEntry))
          const hasInbound = data.conversation.some((m) => m.direction === 'inbound')
          setWaitingForReply(!hasInbound && data.status === 'booking')
        }

        if (data.requiresUserInput && data.userPrompt) {
          setRequiresUserInput(true)
          setUserPrompt(data.userPrompt)
        }

        if (data.status === 'confirmed' && data.receipt) {
          setReceipt({
            requestId: data.receipt.requestId || data.requestId,
            service: data.receipt.serviceType,
            provider: data.receipt.providerName,
            time: data.receipt.scheduledTime,
            location: data.receipt.userArea,
          })
        }
      } catch (e) {
        console.warn('Could not load conversation:', e.message)
      }
    }

    loadExisting()
  }, [requestId])

  async function handleSubmitReply() {
    if (!replyText.trim() || sendingReply) return
    setSendingReply(true)
    setRequiresUserInput(false)

    try {
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(apiUrl(`/api/requests/${requestId}/reply`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userReply: replyText.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send reply')
      }

      setReplyText('')
      setUserPrompt('')
      setWaitingForReply(true)
    } catch (err) {
      console.error(err)
      setRequiresUserInput(true)
      setUserPrompt(userPrompt || 'Please try again')
    } finally {
      setSendingReply(false)
    }
  }

  if (receipt) {
    return <ReceiptScreen receipt={receipt} onBackHome={onBack} />
  }

  const showTyping = status === 'booking' && waitingForReply && !requiresUserInput

  return (
    <div className="feed-screen" id="booking-feed-screen">
      <header className="feed-header" style={{ background: '#1A2E25' }}>
        <button className="feed-back-btn" onClick={onBack} type="button" aria-label="Go back">
          <ArrowLeft size={20} color="var(--text-100)" />
        </button>
        <div className="feed-header-info">
          <div className="feed-header-top">
            <span className="feed-live-dot" />
            <span className="feed-provider-name">{providerName}</span>
          </div>
          <span className="feed-header-sub">via WhatsApp</span>
        </div>
        <span className="feed-req-id mono">{requestId}</span>
      </header>

      <main className="feed-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`feed-msg feed-msg-${msg.type}`}>
            <div className={`feed-bubble feed-bubble-${msg.type}`}>
              <p className="feed-bubble-text">{msg.text}</p>
            </div>
            <div className="feed-msg-meta">
              <span className="feed-msg-time">{msg.time}</span>
              {msg.type === 'outbound' && (
                <span className="feed-msg-sender">
                  {msg.sentBy === 'user' ? 'You' : 'RabbitaAI sent'}
                </span>
              )}
            </div>
          </div>
        ))}

        {showTyping && (
          <div className="feed-msg feed-msg-inbound">
            <div className="feed-bubble feed-bubble-inbound feed-typing-bubble">
              <div className="typing-dots">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {requiresUserInput && (
          <div className="feed-hitl-card">
            <span className="feed-hitl-label caps-label">YOUR INPUT NEEDED</span>
            <p className="feed-hitl-context">The provider is asking:</p>
            <p className="feed-hitl-question"><strong>{userPrompt}</strong></p>
            <div className="feed-hitl-input-wrapper">
              <input
                type="text"
                className="feed-hitl-input"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
              />
            </div>
            <button
              className="btn-primary feed-hitl-btn"
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || sendingReply}
              type="button"
            >
              {sendingReply ? 'Sending...' : 'Submit'}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>
    </div>
  )
}
