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
    setIsSubmitting(true)
    setMessage('')
    try {
      if (mode === 'login') {
        await loginWithPhone(phoneNumber, password)
      } else {
        await registerClient({ firstName, lastName, phoneNumber, password })
      }
      onAuthSuccess()
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 pt-16 pb-32"
    >
      <h1 className="font-playfair text-3xl text-slate-800 mb-8 text-center">
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </h1>

      <div className="space-y-3">
        {mode === 'signup' ? (
          <>
            <input
              className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </>
        ) : null}

        <input
          className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <input
          type="password"
          className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold disabled:opacity-60"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <button
          onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
          className="w-full py-2 text-emerald-600 text-xs tracking-wider"
        >
          {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>

        {message ? <p className="text-center text-xs text-emerald-600">{message}</p> : null}
      </div>
    </motion.div>
  )
}
