import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { apiUrl } from '../lib/api'
import RabbitaLogo from './icons/RabbitaLogo'
import { GoogleLogo, ArrowRight, LockIcon } from './icons/Icons'
import './Login.css'

/**
 * SCREEN 2: Login Screen
 * Apple-inspired centered layout with glass card.
 * Background: layer-1 with subtle radial green gradient.
 * Staggered entry animation: brand section first, card follows.
 */
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
          'Firebase Auth is not enabled. In Firebase Console → Authentication → Get started, then enable Google sign-in.'
        )
      } else {
        setError(e.message || 'Sign-in failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen" id="login-screen">
      {/* Subtle radial gradient background */}
      <div className="login-bg-glow" />

      {/* Brand section — appears first */}
      <div className="login-brand-section screen-enter">
        <div className="login-logo-container">
          <RabbitaLogo size={48} color="var(--brand-primary)" />
        </div>
        <h1 className="login-brand-name">RabbitaAI</h1>
        <p className="login-brand-tagline">Fast connections. Any service.</p>
      </div>

      {/* Glass card — appears with delay */}
      <div className="login-card screen-enter-delay">
        <h2 className="login-card-title">Welcome</h2>
        <p className="login-card-subtitle">Sign in to get started</p>

        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          id="google-signin-button"
        >
          <span className="google-signin-left">
            <GoogleLogo size={20} />
          </span>
          <span className="google-signin-text">
            {loading ? 'Signing in…' : 'Continue with Google'}
          </span>
          <span className="google-signin-arrow">
            <ArrowRight size={16} color="var(--text-40)" />
          </span>
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>

      {/* Fine print */}
      <p className="login-fine-print screen-enter-delay">
        <LockIcon size={10} color="var(--text-40)" />
        <span>Secure sign-in powered by Google</span>
      </p>
    </div>
  )
}
