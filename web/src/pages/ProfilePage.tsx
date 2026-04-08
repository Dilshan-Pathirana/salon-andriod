import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Edit,
  Settings,
  LogOut,
} from 'lucide-react'
import {
  getMyAppointments,
  getMyProfile,
  logoutCurrentSession,
  updateMyProfile,
} from '../lib/api'
import { pageMotionProps } from '../lib/motion'

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function parseTimeToMinutes(timeSlot: string): number {
  const value = timeSlot.trim()
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1])
    const minutes = Number(twelveHourMatch[2])
    const meridiem = twelveHourMatch[3].toUpperCase()

    if (meridiem === 'PM' && hours < 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

function toTimestamp(dateStr: string, timeStr: string): number {
  const date = parseDate(dateStr)
  const minutes = parseTimeToMinutes(timeStr)
  return date.getTime() + minutes * 60_000
}

type ProfileAction = 'appointments' | 'edit' | 'preferences' | null

interface ProfilePageProps {
  onSignedOut: () => void
}

export function ProfilePage({ onSignedOut }: ProfilePageProps) {
  const [activeAction, setActiveAction] = useState<ProfileAction>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [appointments, setAppointments] = useState<Array<{
    id: string
    date: string
    timeSlot: string
    status: string
  }>>([])
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    password: '',
    profileImageUrl: '',
  })
  const [preferences, setPreferences] = useState(() => {
    const raw = localStorage.getItem('salon_preferences')
    if (!raw) {
      return {
        queueAlerts: true,
        appointmentReminders: true,
      }
    }
    try {
      return JSON.parse(raw) as {
        queueAlerts: boolean
        appointmentReminders: boolean
      }
    } catch {
      return {
        queueAlerts: true,
        appointmentReminders: true,
      }
    }
  })

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const user = await getMyProfile()
        const fullName = `${user.firstName} ${user.lastName}`.trim()
        setProfileName(fullName)
        setProfilePhone(user.phoneNumber)
        setEditForm({
          firstName: user.firstName,
          lastName: user.lastName,
          currentPassword: '',
          password: '',
          profileImageUrl: user.profileImageUrl || '',
        })
        setProfileImageUrl(user.profileImageUrl || '')
      } catch {
        setStatusMessage('Unable to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const initials = useMemo(() => {
    if (!profileName.trim()) return 'JW'
    const parts = profileName.trim().split(/\s+/)
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
  }, [profileName])

  const menuItems = [
    {
      icon: CalendarDays,
      label: 'My Appointments',
      action: 'appointments' as const,
    },
    {
      icon: Edit,
      label: 'Edit Profile',
      action: 'edit' as const,
    },
    {
      icon: Settings,
      label: 'Preferences',
      action: 'preferences' as const,
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: 'signout' as const,
    },
  ]

  const handleMenuClick = async (action: (typeof menuItems)[number]['action']) => {
    setStatusMessage('')

    if (action === 'signout') {
      setIsLoading(true)
      try {
        await logoutCurrentSession()
        setAppointments([])
        setActiveAction(null)
        onSignedOut()
      } catch {
        setStatusMessage('Sign out failed')
      } finally {
        setIsLoading(false)
      }
      return
    }

    setActiveAction(action)

    if (action === 'appointments') {
      setIsLoading(true)
      try {
        const rows = await getMyAppointments()
        
        const nowMs = new Date().getTime()
        const mapped = rows.map((row) => ({
          id: row.id,
          date: row.date,
          timeSlot: row.timeSlot,
          status: row.status,
        }))

        mapped.sort((a, b) => {
          const aTime = toTimestamp(a.date, a.timeSlot)
          const bTime = toTimestamp(b.date, b.timeSlot)
          const aIsUpcoming = aTime >= nowMs
          const bIsUpcoming = bTime >= nowMs

          if (aIsUpcoming && !bIsUpcoming) return -1
          if (!aIsUpcoming && bIsUpcoming) return 1

          if (aIsUpcoming && bIsUpcoming) return aTime - bTime
          return bTime - aTime
        })

        setAppointments(mapped)
      } catch {
        setStatusMessage('Could not load appointments from backend')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setStatusMessage('')
    try {
      const payload: {
        firstName?: string
        lastName?: string
        password?: string
        currentPassword?: string
        profileImageUrl?: string | null
      } = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      }

      if (editForm.password.trim()) {
        if (!editForm.currentPassword.trim()) {
          setStatusMessage('Current password is required to change password')
          setIsLoading(false)
          return
        }
        payload.password = editForm.password
        payload.currentPassword = editForm.currentPassword
      }

      payload.profileImageUrl = editForm.profileImageUrl.trim() || null

      const updated = await updateMyProfile(payload)
      setProfileName(`${updated.firstName} ${updated.lastName}`.trim())
      setProfilePhone(updated.phoneNumber)
      setProfileImageUrl(updated.profileImageUrl || '')
      setEditForm((prev) => ({ ...prev, password: '', currentPassword: '', profileImageUrl: updated.profileImageUrl || prev.profileImageUrl }))
      setStatusMessage('Profile updated successfully')
    } catch {
      setStatusMessage('Profile update failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: 'queueAlerts' | 'appointmentReminders') => {
    const next = {
      ...preferences,
      [key]: !preferences[key],
    }
    setPreferences(next)
    localStorage.setItem('salon_preferences', JSON.stringify(next))
    setStatusMessage('Preferences saved')
  }

  return (
    <motion.div {...pageMotionProps} className="px-6 pt-12 pb-32">
      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-5 h-24 w-24 rounded-full bg-gradient-to-b from-primary to-primary-container p-[3px] shadow-[0_10px_30px_rgba(0,108,73,0.18)]"
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-emerald-50">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline text-2xl font-black text-primary">{initials}</span>
            )}
          </div>
        </motion.div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">{profileName || 'Profile'}</h2>
        <p className="text-on-surface-variant text-sm mt-1 font-body">{profilePhone || 'Member'}</p>
      </div>

      {statusMessage ? (
        <div className="mb-6 text-center text-xs text-primary font-label font-bold tracking-wide">{statusMessage}</div>
      ) : null}

      {/* Menu items */}
      <div className="space-y-2">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleMenuClick(item.action)}
            className="w-full bg-surface-container-lowest flex items-center justify-between rounded-2xl px-5 py-4 shadow-[0_4px_20px_rgba(0,108,73,0.03)]"
          >
            <div className="flex items-center gap-4">
              <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <span className="font-label font-bold text-on-surface text-sm">{item.label}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c4a42" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.button>
        ))}
      </div>

      {/* Appointments panel */}
      {activeAction === 'appointments' ? (
        <div className="mt-8 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-on-surface-variant font-body">No appointments found</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-surface-container-lowest rounded-2xl flex items-center justify-between p-5 shadow-[0_4px_20px_rgba(0,108,73,0.04)]"
              >
                <div>
                  <p className="font-label font-bold text-on-surface text-sm">{appointment.date}</p>
                  <p className="text-on-surface-variant text-xs mt-0.5">{appointment.timeSlot}</p>
                </div>
                <span className="font-label font-bold text-xs text-primary uppercase tracking-wider">{appointment.status}</span>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* Edit profile panel */}
      {activeAction === 'edit' ? (
        <div className="mt-8 space-y-3">
          <input className="ds-input" placeholder="First name" value={editForm.firstName} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} />
          <input className="ds-input" placeholder="Last name" value={editForm.lastName} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} />
          <input type="password" className="ds-input" placeholder="Current password (to change password)" value={editForm.currentPassword} onChange={(e) => setEditForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <input type="password" className="ds-input" placeholder="New password (optional)" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} />
          <input className="ds-input" placeholder="Profile image URL" value={editForm.profileImageUrl} onChange={(e) => setEditForm((p) => ({ ...p, profileImageUrl: e.target.value }))} />
          <button onClick={() => void handleSaveProfile()} disabled={isLoading} className="ds-btn-primary disabled:opacity-60">
            Save Profile
          </button>
        </div>
      ) : null}

      {/* Preferences panel */}
      {activeAction === 'preferences' ? (
        <div className="mt-8 space-y-3">
          {([['queueAlerts', 'Queue Alerts'], ['appointmentReminders', 'Appointment Reminders']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handlePreferenceChange(key)}
              className="bg-surface-container-lowest flex w-full items-center justify-between rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,108,73,0.03)]"
            >
              <span className="font-label font-bold text-on-surface text-sm">{label}</span>
              <span className={`font-label font-bold text-xs px-3 py-1 rounded-full ${preferences[key] ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'}`}>
                {preferences[key] ? 'ON' : 'OFF'}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}
