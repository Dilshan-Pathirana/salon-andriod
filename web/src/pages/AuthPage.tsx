import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { loginWithPhone, registerClient } from '../lib/api'
import { pageMotionProps } from '../lib/motion'

interface AuthPageProps {
  onAuthSuccess: () => void
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setMessage('')

    // Client-side validation before hitting the network
    const trimmedPhone = phoneNumber.trim()
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()

    if (!trimmedPhone || !password) {
      setMessage('Phone number and password are required.')
      return
    }
    if (!/^\d{10,15}$/.test(trimmedPhone)) {
      setMessage('Phone number must be 10–15 digits (digits only).')
      return
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.')
      return
    }
    if (mode === 'signup') {
      if (!trimmedFirst || !trimmedLast) {
        setMessage('First and last name are required.')
        return
      }
      if (trimmedFirst.length > 50 || trimmedLast.length > 50) {
        setMessage('Name fields must be 50 characters or fewer.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await loginWithPhone(trimmedPhone, password)
      } else {
        await registerClient({ firstName: trimmedFirst, lastName: trimmedLast, phoneNumber: trimmedPhone, password })
      }
      onAuthSuccess()
    } catch (error: unknown) {
      // Only surface safe, user-facing messages — never raw server internals
      const serverMsg: string =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? ''
      const isUserFacing =
        serverMsg.length > 0 &&
        serverMsg.length < 120 &&
        !serverMsg.toLowerCase().includes('cast') &&
        !serverMsg.toLowerCase().includes('validation error') &&
        !serverMsg.toLowerCase().includes('mongod') &&
        !serverMsg.toLowerCase().includes('duplicate key')
      setMessage(isUserFacing ? serverMsg : mode === 'login' ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div {...pageMotionProps} className="min-h-screen flex flex-col px-6 pt-16 pb-12">
      {/* Brand */}
      <div className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-black text-emerald-900 tracking-widest uppercase">Lumina</h1>
        <p className="text-on-surface-variant text-sm mt-2 font-body">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,108,73,0.05)] space-y-4">
        {mode === 'signup' ? (
          <>
            <input
              className="ds-input"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              className="ds-input"
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </>
        ) : null}

        <input
          className="ds-input"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <input
          type="password"
          className="ds-input"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="ds-btn-primary disabled:opacity-60 mt-2"
        >
          {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {message ? <p className="text-center text-xs text-red-500 font-body">{message}</p> : null}
      </div>

      {/* Mode toggle */}
      <button
        onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
        className="mt-6 w-full py-3 text-sm font-label font-bold text-primary tracking-wide"
      >
        {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
      </button>
    </motion.div>
  )
}
