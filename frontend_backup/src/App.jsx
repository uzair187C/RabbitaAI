import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { apiUrl } from './lib/api'
import SplashScreen from './components/SplashScreen'
import Login from './components/Login'
import ProfileSetup from './components/ProfileSetup'
import HomeScreen from './components/HomeScreen'
import RabbitaLogo from './components/icons/RabbitaLogo'
import './App.css'

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setReady(false)
      if (!fbUser) {
        setUser(null)
        setProfile(null)
        setReady(true)
        return
      }
      setUser(fbUser)
      try {
        const token = await fbUser.getIdToken()
        let res = await fetch(apiUrl('/api/user/profile'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          res = await fetch(apiUrl('/api/auth/verify'), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        }
        if (res.ok) setProfile(await res.json())
        else setProfile(null)
      } catch {
        setProfile(null)
      }
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <div className="app-loading" id="app-loading">
        <div className="app-loading-logo">
          <div className="app-loading-glow" />
          <RabbitaLogo size={48} color="var(--brand-primary)" />
        </div>
        <p className="app-loading-brand">RabbitaAI</p>
        <div className="app-loading-dots">
          <div className="app-loading-dot" />
          <div className="app-loading-dot" />
          <div className="app-loading-dot" />
        </div>
      </div>
    )
  }

  const needsSetup = user && !profile?.phone
  const setupUser = profile || {
    name: user?.displayName || user?.email?.split('@')[0] || '',
    email: user?.email,
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={needsSetup ? '/setup' : '/home'} replace />
          ) : (
            <Login onAuthed={(u) => setProfile(u)} />
          )
        }
      />
      <Route
        path="/setup"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : needsSetup ? (
            <ProfileSetup user={setupUser} onComplete={setProfile} />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/home"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : needsSetup ? (
            <Navigate to="/setup" replace />
          ) : (
            <HomeScreen user={profile} />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={!user ? '/login' : needsSetup ? '/setup' : '/home'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashFinish = useCallback(() => setSplashDone(true), [])

  return (
    <BrowserRouter>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      <AppRoutes />
    </BrowserRouter>
  )
}
