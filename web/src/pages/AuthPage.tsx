import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { loginWithPhone, registerClient } from '../lib/api'

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-6"
    >
      <h1 className="font-sans font-semibold tracking-tight text-3xl text-slate-800 mb-6 text-center">
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </h1>

      <div className="space-y-3 rounded-2xl border border-teal-100/60 bg-white p-4 shadow-sm">
        {mode === 'signup' ? (
          <>
            <input
              className="w-full bg-white border border-teal-100 rounded-xl p-3 text-sm text-slate-800"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              className="w-full bg-white border border-teal-100 rounded-xl p-3 text-sm text-slate-800"
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </>
        ) : null}

        <input
          className="w-full bg-white border border-teal-100 rounded-xl p-3 text-sm text-slate-800"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <input
          type="password"
          className="w-full bg-white border border-teal-100 rounded-xl p-3 text-sm text-slate-800"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-xs tracking-wide uppercase font-semibold disabled:opacity-60"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <button
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
          className="w-full py-2 text-teal-700 text-xs tracking-wide font-medium"
        >
          {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>

        {message ? <p className="text-center text-xs text-rose-600">{message}</p> : null}
      </div>
    </motion.div>
  )
}
