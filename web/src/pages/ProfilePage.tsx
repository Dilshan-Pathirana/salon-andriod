import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Edit,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import {
  getMyAppointments,
  getMyProfile,
  logoutCurrentSession,
  updateMyProfile,
} from '../lib/api'

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
        profileImageUrl?: string | null
      } = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      }

      if (editForm.password.trim()) {
        payload.password = editForm.password
      }

      payload.profileImageUrl = editForm.profileImageUrl.trim() || null

      const updated = await updateMyProfile(payload)
      setProfileName(`${updated.firstName} ${updated.lastName}`.trim())
      setProfilePhone(updated.phoneNumber)
      setProfileImageUrl(updated.profileImageUrl || '')
      setEditForm((prev) => ({ ...prev, password: '', profileImageUrl: updated.profileImageUrl || prev.profileImageUrl }))
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
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="px-6 pt-16 pb-32"
    >
      <div className="flex flex-col items-center mb-16">
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-b from-emerald-500 to-teal-100 mb-6"
        >
          <div className="w-full h-full rounded-full bg-teal-50 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-noise" />
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-sans font-semibold tracking-tight text-3xl text-emerald-600">
                {initials}
              </span>
            )}
          </div>
        </motion.div>

        <motion.h2
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="font-sans font-semibold tracking-tight text-2xl text-slate-800 mb-2"
        >
          {profileName || 'Profile'}
        </motion.h2>
        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="font-inter text-sm text-slate-400"
        >
          {profilePhone || 'Member profile'}
        </motion.p>
      </div>

      {statusMessage ? (
        <div className="mb-6 text-center font-inter text-xs text-emerald-600 tracking-wide">
          {statusMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4 + idx * 0.1,
            }}
            whileTap={{
              scale: 0.98,
              backgroundColor: 'rgba(54, 68, 66, 0.3)',
            }}
            onClick={() => void handleMenuClick(item.action)}
            className="w-full flex items-center justify-between py-5 border-b border-teal-100/30 group"
          >
            <div className="flex items-center space-x-4">
              <item.icon
                className="w-5 h-5 text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity"
                strokeWidth={1.5}
              />
              <span className="font-inter text-base text-slate-800 font-light tracking-wide">
                {item.label}
              </span>
            </div>
            <ChevronRight
              className="w-5 h-5 text-slate-400/50 group-hover:text-emerald-600 transition-colors"
              strokeWidth={1}
            />
          </motion.button>
        ))}
      </div>

      {activeAction === 'appointments' ? (
        <div className="mt-8 space-y-3">
          {isLoading ? (
            <p className="font-inter text-sm text-slate-400">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="font-inter text-sm text-slate-400">No appointments found</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-teal-100/40 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-inter text-sm text-slate-800">{appointment.date}</p>
                  <p className="font-inter text-xs text-slate-400">{appointment.timeSlot}</p>
                </div>
                <span className="font-inter text-xs text-emerald-600 tracking-wider">
                  {appointment.status}
                </span>
              </div>
            ))
          )}
        </div>
      ) : null}

      {activeAction === 'edit' ? (
        <div className="mt-8 space-y-3">
          <input
            className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
            placeholder="First name"
            value={editForm.firstName}
            onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
          />
          <input
            className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
            placeholder="Last name"
            value={editForm.lastName}
            onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
          />
          <input
            type="password"
            className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
            placeholder="New password (optional)"
            value={editForm.password}
            onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <input
            className="w-full bg-white border border-teal-100/40 rounded-lg p-3 text-sm text-slate-800"
            placeholder="Profile image URL"
            value={editForm.profileImageUrl}
            onChange={(event) => setEditForm((prev) => ({ ...prev, profileImageUrl: event.target.value }))}
          />
          <button
            onClick={() => void handleSaveProfile()}
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 text-white rounded-lg text-xs tracking-widest uppercase font-semibold disabled:opacity-60"
          >
            Save Profile
          </button>
        </div>
      ) : null}

      {activeAction === 'preferences' ? (
        <div className="mt-8 space-y-3">
          <button
            onClick={() => handlePreferenceChange('queueAlerts')}
            className="w-full border border-teal-100/40 rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-inter text-sm text-slate-800">Queue Alerts</span>
            <span className="font-inter text-xs text-emerald-600 tracking-wider">
              {preferences.queueAlerts ? 'ON' : 'OFF'}
            </span>
          </button>
          <button
            onClick={() => handlePreferenceChange('appointmentReminders')}
            className="w-full border border-teal-100/40 rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-inter text-sm text-slate-800">Appointment Reminders</span>
            <span className="font-inter text-xs text-emerald-600 tracking-wider">
              {preferences.appointmentReminders ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}
