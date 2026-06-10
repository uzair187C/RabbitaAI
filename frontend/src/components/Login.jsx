import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { apiUrl } from '../lib/api'
import './Login.css'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="var(--text-3)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

const STATS = [
  { icon: '🌍', text: 'Active in 47 countries' },
  { icon: '💬', text: '2M+ requests handled' },
  { icon: '⚡', text: 'Average 90 seconds to book' },
]

export default function Login({ onAuthed }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      const res = await fetch(apiUrl('/api/auth/verify'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Backend verification failed')
      const user = await res.json()
      onAuthed(user)
      navigate(user.phone ? '/home' : '/setup', { replace: true })
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.')
      } else if (
        e.code === 'auth/internal-error' ||
        e.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        setError(
          'Firebase Auth is not configured. Enable Google sign-in in the Firebase Console.'
        )
      } else {
        setError(e.message || 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell" id="login-screen">
      {/* Radial glow */}
      <div className="login-glow" aria-hidden="true" />

      {/* Upper hero */}
      <div className="login-hero">
        <div className="login-logo-wrap">
          <span className="login-logo-emoji">🐇</span>
        </div>
        <h1 className="login-brand">RabbitaAI</h1>
        <p className="login-tagline">You type it. We handle it.</p>

        <div className="login-stats">
          {STATS.map(({ icon, text }) => (
            <p key={text} className="login-stat">
              <span>{icon}</span> {text}
            </p>
          ))}
        </div>
      </div>

      {/* Bottom glass card */}
      <div className="login-card">
        <h2 className="login-card-title">Get started</h2>
        <p className="login-card-sub">Book any service, anywhere</p>

        <button
          id="google-signin-btn"
          type="button"
          className="login-google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          aria-label="Continue with Google"
        >
          <span className="login-google-icon">
            {loading ? <Spinner /> : <GoogleIcon />}
          </span>
          <span className="login-google-text">Continue with Google</span>
          <svg className="login-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        {error && (
          <p className="login-error" role="alert">{error}</p>
        )}

        <p className="login-fine-print">🔒 Encrypted · Private · Free to use</p>
      </div>
    </div>
  )
}
